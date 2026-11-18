"""FastAPI: mira Redis primero; si no está, llama al grafo y guarda la respuesta si no dependía de datos en vivo."""
import redis
from fastapi import FastAPI
from langchain_core.messages import HumanMessage, ToolMessage
from pydantic import BaseModel

from grafo import grafo

r = redis.Redis(decode_responses=True)
app = FastAPI()


class Pregunta(BaseModel):
    texto: str


@app.post("/chat")
def chat(p: Pregunta):
    clave = "chat:" + p.texto.strip(" ¿?").lower()

    guardada = r.get(clave)
    if guardada:
        return {"respuesta": guardada, "de": "redis"}

    final = grafo.invoke({"messages": [HumanMessage(p.texto)]})
    respuesta = final["messages"][-1].content

    uso_herramienta = any(isinstance(m, ToolMessage) for m in final["messages"])
    if not uso_herramienta:
        r.set(clave, respuesta, ex=3600)  # caduca en 1 hora

    return {"respuesta": respuesta, "de": "grafo"}
