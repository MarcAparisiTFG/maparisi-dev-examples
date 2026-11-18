#!/bin/sh
# Ejecuta el ejemplo: ./ejecutar.sh
set -e
cd "$(dirname "$0")"
echo "Cuando arranque: curl localhost:8000/productos · Para parar: Ctrl+C y docker compose down --rmi local"
exec docker compose up --build
