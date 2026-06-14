import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { installSkillToPaths } from '../bin/install-skill.js';

test('installSkillToPaths - writes to existing directories', () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'mock-home-'));
  
  // Set up mock directories
  const mockGemini = path.join(tmpHome, '.gemini', 'config', 'skills');
  const mockClaude = path.join(tmpHome, '.claude', 'skills');
  const mockMissing = path.join(tmpHome, '.missing', 'skills');
  
  fs.mkdirSync(mockGemini, { recursive: true });
  fs.mkdirSync(mockClaude, { recursive: true });

  // Source path
  const sourcePath = path.join(import.meta.dirname, '..', 'skills', 'releasing', 'SKILL.md');

  const count = installSkillToPaths(tmpHome, sourcePath, [
    '.gemini/config/skills',
    '.claude/skills',
    '.missing/skills',
  ]);

  assert.strictEqual(count, 2);

  // Assert target files exist and have content
  const geminiSkill = path.join(mockGemini, 'releasing', 'SKILL.md');
  const claudeSkill = path.join(mockClaude, 'releasing', 'SKILL.md');
  const missingSkill = path.join(mockMissing, 'releasing', 'SKILL.md');

  assert.strictEqual(fs.existsSync(geminiSkill), true);
  assert.strictEqual(fs.existsSync(claudeSkill), true);
  assert.strictEqual(fs.existsSync(missingSkill), false);

  const content = fs.readFileSync(geminiSkill, 'utf8');
  assert.match(content, /# Releasing Skill/);

  // Clean up
  fs.rmSync(tmpHome, { recursive: true, force: true });
});
