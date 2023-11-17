import { assertEquals } from '$std/assert/mod.ts';
import { dx } from './dx.ts';

Deno.test('dx is a function', () => {
  assertEquals(typeof dx, 'function');
});

Deno.test('dx returns a promise', () => {
  const args: string[] = [];
  const actual = dx(args);

  assertEquals(typeof actual, 'object');
  assertEquals(typeof actual.then, 'function');
});

Deno.test('dx returns code 0 if args undefined', async () => {
  const args: string[] = undefined as unknown as string[];
  const actual = await dx(args);

  assertEquals(actual, 0);
});

Deno.test('dx returns code 0 if args null', async () => {
  const args: string[] = null as unknown as string[];
  const actual = await dx(args);

  assertEquals(actual, 0);
});
