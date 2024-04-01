import { handler, needs, task } from '@dx/tano';
import { join } from '@std/path';
import { ensureDir, exists } from '@std/fs';

const writeEditorConfig = async (): Promise<void> => {
  const path = join(Deno.cwd(), '.editorconfig');

  const isReadableFile = await exists(path, {
    isFile: true,
  });

  if (isReadableFile) {
    return;
  }

  const content = `root = true

    [*]
    charset = utf-8
    end_of_line = lf
    indent_size = 2
    indent_style = space
    insert_final_newline = true
    trim_trailing_whitespace = true
    quote_type = single`.replaceAll('    ', '');

  return await Deno.writeTextFile(path, content);
};

const writeVscodeSettings = async (): Promise<void> => {
  const directory = join(Deno.cwd(), '.vscode');
  const path = join(directory, 'settings.json');

  const isReadableFile = await exists(path, {
    isFile: true,
  });

  if (isReadableFile) {
    return;
  }

  await ensureDir(directory);

  const settingsJson = {
    'deno.enable': true,
    'deno.lint': true,
  };

  const content = JSON.stringify(settingsJson, null, 2);

  return await Deno.writeTextFile(path, content, { create: true });
};

const writeDenoJson = async (entrypoint: string): Promise<void> => {
  const path = join(Deno.cwd(), 'deno.json');

  const isReadableFile = await exists(path, {
    isFile: true,
  });

  if (isReadableFile) {
    return;
  }

  const denoJson = {
    version: '0.0.1',
    tasks: {
      dev: `deno run --watch ${entrypoint}`,
      test: `deno test --watch`,
    },
    fmt: {
      useTabs: false,
      lineWidth: 360,
      indentWidth: 2,
      singleQuote: true,
      proseWrap: 'preserve',
      exclude: [
        '.vscode/**',
        'coverage',
        'cspell.json',
      ],
    },
  };

  const content = JSON.stringify(denoJson, null, 2);

  return await Deno.writeTextFile(path, content);
};

const writeEntrypoint = async (entrypoint: string): Promise<void> => {
  const path = join(Deno.cwd(), entrypoint);

  const isReadableFile = await exists(path, {
    isFile: true,
  });

  if (isReadableFile) {
    return;
  }

  const content = `export function add(a: number, b: number): number {
      return a + b;
    }

    // Learn more at https://deno.land/manual/examples/module_metadata#concepts
    if (import.meta.main) {
      console.log('Add 2 + 3 =', add(2, 3));
    }`.replaceAll('    ', '');

  return await Deno.writeTextFile(path, content);
};

const writeTest = async (entrytest: string, entrypoint: string): Promise<void> => {
  const path = join(Deno.cwd(), entrytest);
  const content = `import { assertEquals } from 'https://deno.land/std@0.220.0/assert/mod.ts';
    import { add } from './${entrypoint}';

    Deno.test(function addTest() {
      assertEquals(add(2, 3), 5);
    });
  `.replaceAll('    ', '');

  return await Deno.writeTextFile(path, content);
};

export const init = async (args: string[], dryrun: boolean = false): Promise<number> => {
  console.log('dx > init', args.join(' '));

  if (dryrun) {
    return 0;
  }

  const entrypoint = `${args.at(0)}.ts`;
  const entrytest = `${args.at(0)}.test.ts`;

  handler.clear();

  task(
    'default',
    needs(
      task('create:.editorconfig', writeEditorConfig),
      task('create:.vscode/settings.json', writeVscodeSettings),
      task('create:deno.json', writeDenoJson.bind(this, entrypoint)),
      task(`create:${entrypoint}`, writeEntrypoint.bind(this, entrypoint)),
      task(`create:${entrytest}`, writeTest.bind(this, entrytest, entrypoint)),
    ),
  );

  await handler.run('default', { noCache: true });

  return 0;
};
