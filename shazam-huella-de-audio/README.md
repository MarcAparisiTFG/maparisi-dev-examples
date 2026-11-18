# Cómo sabe Shazam si alguien hace playback

📺 [Ver el vídeo](https://youtube.com/shorts/ZCQ-eeeiuuA)

Shazam no compara el audio: guarda los picos más fuertes del espectrograma por parejas y cuenta cuántas coinciden con el mismo desfase. Por eso encuentra la canción aunque haya más ruido que música.

## Ejecutar

```bash
./ejecutar.sh
```

Necesitas Python 3 (instala numpy en un `venv` de la carpeta). Crea tres «canciones» sintéticas, coge 5 s de una, le mete ruido de bar y la busca:

```text
5 s con ruido a -9 dB → gana cancion-b en el segundo 12.0 · coincidencias alineadas: cancion-a: 2, cancion-b: 10, cancion-c: 1
```

En `salida/` deja el espectrograma, el «mapa de estrellas», el histograma de desfases y los audios para escucharlos.

## Qué mirar en el código

En `huellas.py`:

- `picos()`: los puntos más fuertes que todo su alrededor (el mapa de estrellas).
- `huellas()`: cada pico se empareja con los siguientes: `(f1, f2, dt)`.
- `buscar()`: cuenta las huellas que coinciden **con el mismo desfase**. La barra que destaca es la canción.

Basado en Avery Wang, «An Industrial-Strength Audio Search Algorithm» (ISMIR 2003).
