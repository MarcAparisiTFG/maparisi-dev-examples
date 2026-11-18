#!/bin/sh
# Ejecuta el ejemplo: ./ejecutar.sh
set -e
cd "$(dirname "$0")"
echo "Filtros en la URL:      http://localhost:8794/"
echo "Filtros en una variable: http://localhost:8794/estado.html"
exec python3 -m http.server 8794
