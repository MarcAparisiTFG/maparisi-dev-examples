// Sirve la página de la tienda en http://localhost:3000
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname, join} from 'node:path';
const TYPES = {'.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png'};
export const servidor = createServer(async (req, res) => {
  const ruta = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  try {
    const cuerpo = await readFile(join(import.meta.dirname, 'web', ruta));
    res.writeHead(200, {'Content-Type': TYPES[extname(ruta)] ?? 'application/octet-stream'}).end(cuerpo);
  } catch { res.writeHead(404).end(); }
});
if (process.argv[1] === import.meta.filename) servidor.listen(3000, () => console.log('http://localhost:3000'));
