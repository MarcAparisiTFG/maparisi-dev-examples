# Access token y refresh token: dónde va cada uno

📺 Vídeo: próximamente <!-- enlace al vídeo -->

El access token dura poco y va en memoria; el refresh token dura semanas y va en una cookie `HttpOnly` que solo viaja a `/auth/refresh`. Cada vez que se usa cambia (rotación), y si alguien usa uno viejo se cierra la sesión entera.

## Ejecutar

```bash
./ejecutar.sh
```

Necesitas Node 18 o superior. Arranca el servidor con el access token a 2 s (en vez de 5 minutos), hace login, espera a que caduque, lo renueva e intenta reutilizar el viejo:

```text
3) pedidos 3 s después
{"error":"token caducado"}
5) alguien usa el viejo
{"error":"reutilizado: sesión cerrada"}
```

## Qué mirar en el código

En `server.mjs`:

- `issue()`: crea los dos tokens. Mira la cookie: `HttpOnly; SameSite=Strict; Path=/auth/refresh`.
- `/api/pedidos`: solo acepta el access token en la cabecera `Authorization`. El log enseña que la cookie no llega aquí.
- `/auth/refresh`: marca el viejo como usado y da uno nuevo. Si llega uno ya usado, revoca toda la familia.
