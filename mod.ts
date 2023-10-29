import { Args } from 'std/flags/mod.ts';
import { extensions, getFilePathByName, getTasks, parseArgs, printHelp, printVersion, reserved, run } from './utils.ts';

export const dx = async (args: string[]): Promise<number> => {
  const parsedArgs: Args = parseArgs(args);

  if (parsedArgs.version) {
    printVersion();
    Deno.exit(0);
  }

  if (parsedArgs.help) {
    printHelp();
    Deno.exit(0);
  }

  const arg0: string | null = Deno.args.at(0)?.toString() ?? null;
  if (!arg0) {
    printHelp();
    Deno.exit(0);
  }

  const tasks: string[] = await getTasks();
  const filePath: string | undefined = getFilePathByName(arg0);

  if (extensions.some((ext) => arg0.endsWith(ext))) {
    args.unshift('run');
  } else if (tasks.includes(arg0)) {
    args.unshift('task');
  } else if (filePath) {
    args[0] = filePath;
    args.unshift('run');
  } else if (!reserved.includes(arg0)) {
    throw new Error(`Unknown command: ${arg0}`);
  }

  const code: number = await run(args);

  return code;
};

const code = await dx(Deno.args);

Deno.exit(code);
