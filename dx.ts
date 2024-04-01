import { Args } from '@std/cli';

import { init } from './dx-init.ts';
import { printHelp, printVersion } from './dx-info.ts';
import { run } from './dx-run.ts';
import { getFilePathByName, getReserved, getTasks, hasExtension, parseDxArgs } from './dx-utils.ts';

export const dx = async (args?: string[]): Promise<number | undefined> => {
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

  args = args.filter((arg) => arg !== '--dryrun');

  const denoCommandIndex: number = args.findIndex((arg: string) => !arg.startsWith('-'));
  if (denoCommandIndex < 0) {
    throw new Error(`Deno command not found`);
  }

  const denoCommand: string = args[denoCommandIndex];
  const denoCommandArgs: string[] = args.slice(0, denoCommandIndex);
  const appsArgs: string[] = args.slice(denoCommandIndex + 1);
  const tasks: string[] = await getTasks();
  const filePath: string | undefined = getFilePathByName(denoCommand);

  if (hasExtension(denoCommand)) {
    args.unshift('run');
    return await run(args, parsedArgs.dryrun);
  } else if (tasks.includes(denoCommand)) {
    args.unshift('task');
    args = args.filter((arg) => !denoCommandArgs.includes(arg));
    return await run(args, parsedArgs.dryrun);
  } else if (filePath) {
    args = ['run', ...denoCommandArgs, filePath, ...appsArgs];
    return await run(args, parsedArgs.dryrun);
  } else if (denoCommand === 'update') {
    args = ['install', '--allow-run', '--allow-read', '-f', '-n', 'dx', '-c', './deno.json', 'jsr:@dx/dx'];
    return await run(args, parsedArgs.dryrun);
  } else if (denoCommand === 'init' && appsArgs.length > 0) {
    return await init(appsArgs, parsedArgs.dryrun);
  } else if (!getReserved().includes(denoCommand)) {
    throw new Error(`Unknown deno command: ${denoCommand}`);
  }

  return await run(args, parsedArgs.dryrun);
};
