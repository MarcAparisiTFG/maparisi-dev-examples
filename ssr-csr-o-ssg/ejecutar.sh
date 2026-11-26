#!/bin/sh
# Ejecuta el ejemplo: ./ejecutar.sh        → la tienda en CSR, SSR y SSG (Node, sin instalar nada)
#                     ./ejecutar.sh next   → la misma idea en Next.js (instala Next la primera vez)
set -e
cd "$(dirname "$0")"
if [ "$1" = "next" ]; then
  cd next
  [ -d node_modules ] || npm install --no-audit --no-fund
  NEXT_TELEMETRY_DISABLED=1 npx next build
  echo
  echo "Prueba: curl localhost:3010/producto  (ya montada, con el stock de ahora)"
  echo "        curl localhost:3010/rompe     (localStorage en el servidor → 500)"
  exec env NEXT_TELEMETRY_DISABLED=1 npx next start -p 3010
fi
echo "Prueba: curl localhost:8795/csr · /ssr · /ssg (o ábrelas en el navegador)"
exec node server.mjs
