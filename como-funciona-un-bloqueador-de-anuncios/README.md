# Cómo funciona un adblocker

📺 Vídeo: próximamente <!-- enlace al vídeo -->

Un bloqueador de anuncios compara cada petición de la página con una lista como [EasyList](https://easylist.to/): si va a un dominio de anuncios (`||g.doubleclick.net^`), la cancela antes de que salga. Los anuncios escritos en el propio HTML los oculta con selectores de CSS (`##.ad-slot`), y eso puede esconder sin querer partes de tu web.

## Ejecutar

```bash
./ejecutar.sh
```

Necesitas Node 18 o superior y Google Chrome (si no está en la ruta de macOS, pásala en `CHROME`). Descarga la EasyList del día, abre la tienda de `web/` dos veces y te dice qué ha pasado:

```text
sin-bloqueador: 9 peticiones
con-bloqueador: 6 peticiones
  ✕ pagead2.googlesyndication.com        net::ERR_BLOCKED_BY_CLIENT.Inspector ||pagead2.googlesyndication.com^
  ✕ securepubads.g.doubleclick.net       net::ERR_BLOCKED_BY_CLIENT.Inspector ||g.doubleclick.net^
  oculto por ##.ad-label: <label class="ad-label"> Dirección de envío </label>
  oculto por ##.ad-slot: <div class="ad-slot"> Publicidad · Gafas de sol -50 % </div>
```

(`.Inspector` es cómo lo llama Chrome cuando la petición se cancela desde las herramientas de automatización; con una extensión sale `net::ERR_BLOCKED_BY_CLIENT`). Deja también `resultado.json` y dos capturas, `sin-bloqueador.png` y `con-bloqueador.png`.

## Qué mirar en el código

- `web/index.html`: los dos scripts de anuncios que vienen de otro servidor, el anuncio escrito en la página (`.ad-slot`) y la etiqueta del formulario con una clase que coincide sin querer con una regla (`.ad-label`).
- `bloquear.mjs`: un bloqueador mínimo con las reglas más simples de la lista. `reglaDe()` busca el dominio y sus dominios padre en las reglas `||dominio^` y la petición se cancela con `req.abort('blockedbyclient')`; las reglas `##.clase` se meten como CSS con `display: none`.
- Un bloqueador de verdad entiende muchas más reglas (opciones como `$third-party`, excepciones `@@`, selectores avanzados).

La imagen de las zapatillas es de [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) de Microsoft (MIT).
