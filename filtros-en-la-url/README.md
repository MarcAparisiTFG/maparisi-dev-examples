# Las 3 pruebas que tienen que pasar tus filtros

📺 [Ver el vídeo](https://youtube.com/shorts/l9UnlywsjLc)

Si guardas los filtros en la URL, sobreviven a recargar, se pueden compartir con un enlace y el botón «atrás» funciona. Si los guardas en una variable, se pierden.

## Ejecutar

```bash
./ejecutar.sh
```

Necesitas Python 3 (solo para servir los archivos). Abre las dos versiones, pon tres filtros en cada una y recarga:

- http://localhost:8794/ — filtros en la URL.
- http://localhost:8794/estado.html — filtros en una variable (como `useState` o un store).

## Qué mirar en el código

- `filtros.js`: `leer()` saca los filtros de `location.search` y `escribir()` los guarda con `history.pushState`. El buscador usa `replaceState` para no llenar el historial con cada letra.
- `estado.js`: la misma tienda con los filtros en un objeto.
- `prueba.mjs` (extra): hace las tres pruebas en Chrome sin ventana. Necesita Google Chrome en macOS: `npm i --no-save puppeteer-core` y, con el servidor arrancado, `node prueba.mjs puppeteer-core`.
