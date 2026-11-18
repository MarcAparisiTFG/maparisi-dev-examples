// La idea de la patente de Apple (US 8,232,973), programada en pequeño:
// cada tecla se ve igual, pero su zona de toque crece si es la letra que probablemente viene.
(function () {
  // Palabras frecuentes con un peso aproximado (cuanto más alto, más se usa).
  const PALABRAS = {
    hola: 90, hoy: 60, hora: 40, hombre: 25, hotel: 15, hogar: 10, holgado: 1, holanda: 3,
    casa: 80, cosa: 50, como: 90, con: 95, cuando: 70, cada: 50, claro: 40, calle: 30,
    que: 99, quiero: 50, queda: 30, para: 95, pero: 90, por: 95, puedo: 50, pues: 40,
    gracias: 70, genial: 30, gente: 40, guay: 20, mañana: 60, mucho: 60, mismo: 40,
    marc: 2, mar: 30, madre: 30, nada: 50, noche: 40, nos: 50, sí: 60, son: 60, sin: 50,
    tarde: 40, tengo: 60, tiempo: 50, todo: 70, vale: 60, vamos: 50, ver: 50, voy: 60,
    bien: 80, bueno: 60, buenas: 40, dónde: 40, día: 50, dos: 40, esto: 60, está: 70,
    ahora: 60, algo: 50, así: 50, aquí: 50, años: 40, luego: 50, llego: 30, llamo: 30,
  };

  const FILAS = ['qwertyuiop', 'asdfghjklñ', 'zxcvbnm'];

  // Probabilidad de cada letra siguiente según lo que llevas escrito de la palabra.
  // Se mezcla con un poco de reparto igualado (SUAVIZADO) para que ninguna letra valga cero.
  const SUAVIZADO = 0.05;
  const LETRAS = FILAS.join('');
  function probabilidades(prefijo) {
    const cuenta = {};
    let total = 0;
    for (const [palabra, peso] of Object.entries(PALABRAS)) {
      if (palabra.length > prefijo.length && palabra.startsWith(prefijo)) {
        const letra = palabra[prefijo.length];
        cuenta[letra] = (cuenta[letra] || 0) + peso;
        total += peso;
      }
    }
    const p = {};
    for (const l of LETRAS) {
      const modelo = total ? (cuenta[l] || 0) / total : 1 / LETRAS.length;
      p[l] = (1 - SUAVIZADO) * modelo + SUAVIZADO / LETRAS.length;
    }
    return p;
  }

  // Posiciones de las teclas (centro), en un teclado de 390 px de ancho.
  function teclas(ancho = 390) {
    const w = ancho / 10;
    const out = [];
    FILAS.forEach((fila, f) => {
      const margen = f === 2 ? w * 1.5 : 0;
      [...fila].forEach((letra, i) => {
        out.push({ letra, x: margen + w * i + w / 2, y: 30 + f * 54, w: w - 6, h: 44 });
      });
    });
    return out;
  }

  // Lo importante: la tecla que gana un toque.
  // Coste = la distancia del dedo a la tecla (al cuadrado, como una campana)
  //       − lo probable que es la letra (en logaritmo). Gana el coste más bajo: la tecla que queda «más cerca».
  // ANCLA: si tocas el centro de una tecla, sale esa tecla siempre (Gunawardana y otros, 2010).
  const SIGMA = 14;
  const ANCLA = 7; // se puede cambiar desde fuera: Teclado.ANCLA = 0 la apaga
  function teclaTocada(x, y, prefijo, lista = teclas()) {
    for (const t of lista) {
      const ancla = globalThis.Teclado.ANCLA;
      if (ancla > 0 && Math.abs(x - t.x) <= ancla && Math.abs(y - t.y) <= ancla) return t.letra;
    }
    const p = probabilidades(prefijo);
    let mejor = null;
    let min = Infinity;
    for (const t of lista) {
      const d = Math.hypot(x - t.x, y - t.y);
      const coste = d * d / (2 * SIGMA * SIGMA)
                  - Math.log(p[t.letra]);
      if (coste < min) { min = coste; mejor = t.letra; }
    }
    return mejor;
  }

  globalThis.Teclado = { PALABRAS, FILAS, probabilidades, teclas, teclaTocada, SIGMA, ANCLA, SUAVIZADO };
})();
