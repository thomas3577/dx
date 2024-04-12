import { assertEquals } from '@std/assert';

import { getReserved } from './utils.ts';

Deno.test('getReserved', async (t) => {
  await t.step('should return an array of strings', () => {
    const actual = getReserved();

    assertEquals(typeof actual, 'object');
    assertEquals(Array.isArray(actual), true);
    assertEquals(actual.length > 0, true);
  });
});
