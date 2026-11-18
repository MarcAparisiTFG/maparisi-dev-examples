# Qué son los hooks de React

📺 Vídeo: aún no hay <!-- enlace al vídeo -->

Un hook es una función de React que guarda algo entre renders. React los reconoce por el orden en que los llamas; por eso no pueden ir dentro de un `if`.

## Ejecutar

```bash
./ejecutar.sh
```

Necesitas Node 20 o superior. Enseña tres cosas: una variable normal frente a `useState`, un `useState` dentro de un `if` (los errores de React salen a propósito) y ESLint detectándolo antes de ejecutar.

```text
BotonNormal tras dos clics → Añadir al carrito (0)
BotonConEstado tras dos clics → Añadir al carrito (2)
```

## Qué mirar en el código

- `carrito.mjs`: `BotonNormal` (no cambia), `BotonConEstado` (`useState` + `useEffect` que guarda en `localStorage`) y `useCarrito`, un hook propio.
- `Perfil.jsx`: el `useState` dentro de un `if` que rompe el orden.
