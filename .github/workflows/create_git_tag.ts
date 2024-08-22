import { VERSION } from '../../version.ts';

const textDecoder = new TextDecoder();

function git(args: string[]): string {
  const cmd = new Deno.Command('git', { args });
  const output = cmd.outputSync();
  const stderr = textDecoder.decode(output.stderr);
  const stdout = textDecoder.decode(output.stdout);

  if (stderr) {
    throw new Error(stderr);
  }

  return stdout;
}

const latestTag = git(['describe', '--tags']);
if (latestTag.trim() !== VERSION) {
  git(['tag', '-a', VERSION, '-m', `Release ${VERSION}`]);
  git(['push', 'origin', VERSION]);
}
