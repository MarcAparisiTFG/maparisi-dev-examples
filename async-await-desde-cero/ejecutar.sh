#!/bin/sh
# Ejecuta el ejemplo: ./ejecutar.sh
set -e
cd "$(dirname "$0")"
echo "Abre http://localhost:4321 · En otra terminal: node medir.mjs"
exec node server.mjs
