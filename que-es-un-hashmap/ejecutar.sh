#!/bin/sh
# Ejecuta el ejemplo: ./ejecutar.sh
set -e
cd "$(dirname "$0")"
exec node hashmap.mjs
