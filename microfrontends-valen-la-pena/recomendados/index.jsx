// Equipo de recomendados. Escucha el evento del reproductor para poner el siguiente vídeo.
import {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';

const VIDEOS = ['Tostadas', 'Zumo de naranja', 'Tortilla'];

function Recomendados() {
  const [siguiente, setSiguiente] = useState(null);
  useEffect(() => {
    const alTerminar = () => setSiguiente(VIDEOS[0]);
    window.addEventListener('video-terminado', alTerminar);
    return () => window.removeEventListener('video-terminado', alTerminar);
  }, []);
  return (
    <div style={{background: '#fff', borderRadius: 12, padding: 16}}>
      <b>Recomendados</b>
      <p id="siguiente">{siguiente ? `Siguiente: ${siguiente}` : '—'}</p>
      {VIDEOS.map(v => <p key={v}>{v}</p>)}
    </div>
  );
}
export function montar(el) { createRoot(el).render(<Recomendados />); }
