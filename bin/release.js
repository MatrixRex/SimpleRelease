#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join } from 'path';
import { execa } from 'execa';
import pc from 'picocolors';
import enquirer from 'enquirer';
import { parseCLIArgs, getHelpMessage } from './args.js';

async function run() {
  const cwd = process.cwd();
  const pkgPath = join(cwd, 'package.json');

  const args = parseCLIArgs(process.argv.slice(2));

  // Handle errors or help first
  if (args.help) {
    console.log(getHelpMessage());
    process.exit(0);
  }

  if (args.error) {
    console.error(pc.red(`Error: ${args.error}`));
    console.log('\n' + getHelpMessage());
    process.exit(1);
  }

  if (args.invalidType) {
    console.error(pc.red(`Error: Invalid release type '${args.type}'. Must be one of patch, minor, major.`));
    console.log('\n' + getHelpMessage());
    process.exit(1);
  }

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
    
    let syncChoice = args.sync;

    if (!syncChoice) {
      if (args.yes) {
        console.log(pc.yellow("Warning: Non-interactive run. Defaulting to use package.json version."));
        syncChoice = 'pkg';
      } else {
        const response = await enquirer.prompt({
          type: 'select',
          name: 'syncChoice',
          message: 'Which version should be used as the base for this release?',
          choices: [
            { name: 'pkg', message: `Use Package Version (v${currentVersion})` },
            { name: 'tag', message: `Use Git Tag Version (${latestTag})` },
            { name: 'quit', message: 'Quit' }
          ]
        });
        syncChoice = response.syncChoice;
      }
    }

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

  // 4. Get release type
  let releaseType = args.type;
  if (!releaseType) {
    const response = await enquirer.prompt({
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
    releaseType = response.releaseType;
  }

  if (releaseType === 'quit') {
    console.log(pc.yellow('Cancelled.'));
    process.exit(0);
  }

  // 5. Get custom commit message
  let customMsg = args.message;
  if (customMsg === null) {
    if (args.yes) {
      customMsg = ''; // use auto-generated
    } else {
      const response = await enquirer.prompt({
        type: 'input',
        name: 'customMsg',
        message: `Enter commit message (leave blank for auto: '${releaseType} release vX.X.X'):`
      });
      customMsg = response.customMsg;
    }
  }

  // 5b. Get build check
  let shouldBuild = args.build;
  if (shouldBuild === null) {
    if (args.yes) {
      shouldBuild = false; // default skip build under non-interactive mode
    } else {
      const response = await enquirer.prompt({
        type: 'confirm',
        name: 'shouldBuild',
        message: 'Run build check before releasing?',
        initial: false
      });
      shouldBuild = response.shouldBuild;
    }
  }

  // 6. Final Confirmation
  let confirmed = args.yes;
  if (!confirmed) {
    const response = await enquirer.prompt({
      type: 'confirm',
      name: 'confirmed',
      message: `Ready to release ${releaseType}?`,
      initial: true
    });
    confirmed = response.confirmed;
  }

  if (!confirmed) {
    console.log(pc.gray('Release cancelled.'));
    process.exit(0);
  }

  // 6b. Run build if requested
  if (shouldBuild) {
    console.log('\n' + pc.cyan('Running build...'));
    try {
      if (pkg.scripts && pkg.scripts.build) {
        await execa('pnpm', ['run', 'build'], { cwd, stdio: 'inherit' });
        console.log(pc.green('✔ Build successful!'));
      } else {
        console.log(pc.yellow('Warning: No build script found in package.json. Skipping build step.'));
      }
    } catch (error) {
      console.log(pc.red('\n✖ Build failed! Release aborted.'));
      process.exit(1);
    }
  }

  console.log('\n' + pc.cyan('Bumping version...'));

  // 7. Run pnpm version
  try {
    const argsToRun = ['version', releaseType];
    // Always include v%s so the git commit message and tag stay in sync with package.json
    const msgBase = customMsg ? customMsg.trim() : `${releaseType} release`;
    argsToRun.push('-m', `${msgBase} v%s`);

    const { stdout: newVersion } = await execa('pnpm', argsToRun, { cwd });
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
