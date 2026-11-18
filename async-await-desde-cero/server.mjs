// Demo del vídeo: dos rutas que tardan 1 s cada una y la página que las pide.
// Arrancar: node server.mjs  →  http://localhost:4321
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

const rutas = {
  '/api/usuario': { id: 7, nombre: 'Marc' },
  '/api/ofertas': [{ id: 1, titulo: 'Zapatillas -20 %' }],
  '/api/pedidos': [{ id: 101, total: 72 }, { id: 102, total: 45 }], // necesita ?usuario=7
};

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (rutas[url.pathname]) {
    await esperar(1000);
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify(rutas[url.pathname]));
  }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(await readFile(new URL('./index.html', import.meta.url)));
}).listen(4321, () => console.log('http://localhost:4321'));
