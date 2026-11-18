import http from 'node:http';
import fs from 'node:fs';
const LOG = new URL('./log.txt', import.meta.url).pathname;
const log = (l) => fs.appendFileSync(LOG, `${new Date().toISOString().slice(11,23)} ${l}\n`);
fs.writeFileSync(LOG, '');
const page = `<!doctype html><meta charset="utf-8"><title>demo</title>
<style>body{font-family:system-ui;padding:20px}li{margin:4px 0}</style>
<h1>Listado</h1>
<label>Marca <select id="marca"><option value="">todas</option><option>sony</option><option>apple</option><option>samsung</option></select></label>
<label>Precio máx <input id="precio" type="number" value=""></label>
<label>Página <input id="pagina" type="number" min="1" value="1"></label>
<p id="url"></p><ul id="lista"></ul>
<hr>
<button id="json">POST JSON a :8788</button>
<button id="form">POST formulario a :8788</button>
<button id="auth">GET con Authorization</button>
<pre id="out"></pre>
<script>
const productos = [];
const marcas = ['sony','apple','samsung'];
for (let i = 1; i <= 60; i++) productos.push({ id: i, nombre: marcas[i % 3] + ' ' + i, marca: marcas[i % 3], precio: (i * 37) % 500 + 20 });
const $ = (id) => document.getElementById(id);
function leer() {
  const p = new URLSearchParams(location.search);
  $('marca').value = p.get('marca') ?? '';
  $('precio').value = p.get('precio') ?? '';
  $('pagina').value = p.get('pagina') ?? 1;
  pintar();
}
function pintar() {
  const marca = $('marca').value, precio = Number($('precio').value || 9999), pagina = Number($('pagina').value || 1);
  const f = productos.filter((x) => (!marca || x.marca === marca) && x.precio <= precio);
  $('lista').innerHTML = f.slice((pagina - 1) * 10, pagina * 10).map((x) => '<li>' + x.nombre + ' · ' + x.precio + ' €</li>').join('');
  $('url').textContent = location.pathname + location.search;
}
function escribir() {
  const p = new URLSearchParams();
  if ($('marca').value) p.set('marca', $('marca').value);
  if ($('precio').value) p.set('precio', $('precio').value);
  if (Number($('pagina').value) > 1) p.set('pagina', $('pagina').value);
  const q = p.toString();
  history.pushState(null, '', q ? '?' + q : location.pathname);
  pintar();
}
for (const id of ['marca', 'precio', 'pagina']) $(id).addEventListener('change', escribir);
addEventListener('popstate', leer);
leer();
const show = async (p) => { try { const r = await p; $('out').textContent = r.status + ' ' + await r.text(); } catch (e) { $('out').textContent = 'ERROR ' + e.message; } };
$('json').onclick = () => show(fetch('http://localhost:8788/pedidos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 1 }) }));
$('form').onclick = () => show(fetch('http://localhost:8788/pedidos', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'id=1' }));
$('auth').onclick = () => show(fetch('http://localhost:8788/pedidos', { headers: { Authorization: 'Bearer abc' } }));
</script>`;
http.createServer((req, res) => { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(page); }).listen(8787);
let allow = true;
http.createServer((req, res) => {
  const h = req.headers;
  log(`[api] ${req.method} ${req.url} origin=${h.origin ?? '-'} acrm=${h['access-control-request-method'] ?? '-'} acrh=${h['access-control-request-headers'] ?? '-'} ct=${h['content-type'] ?? '-'} auth=${h.authorization ? 'sí' : '-'}`);
  if (req.url === '/toggle') { allow = !allow; res.end('allow=' + allow); return; }
  const cors = allow ? { 'Access-Control-Allow-Origin': 'http://localhost:8787', 'Access-Control-Allow-Methods': 'GET, POST, PUT', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Max-Age': '600' } : {};
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); res.end(); return; }
  res.writeHead(200, { ...cors, 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: true, metodo: req.method }));
}).listen(8788);
console.log('listo');
