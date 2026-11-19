#!/bin/sh
# Ejecuta el ejemplo: ./ejecutar.sh
set -e
cd "$(dirname "$0")"
# Abre la tienda en Chrome sin interfaz, sin bloqueador y con él, y enseña qué peticiones se cancelan y qué se oculta.
[ -d node_modules ] || npm install --silent
node bloquear.mjs
