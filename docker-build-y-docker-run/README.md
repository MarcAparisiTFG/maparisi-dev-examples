# Quién hace el build de tu Dockerfile

📺 Vídeo: aún no hay <!-- enlace al vídeo -->

`docker build` prepara la imagen (la caja con tu código y sus dependencias) y `docker run` la arranca. En local lo suele hacer `docker compose up --build`.

## Ejecutar

```bash
./ejecutar.sh
```

Necesitas Docker. Cuando arranque, `curl localhost:8000/productos` devuelve `["Zapatillas","Camiseta","Gorra"]`. Para parar: Ctrl+C y `docker compose down --rmi local`.

Lo mismo a mano: `docker build -t api-tienda .` y `docker run --rm -p 8000:8000 api-tienda`.

## Qué mirar en el código

- `Dockerfile`: copia primero `requirements.txt` e instala, y después el resto. Si solo cambias el código, Docker reutiliza la capa de las dependencias.
- `compose.yaml`: `build: .` hace el build y `ports` abre el 8000.
- `app.py`: una API Flask de una ruta.
