import fs from 'fs';
import path from 'path';
import os from 'os';

export const TARGET_REL_PATHS = [
  '.agents/skills',
  '.claude/skills',
  '.codeium/windsurf/skills',
  '.codex/skills',
  '.continue/skills',
  '.gemini/skills',
  '.gemini/config/skills',
  '.kiro/skills',
  '.qoder/skills',
];

export function installSkillToPaths(homedir, sourcePath, relativePaths) {
  if (!fs.existsSync(sourcePath)) {
    console.warn(`Warning: Source skill file not found at ${sourcePath}`);
    return 0;
  }

  const skillContent = fs.readFileSync(sourcePath, 'utf8');
  let installedCount = 0;

  for (const relPath of relativePaths) {
    const targetDir = path.join(homedir, relPath);
    if (fs.existsSync(targetDir)) {
      try {
        const destDir = path.join(targetDir, 'releasing');
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        const destPath = path.join(destDir, 'SKILL.md');
        fs.writeFileSync(destPath, skillContent, 'utf8');
        console.log(`Successfully installed release skill to: ${destPath}`);
        installedCount++;
      } catch (err) {
        console.warn(`Warning: Failed to install skill to ${targetDir}: ${err.message}`);
      }
    }
  }

  return installedCount;
}

function runInstaller() {
  if (process.env.CI) {
    console.log('CI environment detected. Skipping skill installation.');
    return;
  }

  const homedir = os.homedir();
  const sourcePath = path.join(import.meta.dirname, '..', 'skills', 'releasing', 'SKILL.md');
  const installedCount = installSkillToPaths(homedir, sourcePath, TARGET_REL_PATHS);

  if (installedCount === 0) {
    console.log('No active coding agent skills folders detected in home directory. Release skill was not copied.');
  } else {
    console.log(`Auto-installer finished. Installed release skill in ${installedCount} agent(s).`);
  }
}

// Only run automatically if executed directly
if (process.argv[1] && (process.argv[1].endsWith('install-skill.js') || process.argv[1].endsWith('install-skill'))) {
  try {
    runInstaller();
  } catch (err) {
    console.warn(`Warning: Automatic skill installation failed: ${err.message}`);
  }
}
