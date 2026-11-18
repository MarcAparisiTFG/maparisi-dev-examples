// Las tres pruebas (recargar, compartir el enlace, atrás) en las dos versiones, con Chrome sin ventana.
// Uso: python3 -m http.server 8794 (en esta carpeta) y, en otra terminal, node prueba.mjs <ruta de puppeteer-core>
import {writeFileSync} from 'node:fs';
const puppeteer = (await import(process.argv[2])).default;
const B = 'http://localhost:8794/';
const browser = await puppeteer.launch({executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const vals = (page) => page.evaluate(() => ({url: location.pathname + location.search, color: color.value, talla: talla.value,
  precio: precio.value, q: buscar.value, total: total.textContent}));
const tresFiltros = async (page, v) => {
  await page.goto(B + (v === 'index' ? '' : v + '.html'));
  await page.select('#color', 'negro'); await page.select('#talla', 'm');
  await page.type('#precio', '20'); await page.evaluate(() => precio.dispatchEvent(new Event('change')));
  return vals(page);
};
const out = {fecha: new Date().toISOString()};
for (const v of ['index', 'estado']) {
  const r = {};
  let page = await browser.newPage();
  r.puestos = await tresFiltros(page, v);
  await page.reload(); r.recarga = await vals(page);                                  // 1. recargar
  await page.close();
  page = await browser.newPage(); await page.goto(B + r.puestos.url.slice(1)); r.enlace = await vals(page); await page.close(); // 2. enlace
  page = await browser.newPage(); await tresFiltros(page, v);                         // 3. atrás
  r.historial = await page.evaluate(() => history.length);
  const back = async () => { await page.evaluate(() => history.back()).catch(() => {}); await wait(700);
    return vals(page).catch(() => ({url: page.url(), salioDeLaPagina: true})); };
  r.atras1 = await back();
  r.atras2 = r.atras1.salioDeLaPagina ? r.atras1 : await back();
  await page.goto(B + v + '.html?color=negro'); const h0 = await page.evaluate(() => history.length); // teclear
  await page.type('#buscar', 'logo'); r.tecleo = await vals(page);
  r.entradasAlTeclear = (await page.evaluate(() => history.length)) - h0;
  if (v === 'index') {                                                                  // lo mismo con pushState al teclear
    await page.goto(B + 'index.html?color=negro'); const g0 = await page.evaluate(() => history.length);
    await page.evaluate(() => { buscar.oninput = () => { const p = new URLSearchParams(location.search); p.set('q', buscar.value); history.pushState(null, '', '?' + p); pintar(); }; });
    await page.type('#buscar', 'logo'); r.entradasConPushState = (await page.evaluate(() => history.length)) - g0;
  }
  await page.close();
  const ok = (x) => x.color === 'negro' && x.talla === 'm' && x.precio === '20';
  r.pruebas = {recargar: ok(r.recarga), enlace: ok(r.enlace), atras: !r.atras1.salioDeLaPagina && r.atras1.precio === '' && r.atras1.talla === 'm'};
  out[v] = r;
}
await browser.close();
writeFileSync(new URL('./prueba.json', import.meta.url), JSON.stringify(out, null, 1));
for (const v of ['index', 'estado']) console.log(v, JSON.stringify(out[v].pruebas), out[v].puestos.url, '→ atrás', out[v].atras1.url, out[v].atras2.url, '| teclear', out[v].tecleo.url, '+' + out[v].entradasAlTeclear);
