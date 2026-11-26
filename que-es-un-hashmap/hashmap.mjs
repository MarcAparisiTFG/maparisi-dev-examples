// Qué es un hashmap: los números que salen en el vídeo, calculados de verdad.
// Uso: node hashmap.mjs

// 1. La función hash de Java (String.hashCode) y el hueco que elige un HashMap de 8 huecos (new HashMap<>(8)):
//    Java mezcla los bits altos (h ^ h >>> 16) y se queda con los últimos (& (huecos - 1)).
const hashCode = s => { let h = 0; for (const c of s) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0; return h; };
const hueco = (s, huecos = 8) => { const h = hashCode(s); return (h ^ (h >>> 16)) & (huecos - 1); };
const nombres = ['luis', 'ana', 'pau', 'hugo', 'carla', 'zoe', 'marc', 'marta'];
const huecos = nombres.map(n => ({nombre: n, letras: [...n].map(c => c.charCodeAt(0)), hash: hashCode(n), hueco: hueco(n)}));
for (const h of huecos) console.log(`"${h.nombre}" → ${h.hash} → hueco ${h.hueco}`);
// Muchas colisiones: de una lista de nombres, los que también caen en el hueco 6.
const muchos = ['maria', 'manuel', 'miguel', 'marina', 'mario', 'monica', 'martin', 'mateo', 'marcos', 'miriam', 'jose', 'lucia', 'pablo',
  'sofia', 'javier', 'elena', 'david', 'laura', 'sergio', 'paula', 'daniel', 'sara', 'jorge', 'irene', 'alba', 'raul', 'nuria', 'ivan', 'clara', 'diego'];
const enEl6 = muchos.filter(n => hueco(n) === 6);
console.log('también en el hueco 6:', enEl6.join(', '));

// 2. El ejercicio de los dos números (Two Sum) con un Map: una sola pasada.
function dosNumeros(numeros, objetivo, pasos = []) {
  const apuntados = new Map();                       // número → posición
  for (let i = 0; i < numeros.length; i++) {
    const falta = objetivo - numeros[i];
    const esta = apuntados.has(falta);
    pasos.push({i, numero: numeros[i], falta, esta});
    if (esta) return [apuntados.get(falta), i];
    apuntados.set(numeros[i], i);
  }
  return null;
}
// La pareja va al final: así se ve cómo se apuntan los que no sirven.
const NUMEROS = [2, 11, 15, 7];
const pasos = [];
const resultado = dosNumeros(NUMEROS, 9, pasos);
for (const p of pasos) console.log(`${p.numero}: falta ${p.falta} → ${p.esta ? 'apuntado' : 'no está, lo apunto'}`);
console.log('resultado', resultado);

