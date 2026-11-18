from typing import TypedDict, Literal
from langgraph.graph import StateGraph, START, END

class Estado(TypedDict):
    pregunta: str
    respuesta: str
    usar_herramienta: bool

def llm(estado: Estado):
    # aquí iría la llamada al modelo; decide si necesita datos
    necesita = "habitación" in estado["pregunta"].lower() and estado["respuesta"] == ""
    return {"usar_herramienta": necesita, "respuesta": estado["respuesta"] or "pensando…"}

def herramienta(estado: Estado):
    return {"respuesta": "Hay 3 habitaciones libres el 12 de noviembre"}

def decidir(estado: Estado) -> Literal["herramienta", END]:
    return "herramienta" if estado["usar_herramienta"] else END

g = StateGraph(Estado)
g.add_node("llm", llm)
g.add_node("herramienta", herramienta)
g.add_edge(START, "llm")
g.add_conditional_edges("llm", decidir, ["herramienta", END])
g.add_edge("herramienta", "llm")
app = g.compile()

for paso in app.stream({"pregunta": "¿Hay habitación libre el 12?", "respuesta": "", "usar_herramienta": False}):
    print(paso)
print(app.get_graph().draw_ascii())
