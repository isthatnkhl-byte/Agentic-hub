import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { loadConfig } from '../src/server/config.js';
import { Accounts } from '../src/server/accounts.js';
import { Auth } from '../src/server/auth.js';

/** loadConfig with a throwaway --home, turning process.exit into a throw so a bad flag can be tested. */
function load(t: { after(fn: () => void): void }, ...argv: string[]) {
  const home = mkdtempSync(path.join(tmpdir(), 'agent-office-config-'));
  t.after(() => rmSync(home, { recursive: true, force: true }));
  const exit = process.exit;
  const error = console.error;
  const previousArgs = process.env.AGENT_OFFICE_AGENT_ARGS;
  const errors: string[] = [];
  process.exit = ((code?: number) => {
    throw new Error(`exit ${code}: ${errors.join('\n')}`);
  }) as typeof process.exit;
  console.error = (...args: unknown[]) => void errors.push(args.join(' '));
  delete process.env.AGENT_OFFICE_AGENT_ARGS;
  try {
    return loadConfig(['--home', home, '--password', 'x', ...argv]);
  } finally {
    process.exit = exit;
    console.error = error;
    if (previousArgs !== undefined) process.env.AGENT_OFFICE_AGENT_ARGS = previousArgs;
  }
}

test('--agent-args takes flags as its value, as the help shows', (t) => {
  assert.deepEqual(load(t, '--agent-args', '--model opus').agentArgs, ['--model', 'opus']);
  // ...and the flag after it is parsed as a flag again.
  assert.equal(load(t, '--agent-args', '--model opus', '--port', '4999').port, 4999);
});

test('--agent-args with nothing after it still needs a value', (t) => {
  assert.throws(() => load(t, '--agent-args'), /exit 2: agent-office: --agent-args needs a value/);
});

test('other flags still treat a leading -- as a missing value', (t) => {
  assert.throws(() => load(t, '--agent', '--agent-args', 'x'), /exit 2: agent-office: --agent needs a value/);
});

test('the office listens on loopback unless --host says otherwise', (t) => {
  assert.equal(load(t).host, '127.0.0.1');
  assert.equal(load(t, '--host', '0.0.0.0').host, '0.0.0.0');
});

test('--no-open leaves the browser alone', (t) => {
  assert.equal(load(t).open, true);
  assert.equal(load(t, '--no-open').open, false);
});

test('a custom office password persists across restarts and invalidates old shared sessions', async (t) => {
  const home = mkdtempSync(path.join(tmpdir(), 'agent-office-password-'));
  t.after(() => rmSync(home, { recursive: true, force: true }));
  const first = loadConfig(['--home', home]);
  const auth = new Auth(first.verifier, first.salt, first.secret, new Accounts(first.dataDir));
  const oldSession = auth.issue();
  const generatedPassword = first.password;

  first.setOfficePassword('custom-office-password');
  const savedConfig = readFileSync(path.join(first.dataDir, 'config.json'), 'utf8');
  auth.setPassword(first.verifier, first.salt);
  assert.equal(first.officePasswordCustom, true);
  assert.ok(generatedPassword);
  assert.equal(savedConfig.includes(generatedPassword!), false);
  assert.equal(savedConfig.includes('custom-office-password'), false);
  assert.equal(await auth.checkPassword('custom-office-password'), true);
  assert.equal(auth.verify(oldSession), undefined);

  const restarted = loadConfig(['--home', home, '--password', 'dev-default']);
  const restartedAuth = new Auth(restarted.verifier, restarted.salt, restarted.secret, new Accounts(restarted.dataDir));
  assert.equal(restarted.officePasswordCustom, true);
  assert.equal(await restartedAuth.checkPassword('custom-office-password'), true);
  assert.equal(await restartedAuth.checkPassword('dev-default'), false);
});
