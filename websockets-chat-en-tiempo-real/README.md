# WebSockets: el chat en tiempo real

📺 Vídeo: próximamente <!-- enlace al vídeo -->

El mismo chat de tres maneras: preguntando cada pocos segundos (polling), con el servidor escribiendo (SSE) y con una conexión abierta en los dos sentidos (WebSocket). Y lo que cuesta tener una conexión abierta por persona.

## Ejecutar

```bash
./ejecutar.sh
```

Necesitas Node 22 o superior. Abre http://localhost:4010/?yo=Ana y http://localhost:4010/?yo=Marc en dos pestañas, con las DevTools en la pestaña **Red**, y escríbete. Cambia de modo y mira el contador de peticiones.

Para medirlo sin navegador: `node medir.mjs 60 1000` (un minuto de chat, polling cada segundo) y `node conexiones.mjs 1000` (memoria del servidor con 1000 usuarios). Los resultados de cuando lo medí están en los `.txt` de la carpeta.

## Qué mirar en el código

En `server.mjs`:

- `GET /mensajes?desde=N`: el polling. La mayoría de respuestas llegan vacías.
- `GET /eventos`: SSE. La respuesta no se cierra; el servidor escribe `data: ...` cuando hay un mensaje.
- `upgrade`: el WebSocket empieza como un GET normal con `Upgrade: websocket` y se queda con la misma conexión.
