import { Args } from '@std/cli';

import { internals } from './internals.ts';
import { printHelp, printVersion } from './info.ts';
import { runner } from './run.ts';
import { getFilePathByName, getReserved, getTasks, hasExtension, parseDxArgs } from './utils.ts';

export const dx = async (args?: string[]): Promise<number | undefined> => {
  args = [...(args ?? [])];

  if (args.length < 1) {
    printHelp();
    return 0;
  }

  const parsedArgs: Args = parseDxArgs(args);
  const dryRun: boolean = parsedArgs['dry-run'];

  if (parsedArgs.version) {
    printVersion();
    return 0;
  }

  if (parsedArgs.help) {
    printHelp();
    return 0;
  }

  args = args.filter((arg) => arg !== '--dry-run');

  const tasks: string[] = await getTasks();

  const denoCommandIndex: number = args.findIndex((arg: string) => !arg.startsWith('-'));
  if (denoCommandIndex < 0) {
    throw new Error(`Deno command not found`);
  }

  const denoCommand: string = args[denoCommandIndex];
  const denoCommandArgs: string[] = args.slice(0, denoCommandIndex);
  const appsArgs: string[] = args.slice(denoCommandIndex + 1);
  const filePath: string | undefined = getFilePathByName(denoCommand);

  if (hasExtension(denoCommand)) {
    args.unshift('run');
    return await runner.run(args, dryRun);
  } else if (tasks.includes(denoCommand)) {
    args.unshift('task');
    args = args.filter((arg) => !denoCommandArgs.includes(arg));
    return await runner.run(args, dryRun);
  } else if (filePath) {
    args = ['run', ...denoCommandArgs, filePath, ...appsArgs];
    return await runner.run(args, dryRun);
  } else if (denoCommand === 'update') {
    args = ['install', '--allow-run', '--allow-read', '-f', '-n', 'dx', '-c', './deno.json', 'jsr:@dx/dx'];
    return await runner.run(args, dryRun);
  } else if (denoCommand === 'init' && appsArgs.length > 0) {
    return await internals.init(appsArgs, dryRun);
  } else if (!getReserved().includes(denoCommand)) {
    throw new Error(`Unknown deno command: ${denoCommand}`);
  }

  return await runner.run(args, dryRun);
};
