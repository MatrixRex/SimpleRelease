# Design Specification: Automatic Skill Installer

This document describes the design for bundling a coding agent skill (`releasing/SKILL.md`) in `@matrix-rex/release-tool` and automatically installing it in all detected coding agents' skills directories on the user's machine during install/update.

## User Review Required

The postinstall script is designed to run automatically. It is non-blocking, meaning any failures (such as permission errors or missing directories) will be caught gracefully and will not interrupt the package installation process.

## Proposed Changes

### 1. Bundled Agent Skill (`skills/releasing/SKILL.md`)
We will bundle a skill that tells AI coding agents how to use `@matrix-rex/release-tool` non-interactively using the newly added CLI arguments.

### 2. Auto-installer script (`bin/install-skill.js`)
We will create a self-contained Node script that:
1. Resolves the current user's home directory (`os.homedir()`).
2. Checks a list of potential agent skills target directories:
   - `.agents/skills`
   - `.claude/skills`
   - `.codeium/windsurf/skills`
   - `.codex/skills`
   - `.continue/skills`
   - `.gemini/skills`
   - `.gemini/config/skills`
   - `.kiro/skills`
   - `.qoder/skills`
3. For each directory that exists on the system:
   - Creates a `releasing/` directory if missing.
   - Copies/writes `SKILL.md` to `<skills-dir>/releasing/SKILL.md`.
4. Wraps all file operations in a `try/catch` block. It will print status logs to the console but will never exit with a non-zero code.

### 3. Package Integration
- Add `"postinstall": "node bin/install-skill.js"` to `"scripts"` in `package.json`.
- Include `"skills/"` in the `"files"` array in `package.json`.

## Verification Plan

### Automated Tests
Add a unit test in `tests/installer.test.js` that verifies:
- The installer correctly maps directories relative to a mock home directory.
- Files are written correctly in a mock home directory.

### Manual Verification
1. Run `node bin/install-skill.js` locally.
2. Confirm the skill was copied or updated in your local configuration folders (e.g. `C:\Users\matra\.gemini\config\skills\releasing\SKILL.md`).
