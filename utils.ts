import { join, toFileUrl } from 'std/path/mod.ts';
import { parse } from 'std/flags/mod.ts';
import { exists, existsSync } from 'std/fs/mod.ts';
import type { Args } from 'std/flags/mod.ts';
import { VERSION } from './version.ts';

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
  const path = join(Deno.cwd(), 'deno.json');

  const isFile = await exists(path, {
    isReadable: true,
    isFile: true,
  });

  if (!isFile) {
    return [];
  }

  const url: URL = toFileUrl(path);
  const module = await import(url.href, {
    assert: {
      type: 'json',
    },
  });

  const tasks: string[] = Object.keys(module.default?.tasks ?? {});

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
  const command = new Deno.Command(Deno.execPath(), {
    args,
    stdin: 'piped',
    stdout: 'piped',
    stderr: 'piped',
  });

  const child: Deno.ChildProcess = command.spawn();

  for await (const line of child.stdout) {
    console.log(textDecoder.decode(line));
  }

  for await (const line of child.stderr) {
    console.error(textDecoder.decode(line));
  }

  child.stdin.close();

  const status: Deno.CommandStatus = await child.status;

  return status.code;
};
