#!/usr/bin/env node
/**
 * Fails if package versions were not bumped compared to the previous commit.
 * Checks both root package.json and backend/package.json.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const filesToCheck = [
  path.join(process.cwd(), 'package.json'),
  path.join(process.cwd(), 'backend', 'package.json'),
];

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

const getPrevFile = (file) => {
  try {
    return execSync(`git show HEAD~1:${path.relative(process.cwd(), file)}`, { encoding: 'utf8' });
  } catch {
    return null; // Probably first commit or no history
  }
};

let failed = false;
filesToCheck.forEach((file) => {
  const current = readJson(file);
  const prevRaw = getPrevFile(file);
  if (!prevRaw) {
    console.log(`Skipping ${file}: no previous version to compare (likely first commit).`);
    return;
  }
  let prev;
  try {
    prev = JSON.parse(prevRaw);
  } catch {
    console.warn(`Could not parse previous version of ${file}; skipping.`);
    return;
  }

  if (current.version === prev.version) {
    console.error(
      `Version not bumped in ${file}. Current: ${current.version}, Previous: ${prev.version}.`
    );
    failed = true;
  } else {
    console.log(`OK ${file}: ${prev.version} -> ${current.version}`);
  }
});

if (failed) {
  process.exit(1);
}
