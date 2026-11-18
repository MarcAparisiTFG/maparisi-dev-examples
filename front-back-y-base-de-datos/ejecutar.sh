#!/bin/sh
# Ejecuta el ejemplo: ./ejecutar.sh
set -e
cd "$(dirname "$0")"
echo "Abre http://localhost:4322 y pulsa «Mis pedidos»"
exec node server.mjs
