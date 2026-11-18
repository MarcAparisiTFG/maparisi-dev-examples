"""El grafo: buscar (RAG) → llm → ¿herramienta? → llm → fin."""
import os

from dotenv import load_dotenv
from langchain_core.messages import AIMessage, SystemMessage, ToolMessage
from langchain_core.tools import tool
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition

from rag import buscar_trozos

load_dotenv()  # lee ANTHROPIC_API_KEY de .env si existe (copia .env.example a .env)


class Estado(MessagesState):
    contexto: list[str]


@tool
def disponibilidad(dia: int) -> str:
    """Habitaciones libres un día de noviembre. Consulta la base de datos de reservas en vivo."""
    libres = {12: 3, 13: 0}.get(dia, 5)  # aquí iría tu SELECT a la tabla de reservas
    return f"Hay {libres} habitaciones libres el {dia} de noviembre"


def buscar(estado: Estado):
    pregunta = estado["messages"][-1].content
    return {"contexto": [texto for texto, _ in buscar_trozos(pregunta)]}


if os.environ.get("ANTHROPIC_API_KEY"):
    from langchain.chat_models import init_chat_model

    modelo = init_chat_model("anthropic:claude-sonnet-5-5").bind_tools([disponibilidad])

    def llm(estado: Estado):
        instrucciones = SystemMessage("Eres el asistente del hotel. Responde con esta información:\n" + "\n".join(estado["contexto"]))
        return {"messages": [modelo.invoke([instrucciones] + estado["messages"])]}
else:
    # Sin clave de API: un modelo simulado que se comporta igual (pide la herramienta o responde con el contexto).
    def llm(estado: Estado):
        ultimo = estado["messages"][-1]
        if isinstance(ultimo, ToolMessage):
            return {"messages": [AIMessage(ultimo.content)]}
        if "libre" in ultimo.content.lower():
            return {"messages": [AIMessage("", tool_calls=[{"name": "disponibilidad", "args": {"dia": 12}, "id": "llamada-1"}])]}
        return {"messages": [AIMessage(estado["contexto"][0])]}


g = StateGraph(Estado)
g.add_node("buscar", buscar)
g.add_node("llm", llm)
g.add_node("herramientas", ToolNode([disponibilidad]))
g.add_edge(START, "buscar")
g.add_edge("buscar", "llm")
g.add_conditional_edges("llm", tools_condition, {"tools": "herramientas", END: END})
g.add_edge("herramientas", "llm")
grafo = g.compile()
