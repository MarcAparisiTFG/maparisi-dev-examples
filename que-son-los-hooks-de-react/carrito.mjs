// Demo del vídeo: variable normal frente a useState, useEffect que guarda el carrito
// y el hook propio useCarrito. Se ejecuta con: node carrito.mjs
import {JSDOM} from 'jsdom';
const dom = new JSDOM('<div id="a"></div><div id="b"></div><div id="c"></div>', {url: 'http://localhost/'});
globalThis.window = dom.window; globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;
const React = (await import('react')).default;
const {createRoot} = await import('react-dom/client');
const {flushSync} = await import('react-dom');
const {useState, useEffect} = React;
const h = React.createElement;

function BotonNormal() {
  let carrito = 0;
  return h('button', {onClick: () => { carrito = carrito + 1; console.log('   variable normal vale', carrito); }}, `Añadir al carrito (${carrito})`);
}

function BotonConEstado() {
  const [carrito, setCarrito] = useState(0);
  useEffect(() => {
    localStorage.setItem('carrito', String(carrito));
  }, [carrito]);
  return h('button', {onClick: () => setCarrito(carrito + 1)}, `Añadir al carrito (${carrito})`);
}

function useCarrito() {
  const [carrito, setCarrito] = useState(() => Number(localStorage.getItem('carrito') ?? 0));
  useEffect(() => { localStorage.setItem('carrito', String(carrito)); }, [carrito]);
  return {carrito, añadir: () => setCarrito((n) => n + 1)};
}
function Cabecera() {
  const {carrito} = useCarrito();
  return h('span', null, `🛒 ${carrito}`);
}

const pulsar = (id) => flushSync(() => document.querySelector(`#${id} button`).click());
for (const [id, C] of [['a', BotonNormal], ['b', BotonConEstado]]) {
  flushSync(() => createRoot(document.getElementById(id)).render(h(C)));
  console.log(C.name, '→', document.getElementById(id).textContent);
  pulsar(id); pulsar(id);
  console.log(C.name, 'tras dos clics →', document.getElementById(id).textContent);
}
console.log('localStorage carrito =', localStorage.getItem('carrito'));
flushSync(() => createRoot(document.getElementById('c')).render(h(Cabecera)));
console.log('Cabecera con useCarrito (como al recargar) →', document.getElementById('c').textContent);
