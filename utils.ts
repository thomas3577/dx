import { join, toFileUrl } from '@std/path';
import { Args, parseArgs } from '@std/cli';
import { exists, existsSync } from '@std/fs';

const extensions: string[] = [
  '.ts',
  '.js',
  '.tsx',
  '.jsx',
];

export const getReserved = (): (string | undefined)[] => {
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

export const getFilePathByName = (value: string): string | undefined =>
  extensions
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
    with: {
      type: 'json',
    },
  });

  const tasks: string[] = Object.keys(module.default?.tasks ?? {});

  return tasks;
};

export const parseDxArgs = (args: string[]): Args =>
  parseArgs(args, {
    alias: {
      'help': 'h',
      'version': 'v',
    },
    boolean: [
      'help',
      'version',
      'dry-run',
    ],
    stopEarly: false,
  });

export const hasExtension = (value: string): boolean => extensions.some((ext) => value.endsWith(ext));
