# async y await

📺 Vídeo: próximamente <!-- enlace al vídeo -->

`await` para solo su función, no toda la web. Dos `await` seguidos suman su tiempo; con `Promise.all` van a la vez.

## Ejecutar

```bash
./ejecutar.sh
```

Necesitas Node 18 o superior. Abre http://localhost:4321 y pulsa **En fila** y **A la vez**: el reloj no se para mientras esperan. Con el servidor arrancado, `node medir.mjs` en otra terminal lo mide:

```text
4. en fila: 2.01 s
4. a la vez: 1.01 s
```

## Qué mirar en el código

- `server.mjs`: dos rutas que tardan 1 s cada una.
- `index.html`: `enFila()` con dos `await` seguidos y `aLaVez()` con `Promise.all`.
- `medir.mjs`: que `async` siempre devuelve una promesa, qué pasa sin `await`, en qué orden sigue el código y que `Promise.all` falla en cuanto falla una.
