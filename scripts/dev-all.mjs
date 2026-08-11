/**
 * Runs the API and the Vite dev server together, so `pnpm dev:all` is the one
 * command needed to work on the full stack. Killing either kills both.
 */
import { spawn } from 'node:child_process';

const procs = [
  { name: 'api', color: '\x1b[36m', cmd: 'pnpm', args: ['dev:api'] },
  { name: 'web', color: '\x1b[35m', cmd: 'pnpm', args: ['dev'] },
];

const running = procs.map(({ name, color, cmd, args }) => {
  const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  const prefix = `${color}[${name}]\x1b[0m `;

  for (const stream of [child.stdout, child.stderr]) {
    stream.setEncoding('utf8');
    stream.on('data', (chunk) => {
      for (const line of chunk.split('\n')) {
        if (line.trim()) console.log(prefix + line);
      }
    });
  }

  child.on('exit', (code) => {
    console.log(`${prefix}exited (${code})`);
    shutdown();
  });

  return child;
});

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of running) child.kill('SIGTERM');
  setTimeout(() => process.exit(0), 200);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
