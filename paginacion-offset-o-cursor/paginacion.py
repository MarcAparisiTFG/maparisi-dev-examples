"""OFFSET frente a cursor (keyset) en SQLite con 2.000.000 de pedidos. Probado el 2026-10-30 (SQLite 3.54.1).

    python3 paginacion.py

Crea pag.db en la carpeta actual (unos 200 MB), mide la página 1, la 5.000 y la 50.000 con OFFSET y la 50.000 por cursor,
enseña los planes de ejecución y reproduce el pedido repetido al insertar entre páginas."""
import datetime, os, random, sqlite3, time

db = 'pag.db'
if os.path.exists(db):
    os.remove(db)
c = sqlite3.connect(db)
c.execute('create table pedidos(id integer primary key, cliente text, total real, creado text)')
base = datetime.datetime(2024, 1, 1)
random.seed(1)
c.executemany('insert into pedidos(cliente,total,creado) values(?,?,?)',
              ((f'cliente {random.randint(1, 50000)}', round(random.random() * 300, 2),
                (base + datetime.timedelta(seconds=i * 7)).isoformat()) for i in range(2_000_000)))
c.execute('create index idx_creado on pedidos(creado desc, id desc)')
c.commit()


def medir(q, p=(), n=5):
    mejor = 1e9
    for _ in range(n):
        s = time.perf_counter()
        filas = c.execute(q, p).fetchall()
        mejor = min(mejor, time.perf_counter() - s)
    return f'{mejor * 1000:.3f} ms  (ids {filas[0][0]}…{filas[-1][0]})'


orden = 'order by creado desc, id desc limit 20'
print('OFFSET pág 1      ', medir(f'select * from pedidos {orden} offset 0'))
print('OFFSET pág 5.000  ', medir(f'select * from pedidos {orden} offset 99980'))
print('OFFSET pág 50.000 ', medir(f'select * from pedidos {orden} offset 999980'))
ultimo = c.execute('select creado, id from pedidos order by creado desc, id desc limit 1 offset 999979').fetchone()
print('CURSOR pág 50.000 ', medir(f'select * from pedidos where (creado, id) < (?, ?) {orden}', ultimo))
print('plan OFFSET:', c.execute(f'explain query plan select * from pedidos {orden} offset 999980').fetchall()[0][3])
print('plan CURSOR:', c.execute(f'explain query plan select * from pedidos where (creado, id) < (?, ?) {orden}', ultimo).fetchall()[0][3])

c.execute('create table posts(id integer primary key, titulo text)')
c.executemany('insert into posts(titulo) values(?)', [(f'post {i}',) for i in range(1, 8)])
pag1 = [r[0] for r in c.execute('select titulo from posts order by id desc limit 3')]
c.execute("insert into posts(titulo) values('post 8 (nuevo)')")
pag2_offset = [r[0] for r in c.execute('select titulo from posts order by id desc limit 3 offset 3')]
pag2_cursor = [r[0] for r in c.execute('select titulo from posts where id < 5 order by id desc limit 3')]
print('página 1:', pag1, '| entra post 8 | página 2 con OFFSET:', pag2_offset, '| con cursor:', pag2_cursor)
