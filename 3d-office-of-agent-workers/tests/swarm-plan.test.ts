import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSwarmPlan } from '../src/server/swarm-plan.js';
import type { AgentProvider } from '../src/shared/protocol.js';

const providers: AgentProvider[] = ['claude', 'opencode', 'codex'];
const task = (id: string, extras: Record<string, unknown> = {}) => ({
  id,
  'agent-name': `${id} worker`,
  work: `Implement ${id} safely.`,
  ...extras,
});
const plan = (tasks: unknown[], extras: Record<string, unknown> = {}) => JSON.stringify({ schemaVersion: 1, tasks, ...extras });

test('accepts the current unversioned plan and normalizes stable task ids, roles and defaults', () => {
  const result = parseSwarmPlan(JSON.stringify({ tasks: [
    { 'agent-name': 'frontend worker', work: 'Build the screen.' },
    { 'agent-name': 'test worker', work: 'Test the screen.' },
  ] }), providers);
  assert.equal(typeof result, 'object');
  if (typeof result === 'string') return;
  assert.equal(result.schemaVersion, 1);
  assert.equal(result.tasks[0].id, 'frontend-worker-1');
  assert.equal(result.tasks[0].route.role, 'frontend');
  assert.equal(result.tasks[0].route.provider, 'auto');
  assert.deepEqual(result.tasks[0].context, { include: [], exclude: [] });
});

test('accepts explicit provider routes, dependencies, criteria and bounded context paths', () => {
  const result = parseSwarmPlan(plan([
    task('api', { 'agent-name': 'backend worker', acceptanceCriteria: ['Endpoint returns 200'], context: { include: ['src/server/'], exclude: ['dist/'] }, route: { role: 'backend', provider: 'opencode', model: 'openai/gpt-5' } }),
    task('tests', { dependsOn: ['api'], route: { role: 'testing', provider: 'codex' } }),
  ]), providers);
  assert.equal(typeof result, 'object');
  if (typeof result === 'string') return;
  assert.deepEqual(result.tasks[1].dependsOn, ['api']);
  assert.deepEqual(result.tasks[0].acceptanceCriteria, ['Endpoint returns 200']);
  assert.equal(result.tasks[0].route.provider, 'opencode');
  assert.deepEqual(result.tasks[0].context.include, ['src/server/']);
});

test('infers role from agent-name and orders prerequisites before dependents', () => {
  const result = parseSwarmPlan(plan([
    { id: 'integration', 'agent-name': 'test worker', work: 'Test the backend.', dependsOn: ['backend'] },
    { id: 'backend', 'agent-name': 'backend worker', work: 'Implement the API.' },
  ]), providers);
  assert.equal(typeof result, 'object');
  if (typeof result === 'string') return;
  assert.deepEqual(result.tasks.map((task) => task.id), ['backend', 'integration']);
  assert.equal(result.tasks[0].route.role, 'backend');
  assert.equal(result.tasks[1].route.role, 'testing');
});

test('rejects unknown schema versions, invalid task counts, duplicate ids and missing dependencies', () => {
  assert.match(parseSwarmPlan(plan([task('a'), task('b')], { schemaVersion: 2 }), providers) as string, /schemaVersion/);
  assert.match(parseSwarmPlan(plan([task('a')]), providers) as string, /2 to 12 tasks/);
  assert.match(parseSwarmPlan(plan([task('same'), task('same')]), providers) as string, /duplicate task id/);
  assert.match(parseSwarmPlan(plan([task('a', { dependsOn: ['missing'] }), task('b')]), providers) as string, /missing task/);
});

test('rejects dependency cycles and unsafe context paths', () => {
  assert.match(parseSwarmPlan(plan([task('a', { dependsOn: ['b'] }), task('b', { dependsOn: ['a'] })]), providers) as string, /dependency cycle/);
  assert.match(parseSwarmPlan(plan([task('a', { context: { include: ['../secrets'], exclude: [] } }), task('b')]), providers) as string, /safe project-relative paths/);
  assert.match(parseSwarmPlan(plan([task('a', { context: { include: ['/etc/passwd'], exclude: [] } }), task('b')]), providers) as string, /safe project-relative paths/);
});

test('rejects unavailable routes, incompatible model selection and oversized plans', () => {
  assert.match(parseSwarmPlan(plan([task('a', { route: { role: 'frontend', provider: 'grok' } }), task('b')]), providers) as string, /not available/);
  assert.match(parseSwarmPlan(plan([task('a', { route: { role: 'frontend', provider: 'claude', model: 'openai/gpt-5' } }), task('b')]), providers) as string, /Invalid Claude model/);
  assert.match(parseSwarmPlan(' '.repeat(256_001), providers) as string, /no larger than/);
});