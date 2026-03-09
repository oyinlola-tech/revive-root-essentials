#!/usr/bin/env node
/**
 * Auto-bumps the patch version for both root package.json and backend/package.json.
 * Keeps versions in sync; increments patch (x.y.z -> x.y.z+1).
 */
const fs = require('fs');
const path = require('path');

const files = [
  path.join(process.cwd(), 'package.json'),
  path.join(process.cwd(), 'backend', 'package.json'),
];

const bumpPatch = (version) => {
  const parts = version.split('.').map(Number);
  while (parts.length < 3) parts.push(0);
  parts[2] += 1;
  return parts.join('.');
};

files.forEach((file) => {
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  const oldVersion = json.version || '0.0.0';
  const newVersion = bumpPatch(oldVersion);
  json.version = newVersion;
  fs.writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`);
  console.log(`Bumped ${file}: ${oldVersion} -> ${newVersion}`);
});
