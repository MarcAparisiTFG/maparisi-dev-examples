// BACK: el servidor. Recibe la petición del front, pregunta a la base de datos y responde en JSON.
// Arrancar: node server.mjs  →  http://localhost:4322
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

// BASE DE DATOS: un archivo con tablas (en una app grande suele ser otro servidor, como Postgres).
const db = new DatabaseSync(fileURLToPath(new URL('./tienda.db', import.meta.url)));
db.exec(`
  CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY,
    usuario_id INTEGER,
    producto TEXT,
    total REAL
  );
`);
if (db.prepare('SELECT COUNT(*) AS n FROM pedidos').get().n === 0) {
  const meter = db.prepare('INSERT INTO pedidos (id, usuario_id, producto, total) VALUES (?, ?, ?, ?)');
  meter.run(101, 7, 'Zapatillas', 72);
  meter.run(102, 7, 'Camiseta', 18);
  meter.run(103, 9, 'Mochila', 45); // de otro usuario: no tiene que salir
}

const consulta = 'SELECT id, producto, total FROM pedidos WHERE usuario_id = ?';

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  // La API: una ruta (endpoint) que el front puede pedir.
  if (req.method === 'GET' && url.pathname === '/api/pedidos') {
    const usuarioId = 7; // en una app real sale de la sesión, nunca del front
    const filas = db.prepare(consulta).all(usuarioId);
    console.log(`GET /api/pedidos → ${consulta.replace('?', usuarioId)} → ${filas.length} filas`);
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify(filas));
  }

  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(await readFile(new URL('./index.html', import.meta.url)));
}).listen(4322, () => console.log('Back escuchando en http://localhost:4322'));
