// Componente de servidor (por defecto): se ejecuta en el servidor en cada visita.
import { Comprar } from './comprar';

export const dynamic = 'force-dynamic';

async function leerStock() {
  await new Promise((ok) => setTimeout(ok, 300)); // la «base de datos» tarda 300 ms
  return Math.floor(Math.random() * 9);
}

export default async function Producto() {
  const stock = await leerStock();
  return (
    <main>
      <h1>Auriculares</h1>
      <p>59 € · quedan {stock}</p>
      <Comprar />
    </main>
  );
}
