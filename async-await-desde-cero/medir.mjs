// Comprueba lo que se dice en el guion. Con el servidor arrancado: node medir.mjs
const base = 'http://localhost:4321';
const pedir = (ruta) => fetch(base + ruta).then((r) => r.json());

// 1. Una función async siempre devuelve una promesa.
async function hola() { return 'hola'; }
console.log('1. hola() devuelve:', hola());

// 2. Sin await te llevas la promesa, no los datos.
const sinAwait = pedir('/api/usuario');
console.log('2. sin await:', sinAwait);
await sinAwait;

// 3. await pausa solo su función: quien la llama sigue.
const orden = [];
async function cargar() {
  orden.push('cargar empieza');
  await pedir('/api/usuario');
  orden.push('cargar sigue tras el await');
}
const p = cargar();
orden.push('el resto del código sigue');
await p;
console.log('3. orden:', orden);

// 4. Dos await seguidos suman; Promise.all los solapa.
async function cronometro(nombre, fn) {
  const t = performance.now();
  await fn();
  console.log(`4. ${nombre}: ${((performance.now() - t) / 1000).toFixed(2)} s`);
}
await cronometro('en fila', async () => {
  await pedir('/api/usuario');
  await pedir('/api/ofertas');
});
await cronometro('a la vez', () =>
  Promise.all([pedir('/api/usuario'), pedir('/api/ofertas')]),
);

// 5. Cuando la segunda necesita la primera, van en fila sí o sí.
await cronometro('dependientes, en fila', async () => {
  const usuario = await pedir('/api/usuario');
  await pedir(`/api/pedidos?usuario=${usuario.id}`);
});

// 6. Promise.all falla en cuanto falla una.
try {
  await Promise.all([pedir('/api/usuario'), fetch('http://localhost:1').then((r) => r.json())]);
} catch (e) {
  console.log('6. Promise.all con una que falla:', e.message);
}
