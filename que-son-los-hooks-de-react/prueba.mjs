import {JSDOM} from 'jsdom';
const dom = new JSDOM('<div id="root"></div>');
globalThis.window = dom.window; globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const React = (await import('react')).default;
const {createRoot} = await import('react-dom/client');
const {act} = React;
const {useState} = React;

function Perfil({logueado}) {
  const [nombre] = useState('Marc');
  if (logueado) {
    const [carrito] = useState(3); globalThis.visto = carrito;
  }
  const [tema] = useState('oscuro');
  return React.createElement('p', null, `${nombre} · ${tema}`);
}

const root = createRoot(document.getElementById('root'));
const orden = process.argv[2] === 'al-reves' ? [true, false] : [false, true];
for (const logueado of orden) {
  try {
    const {flushSync} = await import("react-dom"); flushSync(() => root.render(React.createElement(Perfil, {logueado})));
    console.log(`logueado=${logueado} →`, document.getElementById("root").textContent, "· carrito:", globalThis.visto); globalThis.visto = undefined;
  } catch (e) { console.log(`logueado=${logueado} → ERROR:`, e.message.split('\n')[0]); }
}
