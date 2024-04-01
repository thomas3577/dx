import { internals } from './internals.ts';
import { printHelp, printVersion } from './info.ts';
import { runner } from './run.ts';
import { getFilePathByName, getReserved, getTasks, isFileOrUrl, parseDxArgs } from './utils.ts';

export const dx = async (args?: string[]): Promise<number | undefined> => {
  try {
    const parsedArgs = parseDxArgs(args);
    const dryRun: boolean = parsedArgs['dry-run'];

    args = parsedArgs.args;

    if (parsedArgs.version) {
      printVersion();
      return 0;
    }

    if (parsedArgs.help) {
      printHelp();
      return 0;
    }

    const tasks: string[] = await getTasks();

    const denoCommandIndex: number = args.findIndex((arg: string) => !arg.startsWith('-'));
    if (denoCommandIndex < 0) {
      throw new Error(`Deno command not found`);
    }

    const denoCommand: string = args[denoCommandIndex];
    const denoCommandArgs: string[] = args.slice(0, denoCommandIndex);

    if (isFileOrUrl(denoCommand)) {
      args.unshift('run');
      return await runner.run(args, dryRun);
    }

    if (tasks.includes(denoCommand)) {
      args.unshift('task');
      args = args.filter((arg) => !denoCommandArgs.includes(arg));
      return await runner.run(args, dryRun);
    }

    const appsArgs: string[] = args.slice(denoCommandIndex + 1);
    const filePath: string | undefined = getFilePathByName(denoCommand);
    if (filePath) {
      args = ['run', ...denoCommandArgs, filePath, ...appsArgs];
      return await runner.run(args, dryRun);
    }

    if (denoCommand === 'update') {
      args = ['install', '--allow-run', '--allow-read', '-f', '-n', 'dx', '-c', './deno.json', 'jsr:@dx/dx'];
      return await runner.run(args, dryRun);
    }

    if (denoCommand === 'init' && appsArgs.length > 0) {
      return await internals.init(appsArgs, dryRun);
    }

    if (!getReserved().includes(denoCommand)) {
      throw new Error(`Unknown deno command: ${denoCommand}`);
    }

    return await runner.run(args, dryRun);
  } catch (err: unknown) {
    if (err instanceof Error) {
      // cspell:disable
      console.error(`%cerror: %c${err.message}`, 'color: red', 'color: white');
    }

    return 1;
  }
};
