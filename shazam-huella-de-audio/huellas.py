"""La idea de Shazam (Avery Wang, 2003), programada en pequeño con numpy.

Ejecutar: python3 huellas.py (necesita numpy)
1. Crea tres «canciones» sintéticas de 30 s (sin derechos de autor).
2. De cada una guarda solo huellas: parejas de picos del espectrograma (f1, f2, tiempo entre ellos).
3. Graba 5 s de la mitad de una, le mete ruido de bar más fuerte que la música y la busca.
4. Deja imágenes y audios en salida/.
"""
import struct
import wave
import zlib
from collections import Counter, defaultdict
from pathlib import Path

import numpy as np

SR = 8000  # el artículo trabaja a 8 kHz
VENTANA, SALTO = 1024, 256  # 128 ms de ventana, 32 ms entre columnas
SALIDA = Path(__file__).with_name("salida")
rng = np.random.default_rng(7)


# --- 1. Canciones de mentira ------------------------------------------------
def nota(freq, dur, vol=1.0):
    t = np.arange(int(SR * dur)) / SR
    env = np.minimum(1, t * 40) * np.exp(-3 * t)
    return vol * env * sum(np.sin(2 * np.pi * freq * k * t) / k for k in (1, 2, 3))


def cancion(semilla, segundos=30):
    r = np.random.default_rng(semilla)
    escala = 220 * 2 ** (np.array([0, 2, 4, 5, 7, 9, 11, 12, 14, 16]) / 12)
    pista = np.zeros(SR * segundos)
    t = 0
    while t < segundos - 1:
        dur = r.choice([0.25, 0.25, 0.5, 0.75])
        i = int(t * SR)
        trozo = nota(r.choice(escala) * r.choice([1, 2]), dur + 0.3) + nota(r.choice(escala) / 2, dur + 0.3, 0.6)
        pista[i : i + len(trozo)] += trozo[: len(pista) - i]
        t += dur
    return pista / np.abs(pista).max()


# --- 2. Huellas --------------------------------------------------------------
def espectrograma(audio):
    n = 1 + (len(audio) - VENTANA) // SALTO
    marcos = np.stack([audio[i * SALTO : i * SALTO + VENTANA] for i in range(n)]) * np.hanning(VENTANA)
    return 20 * np.log10(np.abs(np.fft.rfft(marcos, axis=1)).T + 1e-6)  # [frecuencia, tiempo] en dB


def picos(spec, radio_f=12, radio_t=6, por_segundo=30):
    """Puntos más fuertes que todo su alrededor: el «mapa de estrellas»."""
    pad = np.pad(spec, ((radio_f, radio_f), (radio_t, radio_t)), constant_values=-np.inf)
    maximo = np.full_like(spec, -np.inf)
    for df in range(2 * radio_f + 1):
        for dt in range(2 * radio_t + 1):
            maximo = np.maximum(maximo, pad[df : df + spec.shape[0], dt : dt + spec.shape[1]])
    f, t = np.nonzero((spec == maximo) & (spec > np.median(spec) + 10))
    fuerza = spec[f, t]
    tope = int(por_segundo * spec.shape[1] * SALTO / SR)
    orden = np.argsort(-fuerza)[:tope]
    return sorted(zip(t[orden], f[orden]))  # (tiempo, frecuencia), ordenados por tiempo


def huellas(puntos, abanico=5, max_dt=64):
    """Cada punto ancla se empareja con los siguientes de su zona: (f1, f2, dt) y el tiempo del ancla."""
    for i, (t1, f1) in enumerate(puntos):
        hechas = 0
        for t2, f2 in puntos[i + 1 :]:
            dt = t2 - t1
            if dt > max_dt:
                break
            if 1 <= dt and hechas < abanico:
                yield (int(f1), int(f2), int(dt)), int(t1)
                hechas += 1


# --- 3. Buscar ---------------------------------------------------------------
def buscar(indice, audio):
    desfases = defaultdict(Counter)
    pares = []
    for h, tq in huellas(picos(espectrograma(audio))):
        for nombre, tdb in indice.get(h, ()):
            desfases[nombre][tdb - tq] += 1
            pares.append((nombre, tq, tdb))
    puntuacion = {n: (c.most_common(1)[0] if c else (0, 0)) for n, c in desfases.items()}
    return puntuacion, pares


def ruido_de_bar(n):
    """Ruido rosa + murmullo de voces (ráfagas con formantes) + vasos."""
    blanco = rng.standard_normal(n)
    espectro = np.fft.rfft(blanco)
    espectro[1:] /= np.sqrt(np.arange(1, len(espectro)))
    ruido = np.fft.irfft(espectro, n)
    for _ in range(40):
        i, dur = rng.integers(0, n - SR), rng.integers(SR // 5, SR)
        t = np.arange(dur) / SR
        voz = sum(np.sin(2 * np.pi * f * t + rng.random() * 6) for f in rng.uniform(150, 1200, 4))
        ruido[i : i + dur] += 0.6 * voz * np.hanning(dur) * ruido.std()
    for _ in range(6):
        i = rng.integers(0, n - 400)
        ruido[i : i + 400] += 3 * ruido.std() * np.sin(2 * np.pi * 3100 * np.arange(400) / SR) * np.exp(-np.arange(400) / 60)
    return ruido


def mezclar(musica, ruido, snr_db):
    ruido = ruido * (np.sqrt(np.mean(musica**2)) / np.sqrt(np.mean(ruido**2))) / 10 ** (snr_db / 20)
    m = musica + ruido
    return m / np.abs(m).max()


# --- Salida para el vídeo (PNG y WAV sin librerías extra) --------------------
def png(ruta, rgb):
    alto, ancho, _ = rgb.shape
    crudo = b"".join(b"\x00" + rgb[y].astype(np.uint8).tobytes() for y in range(alto))
    trozo = lambda tipo, datos: struct.pack(">I", len(datos)) + tipo + datos + struct.pack(">I", zlib.crc32(tipo + datos))
    ruta.write_bytes(b"\x89PNG\r\n\x1a\n" + trozo(b"IHDR", struct.pack(">IIBBBBB", ancho, alto, 8, 2, 0, 0, 0)) + trozo(b"IDAT", zlib.compress(crudo, 9)) + trozo(b"IEND", b""))


def imagen_espectrograma(spec, puntos=None, escala=3):
    v = np.clip((spec - spec.max() + 70) / 70, 0, 1)[::-1]
    gris = (40 + 200 * v)
    rgb = np.stack([gris] * 3, axis=-1)
    if puntos is not None:
        rgb = np.stack([np.full_like(gris, 245)] * 3, axis=-1)  # fondo blanco: solo quedan las estrellas
        for t, f in puntos:
            y = spec.shape[0] - 1 - f
            rgb[max(0, y - 2) : y + 3, max(0, t - 1) : t + 2] = (255, 92, 40)
    return np.repeat(np.repeat(rgb, 1, axis=0), escala, axis=1)


def imagen_histograma(pares, nombre, ancho=900, alto=300):
    """Cuántos aciertos hay con cada desfase: la canción buena tiene una barra que destaca."""
    desfases = Counter(tdb - tq for n, tq, tdb in pares if n == nombre)
    rgb = np.full((alto, ancho, 3), 245.0)
    total = int(30 * SR / SALTO)
    ancho_barra = max(1, ancho // total)
    pico = max(desfases.values())
    for d, c in desfases.items():
        if 0 <= d < total:
            x = int(d / total * (ancho - ancho_barra))
            h = int(c / pico * (alto - 10))
            rgb[alto - h :, x : x + ancho_barra + 3] = (255, 92, 40) if c == pico else (150, 150, 150)
    return rgb


def wav(ruta, audio):
    with wave.open(str(ruta), "wb") as w:
        w.setnchannels(1), w.setsampwidth(2), w.setframerate(SR)
        w.writeframes((audio * 32000).astype("<i2").tobytes())


if __name__ == "__main__":
    SALIDA.mkdir(exist_ok=True)
    canciones = {f"cancion-{c}": cancion(s) for c, s in zip("abc", (1, 2, 3))}

    indice = defaultdict(list)
    for nombre, audio in canciones.items():
        n = 0
        for h, t in huellas(picos(espectrograma(audio))):
            indice[h].append((nombre, t))
            n += 1
        print(f"{nombre}: 30 s de audio → {n} huellas")
    print(f"Huellas distintas en la base: {len(indice)}")

    inicio = 12 * SR  # 5 s desde el segundo 12 de la canción B
    trozo = canciones["cancion-b"][inicio : inicio + 5 * SR]
    ruido = ruido_de_bar(len(trozo))
    for snr in (10, 0, -3, -6, -9):
        puntuacion, pares = buscar(indice, mezclar(trozo, ruido, snr))
        mejor = max(puntuacion, key=lambda n: puntuacion[n][1]) if puntuacion else None
        detalle = ", ".join(f"{n}: {puntuacion[n][1]}" for n in sorted(puntuacion))
        segundo = puntuacion[mejor][0] * SALTO / SR if mejor else 0
        print(f"5 s con ruido a {snr:+} dB → gana {mejor} en el segundo {segundo:.1f} · coincidencias alineadas: {detalle}")

    grabacion = mezclar(trozo, ruido, -3)
    wav(SALIDA / "cancion-b.wav", canciones["cancion-b"])
    wav(SALIDA / "grabacion-bar-menos3db.wav", grabacion)
    spec_b = espectrograma(canciones["cancion-b"][: 10 * SR])
    png(SALIDA / "1-espectrograma.png", imagen_espectrograma(spec_b))
    png(SALIDA / "2-estrellas.png", imagen_espectrograma(spec_b, picos(spec_b)))
    spec_g = espectrograma(grabacion)
    png(SALIDA / "3-grabacion-con-ruido.png", imagen_espectrograma(spec_g))
    png(SALIDA / "4-estrellas-grabacion.png", imagen_espectrograma(spec_g, picos(spec_g)))
    puntuacion, pares = buscar(indice, grabacion)
    png(SALIDA / "5-histograma-desfases.png", imagen_histograma(pares, "cancion-b"))
    print(f"A −3 dB: {len(pares)} aciertos en total; {puntuacion['cancion-b'][1]} de la canción B con el mismo desfase")
    print(f"Imágenes y audios en {SALIDA}")
