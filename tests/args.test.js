import test from 'node:test';
import assert from 'node:assert';
import { parseCLIArgs } from '../bin/args.js';

test('parseCLIArgs - no arguments', () => {
  const result = parseCLIArgs([]);
  assert.deepStrictEqual(result, {
    type: null,
    invalidType: false,
    message: null,
    build: null,
    yes: false,
    sync: null,
    help: false,
    error: null,
  });
});

test('parseCLIArgs - release type positional', () => {
  const result = parseCLIArgs(['patch']);
  assert.strictEqual(result.type, 'patch');
  assert.strictEqual(result.invalidType, false);
});

test('parseCLIArgs - invalid release type positional', () => {
  const result = parseCLIArgs(['invalid']);
  assert.strictEqual(result.type, 'invalid');
  assert.strictEqual(result.invalidType, true);
});

test('parseCLIArgs - options parsing', () => {
  const result = parseCLIArgs(['minor', '-m', 'custom release msg', '--build', '-y', '-s', 'tag']);
  assert.strictEqual(result.type, 'minor');
  assert.strictEqual(result.message, 'custom release msg');
  assert.strictEqual(result.build, true);
  assert.strictEqual(result.yes, true);
  assert.strictEqual(result.sync, 'tag');
  assert.strictEqual(result.error, null);
});

test('parseCLIArgs - build options override', () => {
  const result = parseCLIArgs(['--build', '--no-build']);
  assert.strictEqual(result.build, false);
});

test('parseCLIArgs - invalid option error', () => {
  const result = parseCLIArgs(['--invalid-flag']);
  assert.notStrictEqual(result.error, null);
});
