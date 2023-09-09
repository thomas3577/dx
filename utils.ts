import { join, toFileUrl } from 'std/path/mod.ts';
import { parse } from 'std/flags/mod.ts';
import { existsSync } from 'std/fs/mod.ts';
import type { Args } from 'std/flags/mod.ts';

export const extentions: string[] = [
  '.ts',
  '.js',
  '.tsx',
  '.jsx',
];

export const reserved: string[] = [
  'run',
  'bench',
  'bundle',
  'cache',
  'check',
  'compile',
  'completions',
  'coverage',
  'doc',
  'eval',
  'fmt',
  'init',
  'install',
  'uninstall',
  'lsp',
  'lint',
  'repl',
  'task',
  'test',
  'types',
  'upgrade',
  'vendor',
  'help',
];

export const getFilePathByName = (value: string): string | undefined =>
  extentions
    .map((extention) => [value, extention].join(''))
    .find((path) => existsSync(path));

export const getTasks = async (): Promise<string[]> => {
  const path = toFileUrl(join(Deno.cwd(), 'deno.json'));
  const importConfig = {
    assert: {
      type: 'json',
    },
  };

  const module = await import(path.href, importConfig);
  const tasks = Object.keys(module.default.tasks);

  return tasks;
};

export const parseArguments = (args: string[]): Args => {
  // All boolean arguments
  const booleanArgs = [
    'help',
  ];

  // All string arguments
  const stringArgs = [
    'test',
  ];

  // And a list of aliases
  const alias = {
    'help': 'h',
    'test': 't',
  };

  return parse(args, {
    alias,
    boolean: booleanArgs,
    string: stringArgs,
    stopEarly: false,
  });
};

export const printHelp = (): void => {
  console.log(`Usage: dx [COMMAND] [OPTIONS]`);
  console.log('\nCommands:');
  console.log('  test         Runs tests');
  console.log('  fmt          Runs fmt');
  console.log('  <TOOLS>      Runs tools (https://deno.land/manual/tools)');
  console.log('\nOptions:');
  console.log('  -h, --help   Display this help and exit');
  console.log('\n');
};

export const run = async (args: string[]): Promise<number> => {
  const command: Deno.Command = new Deno.Command(Deno.execPath(), {
    args,
  });

  const textDecoder = new TextDecoder();
  const { code, stdout, stderr } = await command.output();

  console.log(textDecoder.decode(stdout));
  console.error(textDecoder.decode(stderr));

  return code;
};
