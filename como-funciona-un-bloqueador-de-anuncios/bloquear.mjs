// Carga la tienda dos veces en Chrome: sin bloqueador y con un bloqueador mínimo que usa la lista real de EasyList.
//  · Filtros de red  «||dominio^»  → la petición se cancela antes de salir (Chrome: net::ERR_BLOCKED_BY_CLIENT).
//  · Filtros cosméticos «##.clase» → el elemento se oculta con CSS (display: none).
// Uso: ./ejecutar.sh
import puppeteer from 'puppeteer-core';
import {writeFileSync} from 'node:fs';
import {servidor} from './servidor.mjs';

const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const lista = await (await fetch('https://easylist.to/easylist/easylist.txt')).text();
const version = lista.match(/^! Version: (\d+)/m)?.[1];
const lineas = lista.split('\n').map(l => l.trim());
// Solo las reglas más simples (las que explica el vídeo): dominio entero sin opciones y clase genérica.
const red = new Map(lineas.filter(l => /^\|\|[a-z0-9.-]+\^$/.test(l)).map(l => [l.slice(2, -1), l]));
const cosmeticas = lineas.filter(l => /^##\.[\w-]+$/.test(l));
console.log(`EasyList ${version}: ${red.size} reglas de dominio y ${cosmeticas.length} de clase`);

const reglaDe = host => { for (let h = host; h.includes('.'); h = h.slice(h.indexOf('.') + 1)) if (red.has(h)) return red.get(h); };

await new Promise(r => servidor.listen(3000, r));
const browser = await puppeteer.launch({executablePath: CHROME, headless: true});
const resultado = {easylist: version};

for (const conBloqueador of [false, true]) {
  const page = await browser.newPage();
  await page.setViewport({width: 600, height: 700});
  const peticiones = [];
  await page.setRequestInterception(true);
  page.on('request', req => {
    const host = new URL(req.url()).hostname;
    const regla = conBloqueador ? reglaDe(host) : undefined;
    peticiones.push({url: req.url(), host, regla: regla ?? null});
    regla ? req.abort('blockedbyclient') : req.continue();
  });
  page.on('requestfailed', req => { const p = peticiones.find(p => p.url === req.url()); if (p) p.error = req.failure()?.errorText; });
  page.on('response', res => { const p = peticiones.find(p => p.url === res.url()); if (p) p.status = res.status(); });
  if (conBloqueador) await page.evaluateOnNewDocument(css => {
    addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = css; document.head.append(s); });
  }, cosmeticas.map(r => r.slice(2)).join(',\n') + ' { display: none !important; }');
  await page.goto('http://localhost:3000', {waitUntil: 'networkidle0', timeout: 60000});
  const ocultos = conBloqueador ? await page.evaluate(sels => sels.filter(s => document.querySelector(s.slice(2)))
    .map(s => ({regla: s, elemento: document.querySelector(s.slice(2)).outerHTML})), cosmeticas) : [];
  const nombre = conBloqueador ? 'con-bloqueador' : 'sin-bloqueador';
  await page.screenshot({path: `${nombre}.png`});
  resultado[nombre] = {peticiones, ocultos};
  console.log(`\n${nombre}: ${peticiones.length} peticiones`);
  for (const p of peticiones) console.log(`  ${p.regla ? '✕' : '✓'} ${p.host.padEnd(36)} ${(p.status ?? p.error ?? '').toString().padEnd(26)} ${p.regla ?? ''}`);
  for (const o of ocultos) console.log(`  oculto por ${o.regla}: ${o.elemento.replace(/\s+/g, " ")}`);
  await page.close();
}
writeFileSync('resultado.json', JSON.stringify(resultado, null, 1));
await browser.close();
servidor.close();
