import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildSwarmContext } from '../src/server/swarm-context.js';
import type { SwarmTaskPlan } from '../src/shared/protocol.js';

function project(t: { after(fn: () => void): void }) {
  const root = mkdtempSync(path.join(tmpdir(), 'office-swarm-context-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(path.join(root, 'src/payments'), { recursive: true });
  mkdirSync(path.join(root, 'dist'), { recursive: true });
  writeFileSync(path.join(root, 'CLAUDE.md'), 'Project conventions');
  writeFileSync(path.join(root, 'README.md'), 'Project introduction');
  writeFileSync(path.join(root, 'src/payments/retry.ts'), 'export function retryPaymentWithBackoff() {}');
  writeFileSync(path.join(root, 'src/payments/secrets.ts'), 'const apiToken = "do-not-surface";');
  writeFileSync(path.join(root, 'dist/payment.js'), 'generated payment retry bundle');
  writeFileSync(path.join(root, '.env'), 'PRIVATE_KEY=not-context');
  const git = (...args: string[]) => execFileSync('git', args, { cwd: root, stdio: 'ignore' });
  git('init', '-q', '-b', 'main');
  git('config', 'user.email', 'test@example.invalid');
  git('config', 'user.name', 'Test');
  git('add', '.');
  git('commit', '-qm', 'fixture');
  return root;
}

const task: SwarmTaskPlan = {
  id: 'payment-tests',
  agentName: 'test worker',
  work: 'Add tests for payment retry behavior with exponential backoff.',
  dependsOn: [],
  acceptanceCriteria: ['The retry backoff is covered by tests.'],
  context: { include: ['src/payments/'], exclude: ['src/payments/secrets.ts'] },
  route: { role: 'testing', provider: 'auto' },
};

test('context manifest ranks relevant tracked files and project instructions without loading sensitive files', (t) => {
  const root = project(t);
  const manifest = buildSwarmContext(root, task);
  const paths = manifest.files.map((file) => file.path);
  assert.match(manifest.baseCommit ?? '', /^[a-f0-9]{40}$/);
  assert.ok(paths.includes('CLAUDE.md'));
  assert.ok(paths.includes('src/payments/retry.ts'));
  assert.ok(!paths.includes('src/payments/secrets.ts'));
  assert.ok(!paths.includes('.env'));
  assert.ok(!paths.includes('dist/payment.js'));
  assert.ok(manifest.files.every((file) => file.reason.length > 0));
  assert.ok(manifest.files.length <= 12);
});

test('context manifest keeps a small file-path list and honors explicit path exclusions', (t) => {
  const root = project(t);
  const manifest = buildSwarmContext(root, { ...task, context: { include: [], exclude: ['src/payments/'] } });
  assert.ok(!manifest.files.some((file) => file.path.startsWith('src/payments/')));
});