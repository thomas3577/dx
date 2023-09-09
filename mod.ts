import { getFilePathByName, getTasks, parseArguments, printHelp, reserved, run } from './utils.ts';

const args = Deno.args.map((args) => args);
const parsedArgs = parseArguments(Deno.args);

if (parsedArgs.help) {
  printHelp();
  Deno.exit(0);
}

const arg0: string | null = Deno.args.at(0)?.toString() ?? null;
if (!arg0) {
  Deno.exit(0);
}

const tasks: string[] = await getTasks();
const filePath: string | undefined = getFilePathByName(arg0);

if (arg0.endsWith('.ts') || arg0.endsWith('.js') || arg0.endsWith('.tsx') || arg0.endsWith('.jsx')) {
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

Deno.exit(code);
