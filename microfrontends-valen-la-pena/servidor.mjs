// Cuatro servidores, uno por equipo: la contenedora en :4000 y cada zona en su propio puerto.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';

const SITIOS = {4000: 'contenedora', 4001: 'reproductor/dist', 4002: 'recomendados/dist', 4003: 'comentarios/dist'};
const TIPOS = {html: 'text/html; charset=utf-8', js: 'text/javascript; charset=utf-8'};
export const servidores = Object.entries(SITIOS).map(([puerto, dir]) => {
  const s = createServer(async (req, res) => {
    const archivo = req.url === '/' ? 'index.html' : req.url.slice(1).split('?')[0];
    try {
      const datos = await readFile(new URL(`./${dir}/${archivo}`, import.meta.url));
      res.writeHead(200, {'content-type': TIPOS[archivo.split('.').pop()] ?? 'application/octet-stream', 'access-control-allow-origin': '*', 'cache-control': 'no-store'});
      res.end(datos);
    } catch { res.writeHead(404); res.end(); }
  });
  return [Number(puerto), s];
});
if (import.meta.url === `file://${process.argv[1]}`) {
  for (const [p, s] of servidores) s.listen(p);
  console.log('Contenedora en http://localhost:4000 (zonas en :4001, :4002 y :4003)');
}
