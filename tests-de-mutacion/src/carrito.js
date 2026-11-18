export function total(precios, cupon) {
  let suma = 0;
  for (const p of precios) suma += p;
  if (cupon === 'REBAJAS10' && suma >= 50) {
    return suma * 0.9;
  }
  return suma;
}
