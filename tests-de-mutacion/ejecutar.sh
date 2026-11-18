#!/bin/sh
# Ejecuta el ejemplo: ./ejecutar.sh
set -e
cd "$(dirname "$0")"
[ -d node_modules ] || npm install --silent
echo "== Test débil: 100 % de cobertura…"; npx vitest run --config vitest.debil.config.js --coverage 2>&1 | grep -E "^(Statements|Branches|Functions|Lines)"
echo; echo "== …pero casi todos los mutantes sobreviven"; npm run -s mutar:debil 2>&1 | grep -E "^(File|All files|-)" || true
echo; echo "== Con los tests buenos"; npm run -s mutar 2>&1 | grep -E "^(File|All files|-)" || true
