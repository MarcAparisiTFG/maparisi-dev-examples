import {useState} from 'react';
export function Perfil({logueado}) {
  const [nombre] = useState('Marc');
  if (logueado) {
    const [carrito] = useState(3);
  }
  const [tema] = useState('oscuro');
  return <p>{nombre} · {tema}</p>;
}
