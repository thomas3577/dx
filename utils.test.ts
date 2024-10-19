import { assertEquals } from '@std/assert';

import { getCodeFilePathByName, getReserved, getTasks, isAcceptedFile, parseDxArgs } from './utils.ts';

Deno.test(getReserved.name, async (t) => {
  await t.step('should return an array of strings', () => {
    const actual = getReserved();

    assertEquals(typeof actual, 'object');
    assertEquals(Array.isArray(actual), true);
    assertEquals(actual.length > 0, true);
  });
});

Deno.test(getCodeFilePathByName.name, async (t) => {
  await t.step('should return a string', () => {
    const actual = getCodeFilePathByName('info');

    assertEquals(typeof actual, 'string');
    assertEquals(actual, 'info.ts');
  });

  await t.step('should return undefined', () => {
    const actual = getCodeFilePathByName('unknown');

    assertEquals(actual, undefined);
  });
});

Deno.test(getTasks.name, async (t) => {
  await t.step('should return an array of strings', async () => {
    const actual = await getTasks();

    assertEquals(typeof actual, 'object');
    assertEquals(Array.isArray(actual), true);
    assertEquals(actual.length > 0, true);
    assertEquals(actual.at(0), 'lock');
    assertEquals(actual.at(1), 'test');
  });
});

Deno.test(parseDxArgs.name, async (t) => {
  await t.step('should return an object', () => {
    const actual = parseDxArgs(['app.ts']);

    assertEquals(actual.args.at(0), 'app.ts');
  });
});

Deno.test(isAcceptedFile.name, async (t) => {
  await t.step('should return true', () => {
    const actual = isAcceptedFile('https://huberhaus.ch/file.ts');

    assertEquals(actual, true);
  });

  await t.step('should return true', () => {
    const actual = isAcceptedFile('file.ts');

    assertEquals(actual, true);
  });

  await t.step('should return false', () => {
    const actual = isAcceptedFile('unknown');

    assertEquals(actual, false);
  });
});
