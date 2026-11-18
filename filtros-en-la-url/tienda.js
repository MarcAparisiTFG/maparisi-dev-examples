// Catálogo y pintado, comunes a las dos versiones.
const colores = ['negro', 'blanco', 'azul', 'verde']
const tallas = ['s', 'm', 'l']
const productos = []
for (let i = 1; i <= 60; i++) {
  productos.push({ nombre: 'Camiseta ' + i, color: colores[i % 4], talla: tallas[i % 3], precio: 8 + (i * 13) % 22 })
}
function pintar() {
  const max = Number(precio.value || 999), q = buscar.value.toLowerCase()
  const f = productos.filter((x) => (!color.value || x.color === color.value) && (!talla.value || x.talla === talla.value)
    && x.precio <= max && x.nombre.toLowerCase().includes(q))
  lista.innerHTML = f.slice(0, 6).map((x) => `<li>${x.nombre} · ${x.color} · ${x.talla.toUpperCase()} · ${x.precio} €</li>`).join('')
  total.textContent = f.length + ' camisetas'
}
