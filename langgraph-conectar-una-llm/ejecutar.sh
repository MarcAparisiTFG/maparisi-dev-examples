#!/bin/sh
# Ejecuta el ejemplo: ./ejecutar.sh
set -e
cd "$(dirname "$0")"
[ -f .env ] || cp .env.example .env   # pon tu ANTHROPIC_API_KEY en .env (opcional)
docker start redis-langgraph >/dev/null 2>&1 || docker run -d --name redis-langgraph -p 6379:6379 redis:8 >/dev/null
# fastembed todavía no se instala en Python 3.15: busca una versión entre la 3.10 y la 3.14.
for p in python3 python3.14 python3.13 python3.12 python3.11 python3.10; do
  command -v $p >/dev/null && $p -c 'import sys; sys.exit(not (3, 10) <= sys.version_info[:2] <= (3, 14))' && PY=$p && break
done
[ -n "$PY" ] || { echo "Necesitas Python entre la 3.10 y la 3.14 (fastembed aún no va en versiones más nuevas)."; exit 1; }
[ -d venv ] || $PY -m venv venv
./venv/bin/pip install -q -r requirements.txt
./venv/bin/python rag.py
echo
echo "Pregunta en otra terminal:"
echo "  curl -X POST localhost:8765/chat -H \"Content-Type: application/json\" -d '{\"texto\": \"¿A qué hora es el check-in?\"}'"
echo "Al acabar: Ctrl+C y docker rm -f redis-langgraph"
exec ./venv/bin/uvicorn api:app --port 8765
