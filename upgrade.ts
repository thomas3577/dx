import { parse } from '@std/path/parse';

import { runner } from './run.ts';
import { VERSION } from './version.ts';
import type { JsrMeta } from './types.ts';

const apiUrl = 'https://jsr.io/@dx/dx/meta.json';

export const upgradeDx = async (dryRun: boolean, version?: string): Promise<number> => {
  const dxVersion = parse(VERSION);
  const denoVersion = parse(Deno.version.deno);
  const response: Response = await fetch(apiUrl);
  const meta: JsrMeta = await response.json();

  const args = ['install', '--allow-read', '--allow-run', '--allow-sys', '--allow-env', '--allow-write', '--unstable-kv', '-g', '-f', '-n', 'dx', 'jsr:@dx/dx'];

  return await runner.run(args, dryRun);
};
