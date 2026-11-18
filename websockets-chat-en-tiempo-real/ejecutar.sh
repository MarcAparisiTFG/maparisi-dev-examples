#!/bin/sh
# Ejecuta el ejemplo: ./ejecutar.sh
set -e
cd "$(dirname "$0")"
[ -d node_modules ] || npm install --silent
echo "Abre en dos pestañas: http://localhost:4010/?yo=Ana y http://localhost:4010/?yo=Marc"
exec npm start --silent
