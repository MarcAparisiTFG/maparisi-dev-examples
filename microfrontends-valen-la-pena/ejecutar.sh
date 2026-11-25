#!/bin/sh
# Ejecuta el ejemplo: ./ejecutar.sh
set -e
cd "$(dirname "$0")"
# Construye las tres zonas (cada una con su propio React), abre la contenedora en Chrome sin interfaz
# y apunta qué descarga, qué pasa al subir comentarios v2 y qué se rompe al renombrar el evento.
# Para verla tú en el navegador: npm run web y abre http://localhost:4000
[ -d node_modules ] || npm install --silent
node medir.mjs
