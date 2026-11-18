// Solo el test débil: el que pasa al 100 % de cobertura sin comprobar nada.
import { defineConfig } from 'vitest/config';

export default defineConfig({ test: { include: ['src/carrito.test.debil.js'] } });
