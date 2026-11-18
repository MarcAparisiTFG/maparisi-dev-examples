import { test, expect } from 'vitest';
import { total } from './carrito.js';

test('el cupón quita un 10 %', () => {
  expect(total([50, 30], 'REBAJAS10')).toBe(72);
});

test('sin cupón no hay descuento', () => {
  expect(total([50, 30], null)).toBe(80);
});

test('justo 50 € ya tiene descuento', () => {
  expect(total([50], 'REBAJAS10')).toBe(45);
});

test('por debajo de 50 € no hay descuento', () => {
  expect(total([49], 'REBAJAS10')).toBe(49);
});
