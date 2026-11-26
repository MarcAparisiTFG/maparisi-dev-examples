// En el servidor no existe localStorage: al montar esta página en el servidor, explota.
export const dynamic = 'force-dynamic';

export default function Rompe() {
  const carrito = localStorage.getItem('carrito');
  return <main>Carrito: {carrito}</main>;
}
