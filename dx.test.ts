import { dx } from './dx.ts';
import { assertEquals } from 'std/assert/mod.ts';

Deno.test(dx.name, (t) => {
  t.step('dx is a function', () => {
    assertEquals(typeof dx, 'function');
  });
});
