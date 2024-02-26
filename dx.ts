import { join, toFileUrl } from '@std/path';
import { Args, parseArgs } from '@std/cli';
import { exists, existsSync } from '@std/fs';

import { VERSION } from './version.ts';

const textDecoder = new TextDecoder();

const extensions: string[] = [
  '.ts',
  '.js',
  '.tsx',
  '.jsx',
];

const reserved: string[] = [
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

const getFilePathByName = (value: string): string | undefined =>
  extensions
    .map((extention) => [value, extention].join(''))
    .find((path) => existsSync(path));

const getTasks = async (): Promise<string[]> => {
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
    with: {
      type: 'json',
    },
  });

  const tasks: string[] = Object.keys(module.default?.tasks ?? {});

  return tasks;
};

const parseDxArgs = (args: string[]): Args =>
  parseArgs(args, {
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

const printVersion = (): void => {
  console.log(`Deno version ${Deno.version.deno}`);
  console.log(`ts version   ${Deno.version.typescript}`);
  console.log(`V8 version   ${Deno.version.v8}`);
  console.log(`%cdx version   ${VERSION}`, 'color: green; font-weight: bold');
};

const printHelp = (): void => {
  printVersion();
  console.log('\n');
  console.log(`Usage: dx [COMMAND] [OPTIONS]`);
  console.log('\nCommands:');
  console.log('  update       Updates dx');
  console.log('  test         Runs tests');
  console.log('  fmt          Runs fmt');
  console.log('  <TOOLS>      Runs tools (https://deno.land/manual/tools)');
  console.log('\nOptions:');
  console.log('  -h, --help   Display this help and exit');
  console.log('\n');
};

const run = async (args: string[]): Promise<number> => {
  console.log('dx > deno', args.join(' '));

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

export const dx = async (args?: string[]): Promise<number> => {
  args = [...(args ?? [])];

  if (args.length < 1) {
    printHelp();
    return 0;
  }

  const parsedArgs: Args = parseDxArgs(args);

  if (parsedArgs.version) {
    printVersion();
    return 0;
  }

  if (parsedArgs.help) {
    printHelp();
    return 0;
  }

  const key: string | undefined = args.find((arg) => !arg.startsWith('-'));

  if (!key) {
    throw new Error(`Unknown command`);
  }

  const tasks: string[] = await getTasks();
  const filePath: string | undefined = getFilePathByName(key);

  if (extensions.some((ext) => key?.endsWith(ext))) {
    args.unshift('run');
  } else if (tasks.includes(key)) {
    args.unshift('task');
  } else if (filePath) {
    args = [filePath];
    args.unshift('run');
  } else if (key === 'update') {
    args = ['install', '--allow-run', '--allow-read', '-f', '-n', 'dx', '-c', './deno.json', './mod.ts'];
  } else if (!reserved.includes(key)) {
    throw new Error(`Unknown command: ${key}`);
  }

  const code: number = await run(args);

  return code;
};
