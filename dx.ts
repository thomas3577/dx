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

const getReserved = (): (string | undefined)[] => {
  const textDecoder = new TextDecoder();
  const command = new Deno.Command(Deno.execPath(), { args: ['--help'] });
  const output: Deno.CommandOutput = command.outputSync();
  const outputArr: string[] = textDecoder.decode(output.stdout).trim().split('\n');
  let go = false;

  return outputArr
    .filter((part) => {
      if (part === 'Options:') {
        go = false;
        return false;
      } else if (go) {
        return true;
      } else if (part === 'Commands:') {
        go = true;
        return false;
      }
    })
    .map((part) => part.trim().split(' ').at(0)?.trim())
    .filter((part) => part !== undefined && part.length > 0);
};

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
  console.log('  update        Updates dx');
  console.log('  test          Runs tests');
  console.log('  fmt           Runs fmt');
  console.log('  <TOOLS>       Runs tools (https://deno.land/manual/tools)');
  console.log('\nOptions:');
  console.log('  -h, --help    Display this help and exit');
  console.log('  -v, --version Display version of dx and exit');
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

  const process: Deno.ChildProcess = command.spawn();

  process.stdout.pipeTo(
    new WritableStream({
      write(chunk): void {
        for (const line of textDecoder.decode(chunk).split(/\r?\n/)) {
          console.log(`${line}`);
        }
      },
    }),
  );

  process.stderr.pipeTo(
    new WritableStream({
      write(chunk): void {
        for (const line of textDecoder.decode(chunk).split(/\r?\n/)) {
          console.error(`${line}`);
        }
      },
    }),
  );

  const status: Deno.CommandStatus = await process.status;

  process.stdin.close();

  return status.code;
};

const hasExtension = (value: string): boolean => extensions.some((ext) => value.endsWith(ext));

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

  const denoCommandIndex: number = args.findIndex((arg: string) => !arg.startsWith('-'));
  if (denoCommandIndex < 0) {
    throw new Error(`Unknown command`);
  }

  const denoCommand: string = args[denoCommandIndex];
  const denoCommandArgs: string[] = args.slice(0, denoCommandIndex);
  const appsArgs: string[] = args.slice(denoCommandIndex + 1);
  const tasks: string[] = await getTasks();
  const filePath: string | undefined = getFilePathByName(denoCommand);

  if (hasExtension(denoCommand)) {
    args.unshift('run');
  } else if (tasks.includes(denoCommand)) {
    args.unshift('task');
    args = args.filter((arg) => !denoCommandArgs.includes(arg));
  } else if (filePath) {
    args = ['run', ...denoCommandArgs, filePath, ...appsArgs];
  } else if (denoCommand === 'update') {
    args = ['install', '--allow-run', '--allow-read', '-f', '-n', 'dx', '-c', './deno.json', './mod.ts'];
  } else if (!getReserved().includes(denoCommand)) {
    throw new Error(`Unknown command: ${denoCommand}`);
  }

  const code: number = await run(args);

  return code;
};
