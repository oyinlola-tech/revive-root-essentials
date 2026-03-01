import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const mode = process.argv[2] || 'dev';
const processes = [];
let hasFailure = false;

const run = (command, args, name) => {
  const isWindows = process.platform === 'win32';
  const child = isWindows
    ? spawn('cmd', ['/c', command, ...args], { stdio: 'inherit' })
    : spawn(command, args, { stdio: 'inherit' });
  processes.push(child);
  child.on('exit', (code, signal) => {
    const exitCode = typeof code === 'number' ? code : 0;
    if (exitCode !== 0) {
      hasFailure = true;
      console.error(`${name} exited with code ${exitCode}${signal ? ` (signal: ${signal})` : ''}`);
    } else {
      console.log(`${name} exited cleanly`);
    }

    const allExited = processes.every((proc) => proc.exitCode !== null || proc.killed);
    if (allExited) {
      process.exit(hasFailure ? 1 : 0);
    }
  });
};

const shutdown = (code = 0) => {
  for (const proc of processes) {
    if (!proc.killed) {
      proc.kill();
    }
  }
  process.exit(code);
};

const binExt = process.platform === 'win32' ? '.cmd' : '';
const viteBin = path.join(process.cwd(), 'node_modules', '.bin', `vite${binExt}`);
const nodemonBin = path.join(process.cwd(), 'node_modules', '.bin', `nodemon${binExt}`);
const hasNodemon = fs.existsSync(nodemonBin);

if (mode === 'start') {
  console.log('Starting backend and frontend...');
  run('node', ['backend/server.js'], 'backend');
  run(viteBin, ['--host'], 'frontend');
} else {
  console.log('Starting backend and frontend...');
  if (hasNodemon) {
    run(nodemonBin, ['backend/server.js'], 'backend');
  } else {
    run('node', ['backend/server.js'], 'backend');
  }
  run(viteBin, [], 'frontend');
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
