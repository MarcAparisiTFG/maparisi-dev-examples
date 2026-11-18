#!/bin/sh
# OFFSET frente a cursor en PostgreSQL 18 (Docker), 2.000.000 de pedidos. Medido el 2026-11-02.
# Uso: sh postgres.sh   (necesita Docker abierto; el contenedor se borra al acabar)
set -e
docker run -d --rm --name pag-pg -e POSTGRES_PASSWORD=demo postgres:18 >/dev/null
until docker exec pag-pg pg_isready -U postgres >/dev/null 2>&1; do sleep 2; done; sleep 3
docker exec -i pag-pg psql -U postgres -q -v ON_ERROR_STOP=1 <<'SQL'
create table pedidos(id bigint primary key, cliente text, total numeric(10,2), creado timestamptz);
insert into pedidos select i, 'cliente ' || (1 + (i::bigint * 7919) % 50000), round(((i::bigint * 37) % 30000) / 100.0, 2), timestamptz '2024-01-01' + make_interval(secs => i * 7)
  from generate_series(1, 2000000) i;
create index idx_creado on pedidos(creado desc, id desc);
vacuum analyze pedidos;
SQL
# Mejor de 5 «Execution Time» de EXPLAIN ANALYZE para cada consulta (tras 2 ejecuciones de calentamiento).
q() { docker exec pag-pg psql -U postgres -tAc "$1"; }
best() {
  for w in 1 2; do q "explain analyze $1" >/dev/null; done
  for k in 1 2 3 4 5; do q "explain analyze $1" | awk '/Execution Time/{print $3}'; done | sort -n | head -1
}
O='order by creado desc, id desc limit 20'
for p in 1 5000 50000; do
  off=$(( (p - 1) * 20 ))
  echo "OFFSET pág $p (offset $off): $(best "select * from pedidos $O offset $off") ms"
  cur=$(q "select creado || '|' || id from pedidos $O offset $(( off - 1 < 0 ? 0 : off - 1 ))" | head -1)
  if [ $p -gt 1 ]; then
    c=${cur%|*}; i=${cur#*|}
    echo "CURSOR pág $p: $(best "select * from pedidos where (creado, id) < ('$c', $i) $O") ms"
  fi
done
echo "--- plan OFFSET 999980"; q "explain (analyze, buffers) select * from pedidos $O offset 999980" | head -6
last=$(q "select creado || '|' || id from pedidos $O offset 999979" | head -1); c=${last%|*}; i=${last#*|}
echo "--- plan CURSOR pág 50000"; q "explain (analyze, buffers) select * from pedidos where (creado, id) < ('$c', $i) $O" | head -6
echo "--- ids iguales:"; q "select min(id), max(id) from (select id from pedidos $O offset 999980) s"; q "select min(id), max(id) from (select id from pedidos where (creado, id) < ('$c', $i) $O) s"
docker stop pag-pg >/dev/null
