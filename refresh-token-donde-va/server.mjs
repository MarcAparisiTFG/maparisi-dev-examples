// Demo: access token corto en memoria + refresh token largo en cookie HttpOnly
// que solo viaja a /auth/refresh, con rotación y detección de reutilización.
import http from 'node:http';
import {randomBytes} from 'node:crypto';

const ACCESS_SECONDS = Number(process.env.ACCESS_SECONDS ?? 300);   // 5 minutos
const REFRESH_SECONDS = 14 * 24 * 3600;                             // 2 semanas
const accessTokens = new Map();   // token -> {user, expires}
const refreshTokens = new Map();  // token -> {user, family, used}
const revokedFamilies = new Set();
const token = () => randomBytes(32).toString('hex');

function issue(res, user, family) {
  const access = token();
  accessTokens.set(access, {user, expires: Date.now() + ACCESS_SECONDS * 1000});
  const refresh = token();
  refreshTokens.set(refresh, {user, family, used: false});
  res.setHeader('Set-Cookie',
    `refresh=${refresh}; HttpOnly; SameSite=Strict; Path=/auth/refresh; Max-Age=${REFRESH_SECONDS}`);
  return {accessToken: access, expiresIn: ACCESS_SECONDS};
}

const cookie = (req, name) =>
  (req.headers.cookie ?? '').split('; ').find((c) => c.startsWith(name + '='))?.slice(name.length + 1);

const send = (res, status, body) => {
  res.writeHead(status, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(body));
};

http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/login') {
    return send(res, 200, issue(res, 'marc', token()));
  }
  if (req.method === 'GET' && req.url === '/api/pedidos') {
    const access = req.headers.authorization?.replace('Bearer ', '');
    const found = accessTokens.get(access);
    console.log('GET /api/pedidos · cookie recibida:', req.headers.cookie ?? '(ninguna)');
    if (!found || found.expires < Date.now()) return send(res, 401, {error: 'token caducado'});
    return send(res, 200, ['Zapatillas', 'Camiseta']);
  }
  if (req.method === 'POST' && req.url === '/auth/refresh') {
    const old = refreshTokens.get(cookie(req, 'refresh'));
    if (!old || revokedFamilies.has(old.family)) return send(res, 401, {error: 'inicia sesión'});
    if (old.used) {                         // alguien reutiliza uno ya gastado
      revokedFamilies.add(old.family);      // se cierra la sesión entera
      return send(res, 401, {error: 'reutilizado: sesión cerrada'});
    }
    old.used = true;                        // rotación: el viejo ya no vale
    return send(res, 200, issue(res, old.user, old.family));
  }
  send(res, 404, {error: 'no existe'});
}).listen(Number(process.env.PORT ?? 3917), () => console.log(`http://localhost:${process.env.PORT ?? 3917}`));
