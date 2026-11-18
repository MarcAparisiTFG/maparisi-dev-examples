// ¿Cuánta memoria le cuesta al servidor cada usuario conectado?
// Arranca server.mjs en un proceso aparte y mide SU memoria (tras forzar el recolector) en dos casos:
//   - N usuarios con un WebSocket abierto y callados
//   - N usuarios que preguntan (GET /mensajes) y cierran, varias rondas, medido entre pregunta y pregunta
// Uso: node conexiones.mjs [N=1000]
import { fork } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';

const N = Number(process.argv[2] || 1000);
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const MB = (b) => (b / 1024 / 1024).toFixed(1);

async function conServidor(fn) {
  const hijo = fork(new URL('./server.mjs', import.meta.url), { env: { ...process.env, PORT: '0' }, execArgv: ['--expose-gc'], stdio: ['ignore', 'ignore', 'inherit', 'ipc'] });
  const [{ puerto }] = await once(hijo, 'message');
  const memoria = async () => { hijo.send('memoria'); return (await once(hijo, 'message'))[0]; };
  try { return await fn(puerto, memoria); } finally { hijo.kill(); }
}

function preguntar(puerto) {
  return new Promise((ok, mal) => {
    const s = net.connect(puerto, '127.0.0.1', () => s.write('GET /mensajes?desde=0 HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n'));
    s.on('data', () => {});
    s.on('close', ok);
    s.on('error', mal);
  });
}

const ws = await conServidor(async (puerto, memoria) => {
  await espera(500);
  const antes = await memoria();
  const abiertos = [];
  let fallos = 0;
  for (let i = 0; i < N; i += 200) {
    await Promise.all(Array.from({ length: Math.min(200, N - i) }, () => new Promise((ok) => {
      const w = new WebSocket(`ws://127.0.0.1:${puerto}/ws`);
      w.onopen = () => { abiertos.push(w); ok(); };
      w.onerror = () => { fallos++; ok(); };
    })));
  }
  await espera(3000); // todos callados
  const despues = await memoria();
  for (const w of abiertos) w.close();
  return { antes, despues, abiertos: abiertos.length, fallos };
});

const polling = await conServidor(async (puerto, memoria) => {
  await espera(500);
  const antes = await memoria();
  for (let ronda = 0; ronda < 3; ronda++) {
    for (let i = 0; i < N; i += 200) await Promise.all(Array.from({ length: Math.min(200, N - i) }, () => preguntar(puerto)));
  }
  await espera(3000); // entre pregunta y pregunta: nadie conectado
  const despues = await memoria();
  return { antes, despues };
});

const fila = (nombre, r, n) => ({
  caso: nombre,
  'RSS antes (MB)': MB(r.antes.rss), 'RSS después (MB)': MB(r.despues.rss),
  'RSS por usuario (KB)': ((r.despues.rss - r.antes.rss) / n / 1024).toFixed(1),
  'heap antes (MB)': MB(r.antes.heapUsed), 'heap después (MB)': MB(r.despues.heapUsed),
  'heap por usuario (KB)': ((r.despues.heapUsed - r.antes.heapUsed) / n / 1024).toFixed(1),
  'conexiones abiertas en el servidor': r.despues.websockets,
});
console.log(`Node ${process.version} · ${N} usuarios · WebSockets abiertos: ${ws.abiertos}, fallidos: ${ws.fallos}`);
console.table([fila(`${N} WebSockets abiertos y callados`, ws, ws.abiertos || 1), fila(`${N} usuarios preguntando (3 rondas), medido en reposo`, polling, N)]);
