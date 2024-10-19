import type { Args } from '@std/cli';

export type DxArgs = Args & { args: string[] };

export type JsrMetaVersion = {
  yanked?: boolean;
};

/**
 * JSR Meta
 *
 * @example
 * See also: https://jsr.io/@dx/dx/meta.json
 * ```json
 * {
 *   "scope": "dx",
 *   "name": "dx",
 *   "latest": "2.0.2",
 *   "versions": {
 *     "1.1.15": {
 *       "yanked": true
 *     },
 *     "1.1.16": {},
 *     "2.0.0": {}
 *   }
 * }
 * ```
 */
export type JsrMeta = {
  scope: string;
  name: string;
  latest: string;
  versions: Record<string, JsrMetaVersion>;
};
