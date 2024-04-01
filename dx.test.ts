import { assertEquals } from '@std/assert';
import { assertSpyCall, assertSpyCalls, spy, stub } from '@std/testing/mock';

import { dx } from './dx.ts';
import { runner } from './run.ts';

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
  const runSpy = spy(runner, 'run');
  const args: string[] = undefined as unknown as string[];

  const actual: number | undefined = await dx(args);

  assertEquals(actual, 1);
  assertSpyCalls(runSpy, 0);

  runSpy.restore();
});

Deno.test('dx returns code 0 if args null', async () => {
  const runSpy = spy(runner, 'run');
  const args: string[] = null as unknown as string[];
  const actual: number | undefined = await dx(args);

  assertEquals(actual, 1);
  assertSpyCalls(runSpy, 0);

  runSpy.restore();
});

Deno.test('dx returns code 0 if args empty', async () => {
  const runSpy = spy(runner, 'run');
  const args: string[] = [];
  const actual: number | undefined = await dx(args);

  assertEquals(actual, 1);
  assertSpyCalls(runSpy, 0);

  runSpy.restore();
});

Deno.test('Shows the help of dx', async () => {
  const runSpy = spy(runner, 'run');
  const args: string[] = ['--help'];
  const actual: number | undefined = await dx(args);

  assertEquals(actual, 0);
  assertSpyCalls(runSpy, 0);

  runSpy.restore();
});

Deno.test('Shows the version of dx', async () => {
  const runSpy = spy(runner, 'run');
  const args: string[] = ['--version'];
  const actual: number | undefined = await dx(args);

  assertEquals(actual, 0);
  assertSpyCalls(runSpy, 0);

  runSpy.restore();
});

Deno.test('dx runs a known command', async () => {
  const runSpy = spy(runner, 'run');
  const args: string[] = ['fmt'];
  const actual: number | undefined = await dx(args);

  assertEquals(actual, 0);
  assertSpyCalls(runSpy, 1);

  runSpy.restore();
});

Deno.test('dx do not runs a known command with dry-run', async () => {
  const runCommandStub = stub(runner, 'runCommand', () => Promise.resolve(0));
  const args: string[] = ['fmt', '--dry-run'];
  const actual: number | undefined = await dx(args);

  assertEquals(actual, 0);
  assertSpyCalls(runCommandStub, 0);

  runCommandStub.restore();
});

Deno.test('dx runs an existing file', async () => {
  const runSpy = spy(runner, 'run');
  const args: string[] = ['info.ts'];
  const actual: number | undefined = await dx(args);

  assertEquals(actual, 0);
  assertSpyCalls(runSpy, 1);

  runSpy.restore();
});

Deno.test('dx do not runs an existing file with dry-run', async () => {
  const runCommandStub = stub(runner, 'runCommand', () => Promise.resolve(0));
  const args: string[] = ['info.ts', '--dry-run'];
  const actual: number | undefined = await dx(args);

  assertEquals(actual, 0);
  assertSpyCalls(runCommandStub, 0);

  runCommandStub.restore();
});

Deno.test(`dx runs the commands...`, async () => {
  const cases = [
    { args: ['fmt'], expected: ['dx > deno fmt'] },
    { args: ['fmt', '--check'], expected: ['dx > deno fmt --check'] },
    { args: ['test'], expected: ['dx > deno task test'] },
    { args: ['lint'], expected: ['dx > deno lint'] },
    { args: ['lint', '--fix'], expected: ['dx > deno lint --fix'] },
    { args: ['install'], expected: ['dx > deno task install'] },
    { args: ['help'], expected: ['dx > deno help'] },
    { args: ['compile'], expected: ['dx > deno compile'] },
    { args: ['app.ts'], expected: ['dx > deno run app.ts'] },
    { args: ['main.ts', 'a', 'b', '-c', '--quiet'], expected: ['dx > deno run main.ts a b -c --quiet'] },
    { args: ['--allow-net', 'main.ts'], expected: ['dx > deno run --allow-net main.ts'] },
    { args: ['--watch', 'main.ts'], expected: ['dx > deno run --watch main.ts'] },
  ];

  for (const c of cases) {
    const runCommandStub = stub(runner, 'runCommand', () => Promise.resolve(0));
    const logSpy = spy(console, 'log');
    const actual: number | undefined = await dx(c.args);

    assertEquals(actual, 0);
    assertSpyCall(logSpy, 0, { args: c.expected });
    assertSpyCalls(runCommandStub, 1);

    logSpy.restore();
    runCommandStub.restore();
  }
});
