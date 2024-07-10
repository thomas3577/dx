import { join, toFileUrl } from '@std/path';
import { parseArgs } from '@std/cli';
import { existsSync } from '@std/fs';

import { DxArgs } from './types.ts';

const denoJsonFileNames: string[] = [
  'deno.json',
  'deno.jsonc',
];

const acceptFileExtension: string[] = [
  '.ts',
  '.js',
  '.tsx',
  '.jsx',
];

/**
 * Gets the reserved words from the Deno CLI.
 *
 * @returns {string[]} - Returns an array of reserved words.
 */
export const getReserved = (): (string | undefined)[] => {
  const textDecoder = new TextDecoder();
  const command = new Deno.Command(Deno.execPath(), { args: ['--help'] });
  const output: Deno.CommandOutput = command.outputSync();
  const outputArr: string[] = textDecoder.decode(output.stdout).trim().replace(/\r\n/g, '\n').split('\n');
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

/**
 * Gets the code file path by the name if exists.
 *
 * @param {string} value - The name of the file.
 * @returns {string | undefined} - Returns the file path or undefined.
 */
export const getCodeFilePathByName = (value: string): string | undefined =>
  acceptFileExtension
    .map((extention) => [value, extention].join(''))
    .find((path) => existsSync(path));

/**
 * Gets a list of tasks from the deno.json file.
 *
 * @returns {string[]} - Returns an array of tasks.
 */
export const getTasks = async (): Promise<string[]> => {
  const path = denoJsonFileNames
    .map((fileName) => join(Deno.cwd(), fileName))
    .find((filePath) =>
      existsSync(filePath, {
        isReadable: true,
        isFile: true,
      })
    );

  if (!path) {
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

/**
 * Parses the arguments of the CLI.
 *
 * @param {string[]} args - The arguments of the CLI.
 * @returns {DxArgs} - Returns the parsed arguments.
 */
export const parseDxArgs = (args?: string[]): DxArgs => {
  args = [...(args ?? [])];
  args = args.map((arg) => arg.startsWith('-') ? arg : arg.toLocaleLowerCase());

  if (args.length < 1 || (args.length === 1 && args.at(0) === 'repl')) {
    throw new Error('Did you want to execute REPL. Please use the Deno command `deno`. To specify permissions, run `deno repl` with allow flags.');
  }

  if (args.length > 0 && args.at(0) === 'help') {
    args[0] = '--help';
  }

  if (args.length > 0 && args.at(0) === 'version') {
    args[0] = '--version';
  }

  const parsedArgs = parseArgs(args, {
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

  args = args?.filter((arg) => arg !== '--dry-run') ?? [];

  if (parsedArgs.help && args.at(0) !== '--help' && args.at(0) !== '-h') {
    parsedArgs.help = false;
  }

  return { ...parsedArgs, args };
};

/**
 * Checks if the value is a accepted file.
 *
 * @param {string} value - The value to check.
 * @returns {boolean} - Returns true if the value is a file.
 */
export const isAcceptedFile = (value: string): boolean => {
  return acceptFileExtension.some((ext) => value.endsWith(ext));
};
