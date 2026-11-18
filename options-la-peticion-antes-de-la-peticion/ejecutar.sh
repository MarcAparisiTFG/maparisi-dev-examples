#!/bin/sh
# Ejecuta el ejemplo: ./ejecutar.sh
set -e
cd "$(dirname "$0")"
echo "Abre http://localhost:8787 con las DevTools en la pestaña Red · lo que llega a la API: log.txt"
exec node server.mjs
