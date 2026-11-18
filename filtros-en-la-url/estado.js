// Versión mala: los filtros viven en una variable de la pestaña (como useState o un store).
const filtros = [color, talla, precio]
const estado = { color: '', talla: '', precio: '', q: '' }

for (const f of filtros) f.onchange = () => { estado[f.id] = f.value; pintar() }
buscar.oninput = () => { estado.q = buscar.value; pintar() }
pintar()
