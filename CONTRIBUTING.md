# Cómo se añade un ejemplo

Cada vídeo con demo nuevo entra aquí igual que los anteriores.

## 1. Una carpeta por vídeo

- El nombre de la carpeta es el slug del vídeo (`paginacion-offset-o-cursor`).
- Solo el código de la demo: nada de `node_modules`, `venv`, bases de datos ni salidas generadas (ya están en `.gitignore`).

## 2. Un solo comando: `ejecutar.sh`

Cada carpeta tiene un `ejecutar.sh` ejecutable (`chmod +x`) que instala lo que haga falta y arranca la demo. Empieza así:

```sh
#!/bin/sh
# Ejecuta el ejemplo: ./ejecutar.sh
set -e
cd "$(dirname "$0")"
```

- Node con dependencias: `[ -d node_modules ] || npm install --silent` y después el comando.
- Python con dependencias: un `requirements.txt` y un `venv` dentro de la carpeta.
- Si arranca un servidor, imprime antes la URL que hay que abrir.
- Si deja algo encendido (un contenedor de Docker), di cómo pararlo.

El `./ejecutar.sh <carpeta>` de la raíz lo encuentra solo.

## 3. README con la misma plantilla

```markdown
# Título del vídeo

📺 [Ver el vídeo](https://youtube.com/shorts/ID)        ← o «Vídeo: próximamente»

Qué enseña, en una o dos frases.

## Ejecutar

    ./ejecutar.sh

Qué necesitas (Node 18+, Python 3, Docker) y qué vas a ver. Si hay una salida corta que lo demuestre, pégala.

## Qué mirar en el código

- `archivo`: la parte importante y por qué.
```

Y una fila en la tabla del README raíz: en «Próximamente» hasta que se publique y en «Vídeos» con su enlace después.

## 4. Nunca claves

- Las claves van en `.env`, que nunca se sube. En el repo solo va `.env.example` con los valores vacíos, y la demo tiene que funcionar sin clave (simulando la parte que la necesita).
- Activa los hooks una vez después de clonar:

  ```bash
  git config core.hooksPath .githooks
  ```

  El `pre-commit` para el commit si encuentra claves, tokens, archivos `.env`, rutas personales o correos. A mano: `python3 scripts/buscar-secretos.py --todo`.
- Antes de cada push, pásalo también por todo el historial: `python3 scripts/buscar-secretos.py --historial`.
- Si una línea es un falso positivo a propósito, añade el comentario `secretos: permitido` en esa línea.
