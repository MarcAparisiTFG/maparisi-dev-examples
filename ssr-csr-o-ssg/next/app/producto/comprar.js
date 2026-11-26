'use client';
// Usa clics y estado: tiene que ir también al cliente.
import { useState } from 'react';

export function Comprar() {
  const [hecho, setHecho] = useState(false);
  return <button onClick={() => setHecho(true)}>{hecho ? '✓ Añadido' : 'Comprar'}</button>;
}
