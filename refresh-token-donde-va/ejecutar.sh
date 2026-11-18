#!/bin/sh
# Ejecuta el ejemplo: ./ejecutar.sh
set -e
cd "$(dirname "$0")"
# Arranca el servidor con el access token a 2 s (en vez de 5 min), hace la prueba y lo para.
ACCESS_SECONDS=2 node server.mjs & SERVIDOR=$!
trap "kill $SERVIDOR" EXIT
sleep 1
sh prueba.sh
