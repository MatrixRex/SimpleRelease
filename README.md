# @matrix-rex/release-tool

A simplified release wizard designed for Node.js projects using `pnpm`.

## Features
-   ✅ Checks for uncommitted changes
-   ✅ Handles version mismatch between `package.json` and Git tags
-   ✅ Bumps version (patch, minor, major)
-   ✅ Pushes changes and tags to origin automatically

## Local Development & Testing

To register the tool globally on your machine, run once from this directory:

```bash
npm link
```

That's it — no second command needed in target projects. The `release-wizard` command
will be available globally, and any edits to `bin/release.js` are reflected immediately.

## Usage

In any project with a `package.json` and Git repository, simply run:

```bash
npx @matrix-rex/release-tool
```

or if installed globally:

```bash
release-wizard
```

## Refactoring Note
This tool has been refactored to use [enquirer](https://www.npmjs.com/package/enquirer) for prompts, [picocolors](https://www.npmjs.com/package/picocolors) for styling and [execa](https://www.npmjs.com/package/execa) for process execution. It uses `process.cwd()` to ensure it targets the project from which it is executed.
