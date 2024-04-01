import deno from './deno.json' with { type: 'json' };

export const VERSION = deno.version;

export const printVersion = (): void => {
  console.log(`Deno version ${Deno.version.deno}`);
  console.log(`ts version   ${Deno.version.typescript}`);
  console.log(`V8 version   ${Deno.version.v8}`);
  console.log(`%cdx version   ${VERSION}`, 'color: green; font-weight: bold');
};

export const printHelp = (): void => {
  printVersion();
  console.log('\n');
  console.log(`Usage: dx [COMMAND] [OPTIONS]`);
  console.log('\nCommands:');
  console.log('  update        Updates dx');
  console.log('  init <NAME>   Extended init by name');
  console.log('  test          Runs tests');
  console.log('  fmt           Runs fmt');
  console.log('  <TOOLS>       Runs tools (https://deno.land/manual/tools)');
  console.log('\nOptions:');
  console.log('  -h, --help    Display this help and exit');
  console.log('  -v, --version Display version of dx and exit');
  console.log('      --dryrun  Run in dry-run mode');
  console.log('\n');
};
