# SSR: cuándo usarlo

📺 Vídeo: próximamente <!-- enlace al vídeo -->

La misma tienda servida de tres maneras: CSR (el HTML llega vacío y el navegador pide los datos), SSR (el servidor la monta en cada visita) y SSG (se monta una vez, al publicar).

## Ejecutar

```bash
./ejecutar.sh
```

Necesitas Node 18 o superior. Mira lo que recibe un buscador o alguien con mala conexión antes de que corra el JavaScript:

```bash
curl localhost:8795/csr    # <div id="root"></div>  → vacío
curl localhost:8795/ssr    # la lista ya hecha, con el stock de ahora
curl localhost:8795/ssg    # la lista ya hecha, con el stock de cuando arrancó
```

## Qué mirar en el código

En `server.mjs`:

- `db()`: la «base de datos» tarda 300 ms a propósito, para ver dónde se nota la espera.
- `ssgHtml`: se genera una sola vez al arrancar.
- `appJs`: si la lista no está, la pide y la pinta (CSR); si ya viene en el HTML, solo engancha los botones (hidratación).
