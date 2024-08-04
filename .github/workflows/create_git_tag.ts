import { VERSION } from '../../version.ts';

async function git(command: string): Promise<Deno.CommandOutput> {
  const cmd = new Deno.Command('git', {
    args: [command],
  });

  return await cmd.output();
}

await git(`tag -a ${VERSION} -m "Release ${VERSION}"`);
await git(`push origin ${VERSION}`);
