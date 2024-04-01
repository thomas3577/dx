import { assertEquals } from '@std/assert';
import { assertSpyCall, spy } from '@std/testing/mock';

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
  const actual: number | undefined = await dx(args);

  assertEquals(actual, 0);
});

Deno.test('dx returns code 0 if args null', async () => {
  const args: string[] = null as unknown as string[];
  const actual: number | undefined = await dx(args);

  assertEquals(actual, 0);
});

Deno.test('dx returns code 0 if args empty', async () => {
  const args: string[] = [];
  const actual: number | undefined = await dx(args);

  assertEquals(actual, 0);
});

Deno.test('dx returns code 0 if args contains --help', async () => {
  const args: string[] = ['--help'];
  const actual: number | undefined = await dx(args);

  assertEquals(actual, 0);
});

Deno.test('dx returns code 0 if args contains --version', async () => {
  const args: string[] = ['--version'];
  const actual: number | undefined = await dx(args);

  assertEquals(actual, 0);
});

Deno.test('dx returns code 0 if args contains known command', async () => {
  const args: string[] = ['fmt'];
  const actual: number | undefined = await dx(args);

  assertEquals(actual, 0);
});

Deno.test('dx returns code 0 if args contains known file', async () => {
  const args: string[] = ['dx-info.ts'];
  const actual: number | undefined = await dx(args);

  assertEquals(actual, 0);
});

Deno.test(`should run commands`, async () => {
  const cases = [
    { args: ['fmt'], expected: ['dx > deno', 'fmt'] },
    { args: ['fmt', '--check'], expected: ['dx > deno', 'fmt --check'] },
    { args: ['test'], expected: ['dx > deno', 'task test'] },
    { args: ['install'], expected: ['dx > deno', 'task install'] },
    { args: ['help'], expected: ['dx > deno', 'help'] },
    { args: ['compile'], expected: ['dx > deno', 'compile'] },
    { args: ['run', 'app.ts'], expected: ['dx > deno', 'run app.ts'] },
    { args: ['run', 'main.ts a b -c --quiet'], expected: ['dx > deno', 'run main.ts a b -c --quiet'] },
    { args: ['run', 'main.ts', 'a', 'b', '-c', '--quiet'], expected: ['dx > deno', 'run main.ts a b -c --quiet'] },
    { args: ['run', '--allow-net main.ts'], expected: ['dx > deno', 'run --allow-net main.ts'] },
  ];

  for (const c of cases) {
    const logSpy = spy(console, 'log');
    const args: string[] = [...c.args, '--dryrun'];
    const actual: number | undefined = await dx(args);

    assertEquals(actual, 0);
    assertSpyCall(logSpy, 0, { args: c.expected });

    logSpy.restore();
  }
});
