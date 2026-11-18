# Ejemplos de los vídeos de @maparisi_dev

Soy Marc Aparisi, programador, y hago vídeos cortos de programación en español como **@maparisi_dev**.

Todo lo que enseño en mi cuenta lo he comprobado antes: si en un vídeo doy un tiempo o una cifra, es porque lo he ejecutado. Este repo es ese código. Cada carpeta es el ejemplo real de un vídeo, para que lo pruebes tú y cambies lo que quieras.

## Cómo ejecutar cualquier ejemplo

Todos se ejecutan igual, con un solo comando:

```bash
git clone https://github.com/MarcAparisiTFG/maparisi-dev-examples.git
cd maparisi-dev-examples
./ejecutar.sh <carpeta>
```

Por ejemplo, `./ejecutar.sh shazam-huella-de-audio`. Sin carpeta, te enseña la lista. También puedes entrar en la carpeta y hacer `./ejecutar.sh`. El README de cada carpeta dice qué necesitas (Node, Python o Docker) y qué mirar en el código.

## Vídeos

| Vídeo | Carpeta | Necesitas |
| --- | --- | --- |
| [Cómo sabe Shazam si alguien hace playback](https://youtube.com/shorts/ZCQ-eeeiuuA) | [`shazam-huella-de-audio`](shazam-huella-de-audio) | Python |
| [La tecla invisible del teclado del iPhone](https://youtube.com/shorts/3VLYbm2D5Gs) | [`teclado-iphone-letra-invisible`](teclado-iphone-letra-invisible) | Node |
| [Paginación: OFFSET o cursor](https://youtube.com/shorts/JuuxXfTsxnQ) | [`paginacion-offset-o-cursor`](paginacion-offset-o-cursor) | Python (Docker para PostgreSQL) |
| [Chatbot con FastAPI, Redis, RAG y LangGraph](https://youtube.com/shorts/cYuNl0_w83o) | [`langgraph-conectar-una-llm`](langgraph-conectar-una-llm) | Python y Docker |
| [La petición OPTIONS, ¿qué es?](https://youtube.com/shorts/XJL2aqcVtbk) | [`options-la-peticion-antes-de-la-peticion`](options-la-peticion-antes-de-la-peticion) | Node |
| [Las 3 pruebas que tienen que pasar tus filtros](https://youtube.com/shorts/l9UnlywsjLc) | [`filtros-en-la-url`](filtros-en-la-url) | Python |

### Próximamente

El código ya está; el vídeo sale pronto.

| Tema | Carpeta | Necesitas |
| --- | --- | --- |
| WebSockets: el chat en tiempo real | [`websockets-chat-en-tiempo-real`](websockets-chat-en-tiempo-real) | Node |
| Access token y refresh token: dónde va cada uno | [`refresh-token-donde-va`](refresh-token-donde-va) | Node |
| async y await | [`async-await-desde-cero`](async-await-desde-cero) | Node |
| SSR: cuándo usarlo | [`ssr-csr-o-ssg`](ssr-csr-o-ssg) | Node |
| Tests de mutación | [`tests-de-mutacion`](tests-de-mutacion) | Node |
| Front, back y base de datos | [`front-back-y-base-de-datos`](front-back-y-base-de-datos) | Node |

### Sin vídeo de momento

| Tema | Carpeta | Necesitas |
| --- | --- | --- |
| Qué son los hooks de React | [`que-son-los-hooks-de-react`](que-son-los-hooks-de-react) | Node |
| Quién hace el build de tu Dockerfile | [`docker-build-y-docker-run`](docker-build-y-docker-run) | Docker |

## ¿Algo no arranca?

Abre un *issue* con la carpeta y el error que te sale.

## Dónde encontrarme

- YouTube: <!-- enlace YouTube -->
- TikTok: <!-- enlace TikTok -->
- Instagram: <!-- enlace Instagram -->

## Licencia

[MIT](LICENSE): úsalo como quieras. Cómo se añade cada ejemplo nuevo, en [CONTRIBUTING.md](CONTRIBUTING.md).
