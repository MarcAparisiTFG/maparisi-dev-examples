// Abre la contenedora en Chrome sin interfaz y apunta lo que pasa de verdad:
//  1. qué descarga y desde dónde (cada zona con su propio React);
//  2. el reproductor termina un vídeo y recomendados pone el siguiente;
//  3. comentarios sube la v2: solo cambia su archivo, el resto llega igual;
//  4. el reproductor cambia el nombre del evento sin avisar: recomendados ya no se entera.
import puppeteer from 'puppeteer-core';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {servidores} from './servidor.mjs';

const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
for (const [p, s] of servidores) await new Promise(r => s.listen(p, r));
const browser = await puppeteer.launch({executablePath: CHROME, headless: true});
const construir = (...flags) => execFileSync('node', ['construir.mjs', ...flags], {stdio: 'inherit'});

async function visita(nombre) {
  const page = await browser.newPage();
  await page.setViewport({width: 900, height: 640});
  const descargas = [];
  page.on('response', async res => {
    const buf = await res.buffer().catch(() => Buffer.alloc(0));
    descargas.push({url: res.url(), kB: +(buf.length / 1024).toFixed(1), sha: createHash('sha1').update(buf).digest('hex').slice(0, 8)});
  });
  page.on('console', m => m.type() === 'error' && console.log('  consola:', m.text()));
  page.on('pageerror', e => console.log('  error:', e.message));
  await page.goto('http://localhost:4000', {waitUntil: 'networkidle0'});
  await page.waitForSelector('#siguiente', {timeout: 10000});
  const red = descargas.filter(d => !d.url.endsWith('favicon.ico')).slice();
  const antes = await page.$eval('#siguiente', e => e.textContent);
  await page.click('#terminar');
  await new Promise(r => setTimeout(r, 300));
  const despues = await page.$eval('#siguiente', e => e.textContent);
  const version = await page.$eval('#version', e => e.textContent);
  const reactPorZona = await Promise.all(['reproductor', 'recomendados', 'comentarios'].map(z =>
    page.evaluate(async u => (await (await fetch(u)).text()).includes('react.production') || /Minified React error/.test(await (await fetch(u)).text()), `http://localhost:400${['reproductor', 'recomendados', 'comentarios'].indexOf(z) + 1}/${z}.js`)));
  await page.screenshot({path: `captura-${nombre}.png`});
  await page.close();
  return {nombre, descargas: red, recomendadosAntes: antes, recomendadosDespues: despues, comentarios: version, reactPorZona};
}

const R = fileURLToPath(new URL('./node_modules', import.meta.url));
const {build} = await import('esbuild');
const soloReact = await build({stdin: {contents: "import 'react'; import 'react-dom/client';", resolveDir: '.'}, bundle: true, minify: true, write: false, format: 'esm', alias: {react: `${R}/react`, 'react-dom': `${R}/react-dom`}, define: {'process.env.NODE_ENV': '"production"'}});
const reactKB = +(soloReact.outputFiles[0].contents.length / 1024).toFixed(1);
const reactVersion = JSON.parse((await import('node:fs')).readFileSync(`${R}/react/package.json`, 'utf8')).version;
const resultado = [];
construir(); resultado.push(await visita('v1'));
construir('--comentarios-v2'); resultado.push(await visita('comentarios-v2'));
construir('--comentarios-v2', '--evento-renombrado'); resultado.push(await visita('evento-renombrado'));
await browser.close(); for (const [, s] of servidores) s.close();
construir();   // deja la v1 construida

writeFileSync('resultado.json', JSON.stringify({react: {version: reactVersion, kB: reactKB}, visitas: resultado}, null, 1));
const txt = resultado.map(r => [`== ${r.nombre}`, ...r.descargas.map(d => `  ${d.url.padEnd(42)} ${String(d.kB).padStart(7)} kB  ${d.sha}`),
  `  recomendados antes: ${r.recomendadosAntes} · después de terminar el vídeo: ${r.recomendadosDespues} · comentarios ${r.comentarios}`,
  `  React dentro de cada zona: ${r.reactPorZona.join(', ')}`].join('\n')).join('\n');
writeFileSync('salida.txt', `React ${reactVersion} + react-dom/client, minificado: ${reactKB} kB\n` + txt + '\n');
console.log(txt);
