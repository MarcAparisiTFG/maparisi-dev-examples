#!/bin/sh
# Ejecuta el ejemplo: ./ejecutar.sh
set -e
cd "$(dirname "$0")"
node probar.mjs
echo
echo "Para verlo y tocarlo, abre index.html en el navegador y marca «Ver zonas invisibles»."
