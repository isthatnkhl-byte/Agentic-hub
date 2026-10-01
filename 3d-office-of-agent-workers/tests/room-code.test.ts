import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Accounts } from '../src/server/accounts.js';

function withAccounts<T>(run: (accounts: Accounts) => Promise<T>): Promise<T> {
  const root = mkdtempSync(path.join(os.tmpdir(), 'agent-office-room-code-'));
  const dataDir = path.join(root, '.agent-office');
  mkdirSync(dataDir);
  const accounts = new Accounts(dataDir);
  return run(accounts).finally(() => rmSync(root, { recursive: true, force: true }));
}

test('room code cannot sign into an existing account without its password', () => withAccounts(async (accounts) => {
  const invite = accounts.invite('admin', 'member', 'Nikhil');
  assert.equal(typeof invite, 'object');
  if (typeof invite === 'string') return;
  const created = await accounts.join(invite.token, '', 'correct-password');
  assert.equal(typeof created, 'object');
  if (typeof created === 'string') return;

  const missing = await accounts.joinWithRoomCode('Nikhil');
  const wrong = await accounts.joinWithRoomCode('Nikhil', 'incorrect-password');
  const correct = await accounts.joinWithRoomCode('Nikhil', 'correct-password');
  assert.match(String(missing), /already exists.*password/i);
  assert.match(String(wrong), /matching password/i);
  assert.equal(typeof correct, 'object');
  if (typeof correct !== 'string' && 'id' in correct) assert.equal(correct.id, created.id);
}));

test('passwordless room-code joins create guests, not inaccessible accounts', () => withAccounts(async (accounts) => {
  const result = await accounts.joinWithRoomCode('Guest Nikhil');
  assert.deepEqual(result, { guestName: 'Guest Nikhil' });
  assert.equal(accounts.any, false);
}));

test('concurrent room-code account creation keeps one name and authenticates the matching join', () => withAccounts(async (accounts) => {
  const [first, second] = await Promise.all([
    accounts.joinWithRoomCode('Riley', 'correct-password'),
    accounts.joinWithRoomCode('Riley', 'correct-password'),
  ]);
  assert.equal(typeof first, 'object');
  assert.equal(typeof second, 'object');
  if (typeof first !== 'string' && typeof second !== 'string' && 'id' in first && 'id' in second) assert.equal(first.id, second.id);
  assert.equal(accounts.state(new Set()).accounts.length, 1);
}));