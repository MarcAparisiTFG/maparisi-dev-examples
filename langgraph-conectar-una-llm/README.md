# Chatbot con FastAPI, Redis, RAG y LangGraph

📺 [Ver el vídeo](https://youtube.com/shorts/cYuNl0_w83o)

Por dónde pasa una pregunta en un chatbot real: la web llama a FastAPI, FastAPI mira en Redis si ya tiene la respuesta y, si no, LangGraph busca los textos parecidos (RAG), se los pasa a la LLM y, si hace falta, llama a una herramienta.

## Ejecutar

```bash
./ejecutar.sh
```

Necesitas Docker y Python entre la 3.10 y la 3.14. Arranca Redis en Docker, instala las dependencias en un `venv`, guarda los textos del hotel como vectores (la primera vez descarga un modelo de unos 220 MB) y levanta la API en el puerto 8765. En otra terminal:

```bash
curl -X POST localhost:8765/chat -H 'Content-Type: application/json' -d '{"texto": "¿A qué hora es el check-in?"}'
```

Repite la pregunta y verás `"de": "redis"`: ya no pasa por el grafo. Prueba también `"¿Hay habitación libre el 12?"`, que usa la herramienta. Al acabar: `docker rm -f redis-langgraph`.

**Clave de API (opcional).** Sin clave, el paso de la LLM está simulado y el ejemplo funciona igual. Para usar Claude de verdad, pon tu clave en `.env` (se crea a partir de `.env.example` y nunca se sube) e instala `./venv/bin/pip install "langchain[anthropic]"`. Esa parte no la he probado.

## Qué mirar en el código

- `rag.py`: seis textos del hotel → vectores de 384 números → índice en Redis. `buscar_trozos()` devuelve los más cercanos a la pregunta.
- `grafo.py`: `buscar` → `llm` → si pide la herramienta `disponibilidad`, la ejecuta y vuelve a `llm`; si no, termina.
- `api.py`: mira Redis primero; si no está, llama al grafo y guarda la respuesta una hora, salvo que haya usado una herramienta (son datos en vivo).
- `demo.py`: el grafo más pequeño posible, sin RAG ni Redis.
