#!/bin/sh
# Ejecuta el ejemplo: ./ejecutar.sh
set -e
cd "$(dirname "$0")"
[ -d node_modules ] || npm install --silent
echo "== Variable normal frente a useState, useEffect y un hook propio"; npm run -s carrito
echo; echo "== Un useState dentro de un if (los errores de React son a propósito)"; npm run -s prueba 2>&1 | grep -E "^logueado|^Error" || true
echo; echo "== ESLint lo detecta antes de ejecutar"; npm run -s lint || true
