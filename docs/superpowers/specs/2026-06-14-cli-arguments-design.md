# Design Specification: CLI Arguments for release-it

This document describes the design for adding non-interactive execution capability and command-line arguments to `@matrix-rex/release-tool`.

## User Review Required

No critical breaking changes are introduced. The existing interactive wizard remains the default behavior if no arguments are provided.

## Proposed Changes

### CLI Arguments & Options Schema

We will use Node's native `util.parseArgs` to support the following:

- **Positional Argument**: `[type]`
  - Must be one of: `patch`, `minor`, `major`.
  - Sets the release type. If provided, the release type prompt is skipped.
- **Options**:
  - `-m, --message <string>`: Custom commit message.
  - `--build`: Run the build script before releasing.
  - `--no-build`: Skip the build check.
  - `-y, --yes`: Skip the confirmation prompt. When set, any missing options default to non-interactive safe defaults instead of prompting.
  - `-s, --sync <pkg|tag>`: Auto-resolve version mismatch base version.
  - `-h, --help`: Display help info.

### Behavior & Fallback Table

| Phase | Scenario | With CLI Arg | Without CLI Arg (Interactive) | Without CLI Arg (`--yes`/`-y`) |
|---|---|---|---|---|
| **Release Type** | Value specified / not specified | Uses specified type | Prompts for type | Error if invalid; prompts if empty (or exits if non-tty/agent expects fully automated run) |
| **Version Mismatch** | Mismatch exists | Syncs base version using `--sync` | Prompts for resolution | Defaults to `pkg` (prints warning) |
| **Commit Message** | Custom message specified / not | Uses custom message | Prompts for custom message | Auto-generates message (e.g. `patch release vX.X.X`) |
| **Build Check** | `--build` or `--no-build` specified | Runs or skips build | Prompts for confirmation | Skips build check (default `false`) |
| **Final Confirmation** | `--yes` or `-y` specified | Runs release directly | Prompts for confirmation | Runs release directly |

### Help Information

If `--help` or `-h` is supplied, the tool will print usage information and exit immediately with exit code `0`.
If an invalid positional argument is supplied (other than `patch`, `minor`, `major`), the tool will print an error message, show the usage help, and exit with `1`.

## Verification Plan

### Manual Verification
1. Run `release-it --help` to verify correct output and clean exit.
2. Run `release-it invalid-type` to verify error message and exit code 1.
3. Run a release command locally on a dummy repo:
   - `release-it patch -y --no-build` to verify zero-prompt execution.
   - `release-it minor -m "custom release message" -y --build` to verify options are mapped correctly.
