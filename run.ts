const textDecoder = new TextDecoder();

export const run = async (args: string[], dryrun: boolean = false): Promise<number> => {
  console.log('dx > deno', args.join(' '));

  if (dryrun) {
    return 0;
  }

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
