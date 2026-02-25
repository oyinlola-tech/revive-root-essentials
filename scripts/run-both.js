import { spawn } from 'node:child_process';
import path from 'node:path';

const mode = process.argv[2] || 'dev';
const processes = [];

const run = (command, args, name) => {
  const isWindows = process.platform === 'win32';
  const child = isWindows
    ? spawn('cmd', ['/c', command, ...args], { stdio: 'inherit' })
    : spawn(command, args, { stdio: 'inherit' });
  processes.push(child);
  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`${name} exited with code ${code}`);
      shutdown(code || 1);
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

if (mode === 'start') {
  run('node', ['backend/server.js'], 'backend');
  run(viteBin, ['--host'], 'frontend');
} else {
  run(nodemonBin, ['backend/server.js'], 'backend');
  run(viteBin, [], 'frontend');
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
