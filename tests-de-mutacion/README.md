# Tests de mutación

📺 Vídeo: próximamente <!-- enlace al vídeo -->

Unos tests pueden cubrir el 100 % del código y no comprobar nada. Los tests de mutación (aquí con Stryker) cambian tu código a propósito, por ejemplo `* 0.9` por `/ 0.9`, y miran si algún test falla. Si no falla ninguno, el mutante sobrevive.

## Ejecutar

```bash
./ejecutar.sh
```

Necesitas Node 20 o superior. Pasa el test débil (100 % de cobertura, 7,69 % de mutantes muertos) y después los buenos (100 %):

```text
All files   |   7.69 |    7.69 |        1 |         0 |         12 |
All files   | 100.00 |  100.00 |       13 |         0 |          0 |
```

## Qué mirar en el código

- `src/carrito.js`: un total con cupón del 10 % a partir de 50 €.
- `src/carrito.test.debil.js`: `expect(resultado).toBeDefined()`. Pasa con cualquier resultado.
- `src/carrito.test.js`: valores exactos y el borde de 50 € y 49 €. Esos matan a los 13 mutantes.
