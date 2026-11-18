// Mide un minuto de chat entre dos clientes (Marc escribe, Ana recibe) de tres formas.
// Uso: node medir.mjs [segundos=60] [intervaloPollingMs=2000]
// Los dos clientes usan fetch, EventSource-a-mano y WebSocket nativos de Node contra el servidor real.
import { crearServidor } from './server.mjs';
import { once } from 'node:events';

const SEGUNDOS = Number(process.argv[2] || 60);
const INTERVALO = Number(process.argv[3] || 2000);
// Momentos (en fracción del minuto) en que Marc envía un mensaje: fijos para que las tres pruebas sean iguales.
const ENVIOS = [0.055, 0.195, 0.402, 0.632, 0.743, 0.92].map((f) => Math.round(f * SEGUNDOS * 1000));
const TEXTOS = ['hola', '¿quedamos hoy?', 'a las 7', 'en la plaza', 'llevo el portátil', 'vale, hasta luego'];
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function prueba(nombre, montar) {
  const { server, wss, leerStats } = crearServidor();
  server.listen(0);
  await once(server, 'listening');
  const base = `localhost:${server.address().port}`;
  const enviados = new Map(); // texto → instante
  const retrasos = [];
  const recibido = (m) => { if (enviados.has(m.texto)) { retrasos.push(performance.now() - enviados.get(m.texto)); enviados.delete(m.texto); } };

  const { enviar, cerrar } = await montar(base, recibido);
  const t0 = performance.now();
  for (let i = 0; i < ENVIOS.length; i++) {
    await espera(ENVIOS[i] - (performance.now() - t0));
    enviados.set(TEXTOS[i], performance.now());
    await enviar(TEXTOS[i]);
  }
  await espera(SEGUNDOS * 1000 - (performance.now() - t0));
  const s = leerStats();
  await cerrar();
  for (const c of wss.clients) c.terminate();
  server.closeAllConnections();
  server.close();

  const media = retrasos.reduce((a, b) => a + b, 0) / retrasos.length;
  return {
    prueba: nombre,
    'peticiones HTTP': s.peticionesHttp,
    'respuestas vacías': s.pollingVacias,
    'mensajes recibidos': `${retrasos.length}/${ENVIOS.length}`,
    'retraso medio (ms)': Math.round(media),
    'retraso máx (ms)': Math.round(Math.max(...retrasos)),
    'bytes cliente→servidor': s.bytesRecibidos,
    'bytes servidor→cliente': s.bytesEnviados,
    rutas: JSON.stringify(s.porRuta),
  };
}

const post = (base, texto) =>
  fetch(`http://${base}/mensajes`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ de: 'Marc', texto }) }).then((r) => r.text());

const resultados = [];

resultados.push(await prueba(`polling cada ${INTERVALO / 1000} s`, async (base, recibido) => {
  let ultimo = 0;
  const t = setInterval(async () => {
    const r = await fetch(`http://${base}/mensajes?desde=${ultimo}`);
    for (const m of await r.json()) { ultimo = Math.max(ultimo, m.id); recibido(m); }
  }, INTERVALO);
  return { enviar: (texto) => post(base, texto), cerrar: async () => clearInterval(t) };
}));

resultados.push(await prueba('SSE (solo habla el servidor)', async (base, recibido) => {
  const ctrl = new AbortController();
  const r = await fetch(`http://${base}/eventos`, { signal: ctrl.signal });
  (async () => {
    const dec = new TextDecoder();
    let buf = '';
    try {
      for await (const trozo of r.body) {
        buf += dec.decode(trozo, { stream: true });
        let i;
        while ((i = buf.indexOf('\n\n')) >= 0) {
          const evento = buf.slice(0, i); buf = buf.slice(i + 2);
          if (evento.startsWith('data: ')) recibido(JSON.parse(evento.slice(6)));
        }
      }
    } catch {}
  })();
  return { enviar: (texto) => post(base, texto), cerrar: async () => ctrl.abort() };
}));

resultados.push(await prueba('WebSocket (los dos hablan)', async (base, recibido) => {
  const ana = new WebSocket(`ws://${base}/ws`);
  const marc = new WebSocket(`ws://${base}/ws`);
  await Promise.all([once(ana, 'open'), once(marc, 'open')]);
  ana.addEventListener('message', (e) => recibido(JSON.parse(e.data)));
  return { enviar: async (texto) => marc.send(JSON.stringify({ de: 'Marc', texto })), cerrar: async () => { ana.close(); marc.close(); } };
}));

console.log(`Node ${process.version} · ${SEGUNDOS} s por prueba · ${ENVIOS.length} mensajes de Marc a Ana`);
console.table(resultados.map(({ rutas, ...r }) => r));
for (const r of resultados) console.log(r.prueba, '→', r.rutas);
