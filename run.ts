const textDecoder = new TextDecoder();

const runCommand = async (command: Deno.Command): Promise<number> => {
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

const run = async (args: string[], dryrun: boolean = false): Promise<number> => {
  console.log(`dx > deno ${args.join(' ')}`);

  if (dryrun) {
    return 0;
  }

  const command = new Deno.Command(Deno.execPath(), {
    args,
    stdin: 'piped',
    stdout: 'piped',
    stderr: 'piped',
  });

  return await runCommand(command);
};

export const runner = { run, runCommand };
