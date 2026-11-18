// Demo del vídeo «SSR: cuándo usarlo». La misma tienda servida de tres maneras.
// node server.mjs  →  http://localhost:8795/csr  /ssr  /ssg
// La «base de datos» tarda 300 ms a propósito, para ver dónde se nota la espera.
import http from 'node:http';

const DB_MS = 300;
const db = () => new Promise((ok) => setTimeout(() => ok([
  { nombre: 'Auriculares', precio: 59, stock: Math.floor(Math.random() * 9) },
  { nombre: 'Teclado', precio: 89, stock: Math.floor(Math.random() * 9) },
]), DB_MS));

const lista = (productos) => productos
  .map((p) => `<li>${p.nombre} · ${p.precio} € · quedan ${p.stock} <button>Comprar</button></li>`)
  .join('');

const pagina = (cuerpo) => `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Tienda</title></head>
<body>${cuerpo}<script src="/app.js"></script></body></html>`;

// El JavaScript del navegador: si la lista no está, la pide y la pinta (CSR);
// si ya viene en el HTML, solo engancha los clics (hidratación).
const appJs = `
const root = document.getElementById('root');
async function pintar() {
  if (!root.querySelector('li')) {
    const productos = await (await fetch('/api/productos')).json();
    root.innerHTML = '<ul>' + productos.map((p) => '<li>' + p.nombre + ' · ' + p.precio + ' € · quedan ' + p.stock + ' <button>Comprar</button></li>').join('') + '</ul>';
  }
  root.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { b.textContent = '✓ Añadido'; }));
}
pintar();`;

// SSG: se genera una sola vez, «al publicar» (al arrancar el servidor).
const ssgHtml = pagina(`<div id="root"><ul>${lista(await db())}</ul></div>`);

http.createServer(async (req, res) => {
  const html = (s) => { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(s); };
  if (req.url === '/csr') return html(pagina('<div id="root"></div>'));
  if (req.url === '/ssr') return html(pagina(`<div id="root"><ul>${lista(await db())}</ul></div>`));
  if (req.url === '/ssg') return html(ssgHtml);
  if (req.url === '/api/productos') { res.writeHead(200, { 'content-type': 'application/json' }); return res.end(JSON.stringify(await db())); }
  if (req.url === '/app.js') { res.writeHead(200, { 'content-type': 'text/javascript' }); return res.end(appJs); }
  res.writeHead(404); res.end();
}).listen(8795, () => console.log('http://localhost:8795/csr  /ssr  /ssg'));
