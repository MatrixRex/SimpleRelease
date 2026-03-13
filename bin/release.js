#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join } from 'path';
import { execa } from 'execa';
import pc from 'picocolors';
import enquirer from 'enquirer';

async function run() {
  const cwd = process.cwd();
  const pkgPath = join(cwd, 'package.json');

  console.log(pc.cyan('--- Release It ---'));

  // 1. Check if there are uncommitted changes
  try {
    const { stdout: status } = await execa('git', ['status', '--porcelain'], { cwd });
    if (status.trim()) {
      console.log(pc.red('Error: You have uncommitted changes. Please commit or stash them first.'));
      const { stdout: fullStatus } = await execa('git', ['status'], { cwd });
      console.log(fullStatus);
      process.exit(1);
    }
  } catch (error) {
    console.error(pc.red(`Failed to check git status: ${error.message}`));
    process.exit(1);
  }

  // 2. Get current version info
  let pkg;
  try {
    pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  } catch (error) {
    console.error(pc.red(`Error reading package.json at ${pkgPath}: ${error.message}`));
    process.exit(1);
  }

  let currentVersion = pkg.version;
  let latestTag = 'None';
  
  try {
    const { stdout } = await execa('git', ['describe', '--tags', '--abbrev=0'], { cwd });
    latestTag = stdout.trim() || 'None';
  } catch (e) {
    // No tags found yet, latestTag stays 'None'
  }

  const tagVersion = latestTag.replace(/^v/, '');

  console.log(pc.gray(`Current Package Version: v${currentVersion}`));
  console.log(pc.gray(`Latest Git Tag:         ${latestTag}`));

  // 3. Handle Version Mismatch
  if (latestTag !== 'None' && currentVersion !== tagVersion) {
    console.log(pc.yellow('VERSION MISMATCH DETECTED!'));
    console.log(`Package version (v${currentVersion}) does not match Git tag (${latestTag}).`);
    
    const { syncChoice } = await enquirer.prompt({
      type: 'select',
      name: 'syncChoice',
      message: 'Which version should be used as the base for this release?',
      choices: [
        { name: 'pkg', message: `Use Package Version (v${currentVersion})` },
        { name: 'tag', message: `Use Git Tag Version (${latestTag})` },
        { name: 'quit', message: 'Quit' }
      ]
    });

    if (syncChoice === 'tag') {
      console.log(pc.cyan(`Syncing package.json to match Git tag (${latestTag})...`));
      await execa('pnpm', ['version', tagVersion, '--no-git-tag-version', '--allow-same-version'], { cwd, stdio: 'inherit' });
      currentVersion = tagVersion;
    } else if (syncChoice === 'quit') {
      console.log(pc.yellow('Cancelled.'));
      process.exit(0);
    } else {
      console.log(pc.gray('Proceeding with Package Version as base.'));
    }
  }

  // 4. Ask for release type
  const { releaseType } = await enquirer.prompt({
    type: 'select',
    name: 'releaseType',
    message: 'Select release type:',
    choices: [
      { name: 'patch', message: 'Patch (0.0.x)' },
      { name: 'minor', message: 'Minor (0.x.0)' },
      { name: 'major', message: 'Major (x.0.0)' },
      { name: 'quit', message: 'Quit' }
    ]
  });

  if (releaseType === 'quit') {
    console.log(pc.yellow('Cancelled.'));
    process.exit(0);
  }

  // 5. Ask for custom commit message
  const { customMsg } = await enquirer.prompt({
    type: 'input',
    name: 'customMsg',
    message: `Enter commit message (leave blank for auto: '${releaseType} release vX.X.X'):`
  });

  // 6. Final Confirmation
  const { confirmed } = await enquirer.prompt({
    type: 'confirm',
    name: 'confirmed',
    message: `Ready to release ${releaseType}?`,
    initial: true
  });

  if (!confirmed) {
    console.log(pc.gray('Release cancelled.'));
    process.exit(0);
  }

  console.log('\n' + pc.cyan('Bumping version...'));

  // 7. Run pnpm version
  try {
    const args = ['version', releaseType];
    // Always include v%s so the git commit message and tag stay in sync with package.json
    const msgBase = customMsg ? customMsg.trim() : `${releaseType} release`;
    args.push('-m', `${msgBase} v%s`);

    const { stdout: newVersion } = await execa('pnpm', args, { cwd });
    console.log(pc.green(`New Version: ${newVersion.trim()}`));

    // 8. Push to origin
    console.log('\n' + pc.cyan('Pushing changes and tags to origin...'));
    await execa('git', ['push'], { cwd, stdio: 'inherit' });
    await execa('git', ['push', '--tags'], { cwd, stdio: 'inherit' });

    console.log('\n' + pc.green(`✨ Release ${newVersion.trim()} successful! GitHub Actions check has started.`));
  } catch (error) {
    console.log(pc.red('Error: Release failed.'));
    console.error(error.message);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
