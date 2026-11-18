# La tecla invisible del teclado del iPhone

📺 [Ver el vídeo](https://youtube.com/shorts/3VLYbm2D5Gs)

Las teclas se ven iguales, pero la zona que acepta tu toque crece en la letra que probablemente viene: después de «hol», tocar entre la A y la S casi siempre da la A. Es la idea de la patente de Apple US 8,232,973, programada en pequeño.

## Ejecutar

```bash
./ejecutar.sh
```

Necesitas Node 18 o superior. Enseña qué tecla gana según dónde toques:

```text
toque al 70 % hacia la S → sin escribir nada: s | tras "hol": a
toque al 90 % hacia la S → sin escribir nada: s | tras "hol": s
```

Para tocarlo tú, abre `index.html` en el navegador, escribe «hol» y marca **Ver zonas invisibles**.

## Qué mirar en el código

En `teclado.js`:

- `probabilidades(prefijo)`: con una lista de palabras y su frecuencia, la probabilidad de cada letra siguiente.
- `teclaTocada(x, y, prefijo)`: gana la tecla con menos coste = distancia del dedo − probabilidad de la letra (en logaritmo).
- `ANCLA`: si tocas el centro exacto de una tecla, sale esa siempre.
