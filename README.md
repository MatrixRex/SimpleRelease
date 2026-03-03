# @matrix-rex/release-tool

A simplified release wizard designed for Node.js projects using `pnpm`.

## Features
-   ✅ Checks for uncommitted changes
-   ✅ Handles version mismatch between `package.json` and Git tags
-   ✅ Bumps version (patch, minor, major)
-   ✅ Pushes changes and tags to origin automatically

## Local Development & Testing

To test this tool locally in any project, you can use `pnpm link`.

1.  **In the `release-tool` directory (where this file is):**
    ```bash
    pnpm link --global
    ```

2.  **In the target project where you want to use the tool:**
    ```bash
    pnpm link --global @matrix-rex/release-tool
    ```

3.  **Run the release wizard:**
    ```bash
    release-wizard
    ```

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
