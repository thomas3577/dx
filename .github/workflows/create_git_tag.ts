import { VERSION } from '../../version.ts';

const textDecoder = new TextDecoder();

function git(args: string[]): string {
  const cmd = new Deno.Command('git', { args });
  const { stdout } = cmd.outputSync();

  return textDecoder.decode(stdout);
}

const latestTag = git(['describe', '--tags']);
if (!latestTag.trim().startsWith(VERSION)) {
  git(['tag', '-a', VERSION, '-m', `Release ${VERSION}`]);
  git(['push', 'origin', VERSION]);
}
