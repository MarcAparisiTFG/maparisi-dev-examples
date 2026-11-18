import { test, expect } from 'vitest';
import { total } from './carrito.js';

test('calcula el total con cupón', () => {
  const resultado = total([50, 30], 'REBAJAS10');
  expect(resultado).toBeDefined();
});

test('calcula el total sin cupón', () => {
  const resultado = total([20], null);
  expect(typeof resultado).toBe('number');
});
