// Comprueba la demo: node probar.mjs
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

vm.runInThisContext(readFileSync(new URL('./teclado.js', import.meta.url), 'utf8'));
const { teclas, teclaTocada, probabilidades } = globalThis.Teclado;

const lista = teclas();
const a = lista.find((t) => t.letra === 'a');
const s = lista.find((t) => t.letra === 's');

console.log('Tras "hol", probabilidades:', probabilidades('hol'));

// Toques entre la A y la S: 0 = centro de la A, 1 = centro de la S.
for (const f of [0.5, 0.6, 0.7, 0.8, 0.9]) {
  const x = a.x + (s.x - a.x) * f;
  console.log(
    `toque al ${Math.round(f * 100)} % hacia la S →`,
    'sin escribir nada:', teclaTocada(x, a.y, ''),
    '| tras "hol":', teclaTocada(x, a.y, 'hol'),
  );
}
