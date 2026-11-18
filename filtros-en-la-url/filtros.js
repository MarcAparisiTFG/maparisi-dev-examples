// Filtros guardados en la URL (lo que se enseña en el vídeo).
const filtros = [color, talla, precio]

function leer() {
  const p = new URLSearchParams(location.search)
  for (const f of filtros) {
    f.value = p.get(f.id) ?? ''
  }
  buscar.value = p.get('q') ?? ''
  pintar()
}

function escribir() {
  const p = new URLSearchParams(location.search)
  for (const f of filtros) {
    if (f.value) p.set(f.id, f.value)
    else p.delete(f.id)
  }
  history.pushState(null, '', '?' + p)
  pintar()
}

buscar.oninput = () => {
  const p = new URLSearchParams(location.search)
  p.set('q', buscar.value)
  history.replaceState(null, '', '?' + p)
  pintar()
}

for (const f of filtros) f.onchange = escribir
addEventListener('popstate', leer)
leer()
