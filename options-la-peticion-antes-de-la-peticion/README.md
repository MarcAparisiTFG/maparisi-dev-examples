# La petición OPTIONS, ¿qué es?

📺 [Ver el vídeo](https://youtube.com/shorts/XJL2aqcVtbk)

Cuando tu web llama a una API de otro origen con JSON o con un `Authorization`, el navegador manda antes una petición OPTIONS (el *preflight* de CORS) para preguntar si puede.

## Ejecutar

```bash
./ejecutar.sh
```

Necesitas Node 18 o superior. Abre http://localhost:8787 con las DevTools en la pestaña **Red** y pulsa los tres botones. La página vive en el puerto 8787 y la API en el 8788: son orígenes distintos.

- **POST JSON** → una OPTIONS y después tu POST.
- **POST formulario** → sin OPTIONS: es una petición «simple».
- **GET con Authorization** → otra vez OPTIONS antes.

Lo que llega a la API se apunta en `log.txt`. Para ver fallar el preflight, apaga sus cabeceras CORS con `curl http://localhost:8788/toggle`.

## Qué mirar en el código

En `server.mjs`, el segundo servidor (la API):

- Si llega `OPTIONS`, responde `204` con `Access-Control-Allow-Origin`, `-Methods`, `-Headers` y `-Max-Age`.
- `Access-Control-Max-Age: 600`: el navegador recuerda la respuesta 10 minutos y no vuelve a preguntar.
