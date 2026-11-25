# Micro frontends: qué son y cuándo usarlos

📺 Vídeo: próximamente <!-- enlace al vídeo -->

Una web de vídeos partida en tres zonas (reproductor, recomendados y comentarios), cada una construida y servida por separado como si fuera de otro equipo. Una contenedora pone la cabecera y el inicio de sesión, y descarga cada zona en el navegador. Así se ve lo bueno (comentarios sube su versión sin que nadie más toque nada) y lo malo (React descargado tres veces y un evento renombrado que rompe otra zona sin dar ningún error).

## Ejecutar

```bash
./ejecutar.sh
```

Necesitas Node 18 o superior y Google Chrome (si no está en la ruta de macOS, pásala en `CHROME`). Construye las tres zonas, abre la contenedora en Chrome sin interfaz tres veces y te dice qué descarga en cada visita:

```text
React 19.2.8 + react-dom/client, minificado: 188.9 kB
== v1
  http://localhost:4000/                         1.5 kB  7d435d47
  http://localhost:4001/reproductor.js         190.2 kB  3128aa0c
  http://localhost:4002/recomendados.js        190.2 kB  e86032b1
  http://localhost:4003/comentarios.js         190.1 kB  41cdc5a5
  recomendados antes: — · después de terminar el vídeo: Siguiente: Tostadas · comentarios v1
== comentarios-v2
  http://localhost:4003/comentarios.js         190.1 kB  f04ae219   ← solo cambia este archivo
  recomendados antes: — · después de terminar el vídeo: Siguiente: Tostadas · comentarios v2
== evento-renombrado
  http://localhost:4001/reproductor.js         190.2 kB  884505fe   ← el reproductor cambia el nombre del evento
  recomendados antes: — · después de terminar el vídeo: — · comentarios v2
```

- Cada zona pesa unos 190 kB y 188,9 kB son React: el usuario baja 566,7 kB solo de React.
- Con comentarios v2 solo cambia el hash de `comentarios.js`; las otras dos zonas se descargan igual.
- Con el evento renombrado (`video-terminado` → `videoTerminado`), recomendados deja de poner el siguiente vídeo y la consola no da ningún error.

Deja también `salida.txt`, `resultado.json` y una captura por visita (`captura-*.png`). Para abrirla tú en el navegador: `npm run build`, `npm run web` y entra en http://localhost:4000.

## Qué mirar en el código

- `contenedora/index.html`: la contenedora solo sabe la URL de cada zona; la importa con `import()` y llama a su `montar()`.
- `construir.mjs`: empaqueta cada zona por separado con esbuild, cada una con su propio React. Los flags `--comentarios-v2` y `--evento-renombrado` simulan que un equipo sube una versión nueva.
- `servidor.mjs`: cuatro servidores, uno por equipo (`:4000` la contenedora y `:4001`–`:4003` las zonas).
- `reproductor/index.jsx` y `recomendados/index.jsx`: se hablan con un `CustomEvent` en `window`. Es un contrato que solo existe como texto: si uno cambia el nombre, nadie se entera.
- Para no descargar React tres veces se puede compartir (Module Federation con `shared`, import maps), pero entonces las zonas quedan atadas a la misma versión. Otra salida es exponer cada zona también como web component, para que la contenedora no dependa de qué React lleva dentro.
