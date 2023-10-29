import { dx } from './dx.ts';

const code = await dx(Deno.args);

Deno.exit(code);
