import { equals, format, parse } from '@std/semver';
import type { SemVer } from '@std/semver';

import { runner } from './run.ts';
import { VERSION } from './version.ts';
import type { JsrMeta } from './types.ts';

const libName = '@dx/dx';

/**
 * Get the latest version of the @dx/dx library
 *
 * @returns {SemVer} - The latest version of the library
 */
export const getLatestVersion = async (): Promise<SemVer> => {
  const apiUrl = `https://jsr.io/${libName}/meta.json`;
  const response: Response = await fetch(apiUrl);
  const meta: JsrMeta = await response.json();
  const latestDxVersion: SemVer = parse(meta.latest);

  return latestDxVersion;
};

/**
 * Upgrade the @dx/dx library to the latest version
 *
 * @param {boolean} dryRun - Whether to perform a dry run or not
 *
 * @returns {number} - The exit code of the command
 */
export const upgradeDx = async (dryRun: boolean = true): Promise<number> => {
  const currentDxVersion: SemVer = parse(VERSION);
  const latestDxVersion: SemVer = await getLatestVersion();

  if (!equals(latestDxVersion, currentDxVersion)) {
    console.log(`%cYou are using the latest version: ${format(latestDxVersion)}`, 'color: green; font-weight: bold');
    return 0;
  }

  console.log(`%cNew version available: ${format(latestDxVersion)}`, 'color: green; font-weight: bold');

  const args = ['i', '--allow-run', '-RWESN', '--unstable-kv', '-g', '-f', '-n', 'dx', `jsr:${libName}@${format(latestDxVersion)}`];

  return await runner.run(args, dryRun);
};
