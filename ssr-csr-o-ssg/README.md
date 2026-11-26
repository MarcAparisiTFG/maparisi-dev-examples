# Vídeo 87 · SSR: cuándo usarlo

📺 Vídeo: próximamente <!-- enlace al vídeo -->

El proyecto de prueba del vídeo de *server-side rendering*. La misma tienda servida de tres maneras: CSR (el HTML llega vacío y el navegador pide los datos), SSR (el servidor la monta en cada visita) y SSG (se monta una vez, al publicar). Y una versión en Next.js con lo que se ve en el vídeo: componentes de servidor, `'use client'`, `localStorage` que explota en el servidor y el `next build` que separa lo estático de lo dinámico.

## Ejecutar

```bash
./ejecutar.sh        # tienda en Node: /csr, /ssr y /ssg en el puerto 8795
./ejecutar.sh next   # la versión en Next.js, en el puerto 3010
```

Necesitas Node 18 o superior (Next.js 16 pide Node 20.9). Mira lo que recibe un buscador o alguien con mala conexión antes de que corra el JavaScript:

```bash
curl localhost:8795/csr       # <div id="root"></div>  → vacío
curl localhost:8795/ssr       # la lista ya hecha, con el stock de ahora
curl localhost:8795/ssg       # la lista ya hecha, con el stock de cuando arrancó
curl localhost:3010/producto  # <h1>Auriculares</h1><p>59 € · quedan 4</p>…
curl localhost:3010/rompe     # 500: ReferenceError: localStorage is not defined
```

La salida que salió al grabar el vídeo está en [`salida.txt`](salida.txt).

## Qué mirar en el código

En `server.mjs`:

- `db()`: la «base de datos» tarda 300 ms a propósito, para ver dónde se nota la espera.
- `ssgHtml`: se genera una sola vez al arrancar.
- `appJs`: si la lista no está, la pide y la pinta (CSR); si ya viene en el HTML, solo engancha los botones (hidratación).

En `next/app`:

- `producto/page.js`: componente de servidor (el de por defecto). Lee el stock en cada visita, por eso `/producto` sale como `ƒ (Dynamic)` en `next build`.
- `producto/comprar.js`: usa clics y estado, así que lleva `'use client'` y también se descarga en el navegador.
- `rompe/page.js`: toca `localStorage` mientras se monta en el servidor, donde no existe.
- `page.js`: igual para todo el mundo, así que Next la genera una sola vez al compilar (`○ (Static)`).
