# @matrix-rex/release-tool

> An interactive release wizard for Node.js projects — bump version, commit, tag, and push in one command.

[![npm version](https://img.shields.io/npm/v/@matrix-rex/release-tool)](https://www.npmjs.com/package/@matrix-rex/release-tool)
[![npm downloads](https://img.shields.io/npm/dm/@matrix-rex/release-tool)](https://www.npmjs.com/package/@matrix-rex/release-tool)
[![license](https://img.shields.io/npm/l/@matrix-rex/release-tool)](./LICENSE)

---

## Features

- ✅ Checks for uncommitted changes before doing anything
- ✅ Detects version mismatch between `package.json` and Git tags and lets you resolve it
- ✅ Bumps version — `patch`, `minor`, or `major`
- ✅ Accepts a custom commit message (or uses a sensible auto-generated one)
- ✅ Automatically commits, tags, and pushes to `origin`
- ✅ Works in any Node.js project with a `package.json` and Git repository

---

## Installation

### Global (recommended)

```bash
pnpm add -g @matrix-rex/release-tool
```

### Or run without installing

```bash
npx @matrix-rex/release-tool
```

---

## Usage

Navigate to any Node.js project folder and run:

```bash
release-it
```

The wizard will guide you through:

```
--- Release It ---
Current Package Version: v1.2.3
Latest Git Tag:          v1.2.3

? Select release type:
  ❯ Patch (0.0.x)
    Minor (0.x.0)
    Major (x.0.0)
    Quit

? Enter commit message (leave blank for auto: 'patch release vX.X.X'):

? Ready to release patch? (Y/n)

Bumping version...
New Version: v1.2.4

Pushing changes and tags to origin...

✨ Release v1.2.4 successful!
```

---

## How It Works

1. **Checks for uncommitted changes** — aborts if the working tree is dirty
2. **Reads the current version** from `package.json` and the latest Git tag
3. **Detects mismatches** — if they differ, asks which to use as the base
4. **Bumps the version** via `pnpm version` (updates `package.json` + creates a Git tag)
5. **Pushes** the commit and tag to `origin`

---

## Local Development

Clone and link locally to test changes immediately:

```bash
git clone https://github.com/matrix-rex/release-tool.git
cd release-tool
npm link
```

The `release-it` command will now point to your local clone. Any edits to `bin/release.js` are reflected instantly.

---

## Built With

| Package                                                | Purpose                   |
| ------------------------------------------------------ | ------------------------- |
| [enquirer](https://www.npmjs.com/package/enquirer)     | Interactive prompts       |
| [picocolors](https://www.npmjs.com/package/picocolors) | Terminal colors           |
| [execa](https://www.npmjs.com/package/execa)           | Running git/pnpm commands |

---

## License

MIT © [Matrix Rex](https://github.com/matrix-rex)
