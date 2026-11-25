// Equipo de comentarios. Sube sus versiones cuando quiere: la contenedora siempre carga comentarios.js.
import {createRoot} from 'react-dom/client';

const VERSION = process.env.VERSION;
const COMENTARIOS = [['Lucía', 'Me salió a la primera'], ['Pau', '¿Con leche de avena también?']];

function Comentarios() {
  return (
    <div style={{background: '#fff', borderRadius: 12, padding: 16}}>
      <b>Comentarios</b> <small id="version">v{VERSION}</small>
      {COMENTARIOS.map(([quien, texto]) => (
        <p key={quien}><b>{quien}</b> {texto} {VERSION === '2' && <button>Responder</button>}</p>
      ))}
    </div>
  );
}
export function montar(el) { createRoot(el).render(<Comentarios />); }
