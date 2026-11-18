#!/bin/sh
# Ejecuta el ejemplo de un vídeo: ./ejecutar.sh <carpeta>
cd "$(dirname "$0")"
if [ -z "$1" ] || [ ! -x "$1/ejecutar.sh" ]; then
  echo "Uso: ./ejecutar.sh <carpeta>"
  echo
  for d in */ejecutar.sh; do echo "  ${d%/ejecutar.sh}"; done
  exit 1
fi
carpeta=$1; shift
exec "./$carpeta/ejecutar.sh" "$@"
