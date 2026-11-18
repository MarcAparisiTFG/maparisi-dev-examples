#!/bin/sh
# Ejecuta el ejemplo: ./ejecutar.sh
set -e
cd "$(dirname "$0")"
# ./ejecutar.sh           → SQLite (solo Python)
# ./ejecutar.sh postgres  → PostgreSQL 18 en Docker
if [ "$1" = postgres ]; then exec sh postgres.sh; fi
python3 paginacion.py
rm -f pag.db
