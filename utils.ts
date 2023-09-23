import { join, toFileUrl } from 'std/path/mod.ts';
import { parse } from 'std/flags/mod.ts';
import { existsSync } from 'std/fs/mod.ts';
import type { Args } from 'std/flags/mod.ts';
import { VERSION } from './version.ts';

const denoPath = Deno.execPath();
const textDecoder = new TextDecoder();

const extentions: string[] = [
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
  'version',
];

export const getFilePathByName = (value: string): string | undefined =>
  extentions
    .map((extention) => [value, extention].join(''))
    .find((path) => existsSync(path));

export const getTasks = async (): Promise<string[]> => {
  const url: URL = toFileUrl(join(Deno.cwd(), 'deno.json'));
  const importConfig = {
    assert: {
      type: 'json',
    },
  };

  const module = await import(url.href, importConfig);
  const tasks: string[] = Object.keys(module.default.tasks);

  return tasks;
};

export const parseArguments = (args: string[]): Args =>
  parse(args, {
    alias: {
      'help': 'h',
      'version': 'v',
    },
    boolean: [
      'help',
      'version',
    ],
    stopEarly: false,
  });

export const printVersion = (): void => {
  console.log(`Deno version ${Deno.version.deno}`);
  console.log(`ts version   ${Deno.version.typescript}`);
  console.log(`V8 version   ${Deno.version.v8}`);
  console.log(`%cdx version   ${VERSION}`, 'color: green; font-weight: bold');
};

export const printHelp = (): void => {
  printVersion();
  console.log('\n');
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
  const options: Deno.CommandOptions = {
    args,
  };

  const command = new Deno.Command(denoPath, options);

  const { code, stdout, stderr } = await command.output();

  console.log(textDecoder.decode(stdout));
  console.error(textDecoder.decode(stderr));

  return code;
};
