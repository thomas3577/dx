import { assertEquals } from '@std/assert';
import { assertSpyCalls, spy, stub } from '@std/testing/mock';

import { runner } from './run.ts';

Deno.test('run file', async () => {
  const logSpy = spy(console, 'log');
  const runCommandStub = stub(runner, 'runCommand', () => Promise.resolve(0));
  const args: string[] = ['run', 'info.ts'];
  const actual: number | undefined = await runner.run(args, false);

  assertEquals(actual, 0);
  assertSpyCalls(runCommandStub, 1);

  logSpy.restore();
  runCommandStub.restore();
});

Deno.test('run with dry-run', async () => {
  const logSpy = spy(console, 'log');
  const runCommandStub = stub(runner, 'runCommand', () => Promise.resolve(0));
  const args: string[] = ['run', 'info.ts'];
  const actual: number | undefined = await runner.run(args, true);

  assertEquals(actual, 0);
  assertSpyCalls(runCommandStub, 0);

  logSpy.restore();
  runCommandStub.restore();
});
