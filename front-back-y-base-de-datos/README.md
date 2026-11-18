# Front, back y base de datos

📺 Vídeo: próximamente <!-- enlace al vídeo -->

Por qué tu web no le pide los pedidos directamente a la base de datos: el front pide, el back decide quién eres y pregunta a la base de datos, y solo te devuelve lo tuyo.

## Ejecutar

```bash
./ejecutar.sh
```

Necesitas Node 22.5 o superior (usa `node:sqlite`, que viene con Node). Abre http://localhost:4322 y pulsa **Mis pedidos**. En la terminal verás la consulta SQL que ha hecho el back.

## Qué mirar en el código

- `index.html`: el front, separado en HTML (qué hay), CSS (cómo se ve) y JavaScript (qué pasa al pulsar).
- `server.mjs`: el back. La ruta `/api/pedidos` y la consulta `WHERE usuario_id = ?`.
- El pedido 103 es de otro usuario y nunca sale: quién eres lo decide el back, no el front.
