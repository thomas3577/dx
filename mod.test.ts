import { dx } from './mod.ts';
import { assertEquals } from 'std/assert/mod.ts';

Deno.test(dx.name, (t) => {
  t.step('should be a function', () => {
    assertEquals(typeof dx, 'function');
  });
});
