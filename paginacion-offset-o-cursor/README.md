# Paginación: OFFSET o cursor, cuál usar y por qué

📺 [Ver el vídeo](https://youtube.com/shorts/JuuxXfTsxnQ)

Con `OFFSET` la base de datos lee y tira todas las filas que se salta, así que la página 50.000 es lentísima. Con un cursor (`WHERE (creado, id) < (...)`) va directa por el índice y tarda lo mismo en cualquier página.

## Ejecutar

```bash
./ejecutar.sh             # SQLite, solo necesitas Python 3
./ejecutar.sh postgres    # PostgreSQL 18, necesitas Docker
```

Crea 2.000.000 de pedidos y mide (con SQLite ocupa unos 200 MB y lo borra al acabar; el contenedor de PostgreSQL también se borra):

```text
OFFSET pág 1       0.017 ms
OFFSET pág 50.000  18.902 ms
CURSOR pág 50.000  0.017 ms
```

## Qué mirar en el código

- Las dos consultas: `... order by creado desc, id desc limit 20 offset 999980` frente a `... where (creado, id) < (?, ?) order by creado desc, id desc limit 20`.
- El plan de ejecución: `SCAN` con OFFSET y `SEARCH` con cursor.
- Al final de `paginacion.py`: entra un post nuevo entre la página 1 y la 2. Con OFFSET se repite uno; con cursor, no.
