import { parseArgs } from 'node:util';

export function parseCLIArgs(args) {
  const options = {
    message: { type: 'string', short: 'm' },
    build: { type: 'boolean' },
    'no-build': { type: 'boolean' },
    yes: { type: 'boolean', short: 'y' },
    sync: { type: 'string', short: 's' },
    help: { type: 'boolean', short: 'h' },
  };

  try {
    const { values, positionals } = parseArgs({
      args,
      options,
      allowPositionals: true,
      strict: true,
    });

    const type = positionals[0] || null;
    const invalidType = type && !['patch', 'minor', 'major'].includes(type);

    let build = null;
    if (values.build) build = true;
    if (values['no-build']) build = false;

    let sync = values.sync || null;
    if (sync && !['pkg', 'tag'].includes(sync)) {
      throw new Error(`Invalid sync value: ${sync}. Must be 'pkg' or 'tag'.`);
    }

    return {
      type,
      invalidType: !!invalidType,
      message: values.message || null,
      build,
      yes: !!values.yes,
      sync,
      help: !!values.help,
      error: null,
    };
  } catch (err) {
    return {
      type: null,
      invalidType: false,
      message: null,
      build: null,
      yes: false,
      sync: null,
      help: false,
      error: err.message,
    };
  }
}

export function getHelpMessage() {
  return `Usage: release-it [type] [options]

Arguments:
  type                 patch | minor | major (skips release type prompt)

Options:
  -m, --message <msg>  Custom commit message (skips message prompt)
  --build              Run build check before releasing
  --no-build           Skip build check before releasing
  -y, --yes            Skip final confirmation and use defaults for omitted prompts
  -s, --sync <pkg|tag> Base version to use for mismatch (pkg: package.json, tag: git tag)
  -h, --help           Show this help information`;
}
