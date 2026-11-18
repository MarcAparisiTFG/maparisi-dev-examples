// Chat mínimo con tres formas de recibir los mensajes:
//   - polling:   GET /mensajes?desde=N cada X segundos
//   - SSE:       GET /eventos (el servidor escribe, el navegador solo escucha)
//   - WebSocket: /ws (una conexión abierta en los dos sentidos)
// Arranque: npm start → http://localhost:4010
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { WebSocketServer } from 'ws';

export function crearServidor() {
  const mensajes = []; // {id, de, texto}
  const sse = new Set();
  const stats = nuevasStats();
  const sockets = new Set();

  function nuevasStats() {
    return { peticionesHttp: 0, porRuta: {}, pollingVacias: 0, pollingConMensajes: 0 };
  }

  function publicar(de, texto) {
    const m = { id: mensajes.length + 1, de, texto };
    mensajes.push(m);
    const json = JSON.stringify(m);
    for (const res of sse) res.write(`data: ${json}\n\n`);
    for (const ws of wss.clients) if (ws.readyState === 1) ws.send(json);
    return m;
  }

  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    // Algunos programas del sistema sondean con HEAD / cada puerto que se abre (no es del chat): no se cuenta.
    if (req.method === 'HEAD') {
      req.socket.sonda = true;
      return res.writeHead(404).end();
    }
    stats.peticionesHttp++;
    const clave = `${req.method} ${url.pathname}`;
    stats.porRuta[clave] = (stats.porRuta[clave] || 0) + 1;

    if (req.method === 'GET' && url.pathname === '/') {
      const html = await readFile(new URL('./index.html', import.meta.url));
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      return res.end(html);
    }
    if (req.method === 'GET' && url.pathname === '/mensajes') {
      const desde = Number(url.searchParams.get('desde') || 0);
      const nuevos = mensajes.filter((m) => m.id > desde);
      if (nuevos.length) stats.pollingConMensajes++;
      else stats.pollingVacias++;
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify(nuevos));
    }
    if (req.method === 'POST' && url.pathname === '/mensajes') {
      let cuerpo = '';
      for await (const trozo of req) cuerpo += trozo;
      const { de, texto } = JSON.parse(cuerpo);
      const m = publicar(de, texto);
      res.writeHead(201, { 'content-type': 'application/json' });
      return res.end(JSON.stringify(m));
    }
    if (req.method === 'GET' && url.pathname === '/eventos') {
      res.writeHead(200, {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
        connection: 'keep-alive',
      });
      res.write(': conectado\n\n');
      sse.add(res);
      req.on('close', () => sse.delete(res));
      return;
    }
    if (req.method === 'GET' && url.pathname === '/stats') {
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify(leerStats()));
    }
    res.writeHead(404).end();
  });

  // El WebSocket empieza como una petición HTTP normal (GET /ws con Upgrade: websocket).
  // `ws` responde 101 Switching Protocols y se queda con el mismo socket TCP.
  const wss = new WebSocketServer({ noServer: true, perMessageDeflate: false });
  server.on('upgrade', (req, socket, head) => {
    stats.peticionesHttp++;
    stats.porRuta['GET /ws (Upgrade)'] = (stats.porRuta['GET /ws (Upgrade)'] || 0) + 1;
    wss.handleUpgrade(req, socket, head, (ws) => {
      ws.on('message', (datos) => {
        const { de, texto } = JSON.parse(datos.toString());
        publicar(de, texto);
      });
    });
  });

  // Bytes reales que pasan por los sockets TCP (cabeceras incluidas).
  let bytesCerrados = { leidos: 0, escritos: 0 };
  server.on('connection', (s) => {
    sockets.add(s);
    s.on('close', () => {
      sockets.delete(s);
      if (s.sonda) return;
      bytesCerrados.leidos += s.bytesRead;
      bytesCerrados.escritos += s.bytesWritten;
    });
  });

  function leerStats() {
    let leidos = bytesCerrados.leidos;
    let escritos = bytesCerrados.escritos;
    for (const s of sockets) {
      if (s.sonda) continue;
      leidos += s.bytesRead;
      escritos += s.bytesWritten;
    }
    return { ...stats, porRuta: { ...stats.porRuta }, bytesRecibidos: leidos, bytesEnviados: escritos, mensajes: mensajes.length };
  }

  return { server, wss, leerStats, publicar };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const puerto = Number(process.env.PORT ?? 4010);
  const { server, wss } = crearServidor();
  server.listen(puerto, () => {
    console.log(`Chat de demo en http://localhost:${server.address().port}`);
    process.send?.({ puerto: server.address().port });
  });
  // Para conexiones.mjs: el proceso padre pregunta cuánta memoria usa este servidor.
  process.on('message', (m) => {
    if (m !== 'memoria') return;
    globalThis.gc?.();
    globalThis.gc?.();
    const { rss, heapUsed, external } = process.memoryUsage();
    process.send({ rss, heapUsed, external, websockets: wss.clients.size });
  });
}
