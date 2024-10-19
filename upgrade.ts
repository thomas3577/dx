import { greaterThan, parse, type SemVer } from '@std/semver';

import { runner } from './run.ts';
import { VERSION } from './version.ts';
import type { JsrMeta } from './types.ts';

const libName = '@dx/dx';
const apiUrl = `https://jsr.io/${libName}/meta.json`;

export const upgradeDx = async (dryRun: boolean = true): Promise<number> => {
  const dxVersion: SemVer = parse(VERSION);
  const response: Response = await fetch(apiUrl);
  const meta: JsrMeta = await response.json();
  const latestDxVersion: SemVer = parse(meta.latest);

  if (!greaterThan(latestDxVersion, dxVersion)) {
    console.log(`%cYou are using the latest version: ${VERSION}`, 'color: green; font-weight: bold');
    return 0;
  }

  console.log(`%cNew version available: ${meta.latest}`, 'color: green; font-weight: bold');

  const args = ['i', '--allow-run', '-RSE', '--unstable-kv', '-g', '-f', '-n', 'dx', `jsr:${libName}@${latestDxVersion}`];

  return await runner.run(args, dryRun);
};
