// Equipo del reproductor. Cuando termina un vídeo avisa a quien escuche con un evento.
import {useState} from 'react';
import {createRoot} from 'react-dom/client';

const EVENTO = process.env.EVENTO;   // 'video-terminado' (v1) o 'videoTerminado' (el cambio de nombre sin avisar)

function Reproductor() {
  const [visto, setVisto] = useState(false);
  const terminar = () => { setVisto(true); window.dispatchEvent(new CustomEvent(EVENTO, {detail: {id: 'cafe-con-leche'}})); };
  return (
    <div style={{background: '#111', color: '#fff', borderRadius: 12, padding: 24, minHeight: 180}}>
      <p style={{margin: 0, fontSize: 20}}>▶ Cómo hacer café con leche</p>
      <button id="terminar" onClick={terminar} style={{marginTop: 16}}>{visto ? 'Terminado' : 'Terminar vídeo'}</button>
    </div>
  );
}
export function montar(el) { createRoot(el).render(<Reproductor />); }
