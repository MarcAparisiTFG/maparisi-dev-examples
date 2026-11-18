#!/bin/sh
# Ejecuta el ejemplo: ./ejecutar.sh
set -e
cd "$(dirname "$0")"
echo "Prueba: curl localhost:8795/csr · /ssr · /ssg (o ábrelas en el navegador)"
exec node server.mjs
