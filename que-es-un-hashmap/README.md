# Vídeo 86 · Qué es un hashmap

📺 Vídeo: próximamente <!-- enlace al vídeo -->

Un hashmap guarda parejas clave → valor. La función hash convierte la clave en un número y ese número decide el hueco donde se guarda: no hay que leer la lista entera. Si dos claves caen en el mismo hueco no se pierde nada, porque se guarda la clave junto al valor.

## Ejecutar

```bash
./ejecutar.sh
```

Necesitas Node 18 o superior. Sale esto:

```text
"marc" → 3344069 → hueco 6
"marta" → 103666763 → hueco 6
también en el hueco 6: jose, nuria
2: falta 7 → no está, lo apunto
11: falta -2 → no está, lo apunto
15: falta -6 → no está, lo apunto
7: falta 2 → apuntado
resultado [ 0, 3 ]
```

## Qué mirar en el código

- `hashCode`: la función hash de los `String` de Java, letra a letra (`31 · h + código de la letra`).
- `hueco`: cómo un `HashMap` de Java con 8 huecos convierte ese número en un hueco (mezcla los bits altos y se queda con los 3 últimos). Marta y Marc caen en el mismo: una colisión.
- `dosNumeros`: el ejercicio Two Sum de LeetCode con un `Map`, en una sola pasada. Por cada número calcula cuánto le falta, mira si ya está apuntado y, si no, lo apunta. Cambia la lista o el objetivo y mira los pasos.
