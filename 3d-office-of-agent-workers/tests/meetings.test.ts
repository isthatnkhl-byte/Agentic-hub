import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { MeetingRoom, type MeetingWorkers } from '../src/server/meetings.js';
import { Worktrees } from '../src/server/worktrees.js';
import type { AgentChoice, MeetingRequest, QueueTask, WorkerInfo } from '../src/shared/protocol.js';
import { MEETING_PATTERN_IDS, isMeetingPattern } from '../src/shared/meetings.js';
import { PROMPTS, type PromptId } from '../src/shared/prompts.js';

function fixture(opts: { git?: boolean; rewritten?: Partial<Record<PromptId, string>>; officeDefault?: AgentChoice } = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), 'office-meeting-'));
  const dataDir = path.join(dir, '.agent-office');
  mkdirSync(dataDir, { recursive: true });
  if (opts.git) {
    const git = (...args: string[]) => execFileSync('git', args, { cwd: dir, stdio: 'ignore' });
    git('init', '-q', '-b', 'main');
    writeFileSync(path.join(dir, 'README.md'), '# demo\n');
    writeFileSync(path.join(dir, '.git', 'info', 'exclude'), '.agent-office/\n');
    git('add', '.');
    git('-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-qm', 'init');
    git('config', 'user.email', 't@t');
    git('config', 'user.name', 't');
  }
  const workers: WorkerInfo[] = [];
  const prompts: { id: string; text: string }[] = [];
  const typed: { id: string; data: string }[] = [];
  const toasts: string[] = [];
  const reviews: { pr: number; file: string }[] = [];
  const queuedTasks: QueueTask[] = [];
  let ids = 0;
  const manager: MeetingWorkers = {
    defaultProvider: 'claude',
    officeDefault: opts.officeDefault,
    list: () => workers,
    seat(deskId, by, prompt, provider, model, effort, meeting) {
      if (workers.some((w) => w.deskId === deskId)) return 'taken';
      const worker: WorkerInfo = {
        id: `w${++ids}`, deskId, kind: 'agent', provider, model, effort, prompt, name: `Worker ${workers.length + 1}`,
        color: '#fff', status: 'starting', acked: true, createdBy: by, createdAt: Date.now(), cols: 80, rows: 24, viewers: [],
        worktree: meeting.worktree, meeting: meeting.id,
      };
      workers.push(worker);
      prompts.push({ id: worker.id, text: prompt });
      return worker;
    },
    prompt(id, text) {
      prompts.push({ id, text });
      return undefined;
    },
    write(id, data) {
      typed.push({ id, data });
    },
    async kill(id) {
      const i = workers.findIndex((w) => w.id === id);
      if (i >= 0) workers.splice(i, 1);
      room.onWorkerGone(id);
      return {};
    },
    queueSwarm(task, options) {
      queuedTasks.push({ id: task.id, swarmId: options.swarmId, swarmLimit: options.maxParallel, swarmDependsOn: task.dependsOn.map((dependency) => `${options.swarmId}-${dependency}`), swarmAcceptanceCriteria: task.acceptanceCriteria, swarmContextInclude: task.context.include, swarmContextExclude: task.context.exclude, swarmContextManifest: task.contextManifest, swarmRole: task.role, swarmRouteReason: task.routeReason, provider: options.provider, model: task.model, effort: task.effort, title: task.agentName, prompt: task.work, addedBy: options.by, owner: options.owner, addedById: options.createdById, addedAt: Date.now(), status: 'queued' });
      return undefined;
    },
    queueState: () => ({ tasks: queuedTasks, maxWorkers: 3 }),
    cancelSwarm(swarmId) {
      for (const task of queuedTasks.slice()) if (task.swarmId === swarmId && task.status === 'queued') queuedTasks.splice(queuedTasks.indexOf(task), 1);
    },
  };
  const openRoom = () => new MeetingRoom(dir, dataDir, manager, opts.git ? new Worktrees(dir) : undefined, {
    update() {},
    toast: (text) => toasts.push(text),
    hiringPaused: () => undefined,
    postReview: async (pr, file) => {
      reviews.push({ pr, file });
      return `https://github.com/o/r/pull/${pr}#pullrequestreview-1`;
    },
    prompt: (id) => opts.rewritten?.[id] ?? PROMPTS[id].text,
  });
  let room = openRoom();
  const cwd = () => {
    const wt = room.state().current?.worktree;
    return wt ? path.join(dir, wt.path) : dir;
  };
  /** The worker at seat `i` takes its part: it starts, writes its file (unless `skip`), and ends its turn. */
  const take = (i: number, text = 'Some notes.', skip = false) => {
    const m = room.state().current!;
    const t = m.turns.find((x) => x.seat === i);
    assert.ok(t, `seat ${i} has a part in round ${m.round}`);
    const w = workers.find((x) => x.id === m.seats[i].workerId)!;
    w.status = 'working';
    room.onWorker(w);
    if (!skip) {
      const file = path.join(cwd(), t.file);
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, text);
    }
    w.status = 'done';
    room.onWorker(w);
  };
  /** Workers who had no part yet say they're ready and end the turn. */
  const settle = () => {
    for (const w of workers) {
      if (w.status !== 'starting') continue;
      w.status = 'done';
      room.onWorker(w);
    }
  };
  const start = (req: Partial<MeetingRequest>) => room.start({ pattern: 'debate', prompt: 'Which cache should we use?', roles: [], ...req } as MeetingRequest, 'Ada');
  return { dir, get room() { return room; }, workers, prompts, typed, toasts, reviews, queuedTasks, take, settle, start, cwd, kill: (id: string) => manager.kill(id), restart() { room.shutdown(); room = openRoom(); return room; }, restore() { room = openRoom(); return room; }, close() { room.shutdown(); rmSync(dir, { recursive: true, force: true }); } };
}

test('a debate runs its rounds and ends when the chair writes the decision', (t) => {
  const f = fixture(); t.after(() => f.close());
  assert.equal(f.start({ rounds: 3, output: 'docs/decision.md' }), undefined);
  let m = f.room.state().current!;
  assert.equal(m.seats.length, 3);
  assert.deepEqual(m.seats.map((s) => s.role), ['Chair', 'Pragmatist', 'Skeptic']);
  assert.equal(f.workers.length, 3);
  assert.match(f.prompts[0].text, /Round 1 of 3, proposing/);
  assert.match(f.prompts[0].text, /Which cache should we use\?/);
  for (const i of [0, 1, 2]) f.take(i);
  m = f.room.state().current!;
  assert.equal(m.round, 2);
  assert.equal(m.turns.length, 3);
  assert.ok(m.turns.every((x) => x.state === 'sent'));
  assert.match(f.prompts.at(-1)!.text, /Round 2 of 3, critiquing/);
  for (const i of [0, 1, 2]) f.take(i);
  m = f.room.state().current!;
  assert.equal(m.round, 3);
  assert.deepEqual(m.turns.map((x) => [x.seat, x.file]), [[0, 'docs/decision.md']]);
  assert.match(f.prompts.at(-1)!.text, /writing the decision/);
  f.take(0, '# We use Redis');
  m = f.room.state().current!;
  assert.equal(m.status, 'done');
  assert.equal(readFileSync(path.join(f.dir, 'docs/decision.md'), 'utf8'), '# We use Redis');
  assert.equal(m.preview, '# We use Redis');
  // The notes are kept by the floor's other state.
  assert.ok(existsSync(path.join(f.dir, '.agent-office', 'meetings', m.id)));
});

test('the meeting stops once it runs over its token budget, and says so', (t) => {
  const f = fixture(); t.after(() => f.close());
  assert.equal(f.start({ budget: 100_000 }), undefined);
  const w = f.workers[0];
  w.status = 'working';
  w.usage = { input: 90_000, output: 20_000, cacheRead: 0, cacheWrite: 0, cost: 0.5, calls: 3 };
  f.room.onWorker(w);
  const m = f.room.state().current!;
  assert.equal(m.status, 'stopped');
  assert.match(m.reason!, /over budget: 110k of 100k tokens/);
  // Whoever was busy is told to stop.
  assert.deepEqual(f.typed, [{ id: w.id, data: '\x1b' }]);
});

test('a worker that ends its part without writing the file is reminded once, then the meeting stops', (t) => {
  const f = fixture(); t.after(() => f.close());
  assert.equal(f.start({ rounds: 2, output: 'decision.md' }), undefined);
  for (const i of [0, 1, 2]) f.take(i);
  f.take(0, '', true);
  assert.match(f.prompts.at(-1)!.text, /without writing \S*\/decision\.md,/);
  assert.equal(f.room.state().current!.status, 'running');
  f.take(0, '', true);
  const m = f.room.state().current!;
  assert.equal(m.status, 'stopped');
  assert.match(m.reason!, /round limit without writing decision\.md/);
});

test('sending a worker home stops the meeting and names who left', async (t) => {
  const f = fixture(); t.after(() => f.close());
  assert.equal(f.start({}), undefined);
  await f.kill(f.room.state().current!.seats[2].workerId!);
  const m = f.room.state().current!;
  assert.equal(m.status, 'stopped');
  assert.match(m.reason!, /the Skeptic \(Worker 3\) was sent home/);
});

test('red / blue ends early when red finds nothing more', (t) => {
  const f = fixture(); t.after(() => f.close());
  assert.equal(f.start({ pattern: 'redblue', prompt: 'The login change', rounds: 3 }), undefined);
  f.settle();
  let m = f.room.state().current!;
  assert.deepEqual(m.seats.map((s) => s.role), ['Blue team', 'Red team']);
  f.take(1, '- src/login.ts:12 — token compared with ==');
  m = f.room.state().current!;
  assert.equal(m.step, 2);
  assert.match(f.prompts.at(-1)!.text, /Round 1 of 3, fixing\./);
  f.take(0, 'Fixed it with a constant-time compare.');
  m = f.room.state().current!;
  assert.equal(m.round, 2);
  f.take(1, 'NO FINDINGS');
  m = f.room.state().current!;
  assert.equal(m.lastRound, 2);
  assert.equal(m.turns[0].file, m.output);
  f.take(0, '# Red / blue\n\nOne finding, fixed.');
  assert.equal(f.room.state().current!.status, 'done');
});

test('a review panel posts the combined review on the pull request', async (t) => {
  const f = fixture(); t.after(() => f.close());
  assert.match(f.start({ pattern: 'review', prompt: 'Review it' }) ?? '', /needs a pull request/);
  assert.equal(f.start({ pattern: 'review', prompt: 'Review it', pr: 42 }), undefined);
  let m = f.room.state().current!;
  assert.equal(m.output, 'reviews/pr-42.md');
  assert.equal(m.title, 'Review of PR #42');
  assert.match(f.prompts[1].text, /through your lens, Security/);
  for (const i of [0, 1, 2]) f.take(i, '- a.ts:1 — something');
  assert.match(f.prompts.at(-1)!.text, /\*\*\[Security\]\*\*/);
  f.take(0, 'Looks fine. **[Security]** a.ts:1 — something');
  await new Promise((r) => setImmediate(r));
  m = f.room.state().current!;
  assert.equal(m.status, 'done');
  assert.deepEqual(f.reviews, [{ pr: 42, file: path.join(f.dir, 'reviews/pr-42.md') }]);
  assert.equal(m.review?.url, 'https://github.com/o/r/pull/42#pullrequestreview-1');
});

test('map-reduce hands each mapper its own parts', (t) => {
  const f = fixture(); t.after(() => f.close());
  assert.match(f.start({ pattern: 'mapreduce', parts: ['src/a.ts'] }) ?? '', /at least 2 parts/);
  assert.equal(f.start({ pattern: 'mapreduce', parts: ['src/a.ts', 'src/b.ts', 'src/c.ts'] }), undefined);
  const mapper1 = f.prompts.find((p) => p.id === f.workers[1].id)!.text;
  const mapper2 = f.prompts.find((p) => p.id === f.workers[2].id)!.text;
  assert.match(mapper1, /- src\/a\.ts\n- src\/c\.ts/);
  assert.match(mapper2, /- src\/b\.ts\n/);
  assert.match(f.prompts[0].text, /Round 1 has no part for you/);
});

test('bad requests are turned away before anyone sits down', (t) => {
  const f = fixture(); t.after(() => f.close());
  assert.match(f.start({ prompt: '  ' }) ?? '', /what the meeting is about/);
  assert.match(f.start({ output: '../x.md' }) ?? '', /\.\./);
  assert.match(f.start({ output: '/etc/x' }) ?? '', /relative/);
  assert.match(f.start({ output: '.agent-office/x.md' }) ?? '', /\.agent-office/);
  assert.match(f.start({ roles: ['a', 'b', 'c', 'd', 'e', 'f'] }) ?? '', /2 to 5 workers/);
  assert.match(f.start({ pattern: 'redblue', roles: ['a', 'b', 'c'] }) ?? '', /seats 2 workers/);
  assert.equal(f.workers.length, 0);
  assert.equal(f.start({}), undefined);
  assert.match(f.start({}) ?? '', /busy/);
});

test('swarm creates a validated plan first, then queues routed tasks under the requested cap', (t) => {
  const f = fixture({ git: true }); t.after(() => f.close());
  assert.equal(f.start({ pattern: 'swarm', prompt: 'Build an account settings page', swarmLimit: 2 }), undefined);
  const meeting = f.room.state().current!;
  assert.equal(meeting.output, 'plan.json');
  assert.ok(meeting.worktree);
  assert.equal(f.workers.length, 1);
  assert.match(f.prompts[0].text, /"schemaVersion": 1/);
  assert.match(f.prompts[0].text, /"agent-name": "frontend worker"/);
  assert.match(f.prompts[0].text, /first model call/);

  writeFileSync(path.join(f.cwd(), 'plan.json'), JSON.stringify({ tasks: [
    { 'agent-name': 'frontend worker', work: "You're a professional frontend designer and auditor for demo. You're handed the following tasks: build the account settings page." },
    { 'agent-name': 'test worker', work: 'Add focused tests for the account settings workflow.' },
  ] }));
  const planner = f.workers[0];
  planner.status = 'working'; f.room.onWorker(planner);
  planner.status = 'done'; f.room.onWorker(planner);

  assert.equal(f.workers.length, 0, 'the planner leaves the table after routing the plan');
  assert.equal(f.queuedTasks.length, 2, `meeting: ${JSON.stringify(f.room.state().current)}`);
  assert.deepEqual(f.queuedTasks.map((task) => [task.title, task.status, task.swarmId, task.swarmLimit]), [
    ['frontend worker', 'queued', meeting.id, 2],
    ['test worker', 'queued', meeting.id, 2],
  ]);
  assert.match(f.queuedTasks[0].prompt, /professional frontend designer and auditor/);
  assert.equal(f.queuedTasks[0].swarmRole, 'frontend');
  assert.ok(f.queuedTasks[0].swarmContextManifest?.baseCommit);
  assert.ok(f.queuedTasks[0].swarmContextManifest?.files.some((file) => file.path === 'README.md'));
  assert.equal(f.room.state().current!.status, 'running');
  assert.equal(existsSync(path.join(f.dir, 'plan.json')), false);
  assert.ok(existsSync(path.join(f.dir, '.agent-office', 'meetings', meeting.id, 'plan.json')));

  f.queuedTasks[0].status = 'done'; f.queuedTasks[0].outcome = 'done'; f.room.pump();
  assert.equal(f.room.state().current!.status, 'running');
  f.queuedTasks[1].status = 'done'; f.queuedTasks[1].outcome = 'done'; f.room.pump();
  assert.equal(f.room.state().current!.status, 'done');
  assert.equal(f.room.state().current!.swarmTasks?.length, 2);
});

test('swarm applies explicit per-task provider routes and dependency IDs', (t) => {
  const f = fixture({ git: true }); t.after(() => f.close());
  assert.equal(f.start({ pattern: 'swarm', prompt: 'Add a new settings workflow' }), undefined);
  const runId = f.room.state().current!.id;
  writeFileSync(path.join(f.cwd(), 'plan.json'), JSON.stringify({ schemaVersion: 1, tasks: [
    { id: 'api', 'agent-name': 'backend worker', work: 'Implement the settings API.', dependsOn: [], acceptanceCriteria: ['API has tests.'], route: { role: 'backend', provider: 'opencode', model: 'openai/gpt-5' } },
    { id: 'ui', 'agent-name': 'frontend worker', work: 'Build the settings form.', dependsOn: ['api'], acceptanceCriteria: ['Form works on mobile.'], route: { role: 'frontend', provider: 'codex' } },
  ] }));
  const planner = f.workers[0];
  planner.status = 'working'; f.room.onWorker(planner);
  planner.status = 'done'; f.room.onWorker(planner);
  assert.deepEqual(f.queuedTasks.map((task) => [task.provider, task.model, task.swarmRole, task.swarmDependsOn]), [
    ['opencode', 'openai/gpt-5', 'backend', []],
    ['codex', undefined, 'frontend', [`${runId}-api`]],
  ]);
  assert.match(f.queuedTasks[0].swarmRouteReason ?? '', /plan route for backend/);
});

test('swarm refuses malformed plans without queueing any tasks', (t) => {
  const f = fixture({ git: true }); t.after(() => f.close());
  assert.equal(f.start({ pattern: 'swarm', prompt: 'Improve the project' }), undefined);
  writeFileSync(path.join(f.cwd(), 'plan.json'), '{"tasks":[{"agent-name":"frontend worker","work":"build it"}]}');
  const planner = f.workers[0];
  planner.status = 'working'; f.room.onWorker(planner);
  planner.status = 'done'; f.room.onWorker(planner);
  assert.equal(f.room.state().current!.status, 'stopped');
  assert.match(f.room.state().current!.reason ?? '', /2 to 12 tasks/);
  assert.equal(f.queuedTasks.length, 0);
});

test('stopping a running swarm cancels its queued tasks and updates the meeting state', (t) => {
  const f = fixture({ git: true }); t.after(() => f.close());
  assert.equal(f.start({ pattern: 'swarm', prompt: 'Improve the project' }), undefined);
  writeFileSync(path.join(f.cwd(), 'plan.json'), JSON.stringify({ tasks: [
    { 'agent-name': 'frontend worker', work: 'Improve the main page.' },
    { 'agent-name': 'test worker', work: 'Add a regression test.' },
  ] }));
  const planner = f.workers[0];
  planner.status = 'working'; f.room.onWorker(planner);
  planner.status = 'done'; f.room.onWorker(planner);
  assert.equal(f.queuedTasks.length, 2);

  assert.equal(f.room.stop('Ada'), undefined);
  assert.equal(f.room.state().current!.status, 'stopped');
  assert.equal(f.queuedTasks.length, 0);
  assert.ok(f.room.state().current!.swarmTasks?.every((task) => task.outcome === 'killed'));
  const summary = JSON.parse(readFileSync(path.join(f.dir, '.agent-office', 'meetings', f.room.state().current!.id, 'summary.json'), 'utf8'));
  assert.equal(summary.status, 'stopped');
  assert.ok(summary.tasks.every((task: { status: string }) => task.status === 'cancelled'));
});

test('partial swarms persist an auditable summary without claiming acceptance criteria passed', (t) => {
  const f = fixture({ git: true }); t.after(() => f.close());
  assert.equal(f.start({ pattern: 'swarm', prompt: 'Improve the settings workflow' }), undefined);
  writeFileSync(path.join(f.cwd(), 'plan.json'), JSON.stringify({ schemaVersion: 1, tasks: [
    { id: 'api', 'agent-name': 'backend worker', work: 'Implement the settings API.', acceptanceCriteria: ['API tests pass.'], route: { role: 'backend', provider: 'auto' } },
    { id: 'ui', 'agent-name': 'frontend worker', work: 'Build the settings form.', acceptanceCriteria: ['Form works on mobile.'], route: { role: 'frontend', provider: 'auto' } },
  ] }));
  const planner = f.workers[0];
  planner.status = 'working'; f.room.onWorker(planner);
  planner.status = 'done'; f.room.onWorker(planner);
  const meeting = f.room.state().current!;
  f.queuedTasks[0].status = 'done';
  f.queuedTasks[0].outcome = 'done';
  f.queuedTasks[0].branch = 'office/swarm-api';
  f.queuedTasks[0].pr = { number: 42, url: 'https://github.com/example/project/pull/42', state: 'OPEN', title: 'Implement settings API' };
  f.queuedTasks[1].status = 'done';
  f.queuedTasks[1].outcome = 'blocked';
  f.queuedTasks[1].error = 'Blocked by unsuccessful dependency api';
  f.room.pump();

  assert.equal(f.room.state().current!.status, 'partial');
  const reportPath = path.join(f.dir, '.agent-office', 'meetings', meeting.id, 'summary.json');
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  assert.equal(report.status, 'partial');
  assert.equal(report.tasks[0].branch, 'office/swarm-api');
  assert.equal(report.tasks[0].pr.number, 42);
  assert.deepEqual(report.tasks[0].acceptanceCriteria, [{ criterion: 'API tests pass.', status: 'not-verified' }]);
  assert.equal(report.tasks[1].status, 'blocked');
});

test('a restored swarm idempotently re-enqueues a task missing during partial dispatch', (t) => {
  const f = fixture({ git: true }); t.after(() => f.close());
  assert.equal(f.start({ pattern: 'swarm', prompt: 'Improve the project' }), undefined);
  writeFileSync(path.join(f.cwd(), 'plan.json'), JSON.stringify({ tasks: [
    { id: 'api', 'agent-name': 'backend worker', work: 'Build the API.' },
    { id: 'tests', 'agent-name': 'test worker', work: 'Test the API.' },
  ] }));
  const planner = f.workers[0];
  planner.status = 'working'; f.room.onWorker(planner);
  planner.status = 'done'; f.room.onWorker(planner);
  assert.equal(f.queuedTasks.length, 2);

  f.queuedTasks.splice(1, 1);
  f.room.shutdown();
  const statePath = path.join(f.dir, '.agent-office', 'meetings.json');
  const saved = JSON.parse(readFileSync(statePath, 'utf8'));
  saved.current.swarmTasks[1].enqueued = false;
  writeFileSync(statePath, JSON.stringify(saved));
  f.restore();
  assert.equal(f.room.state().current!.swarmTasks?.[1].enqueued, false, 'restored run should still show the second task as pending enqueue');
  f.room.pump();

  assert.equal(f.queuedTasks.length, 2);
  assert.deepEqual(f.queuedTasks.map((task) => task.id), [`${f.room.state().current!.id}-api`, `${f.room.state().current!.id}-tests`]);
  assert.ok(f.room.state().current!.swarmTasks?.every((task) => task.enqueued));
});

test('a completed swarm report refreshes when its pull request appears later', (t) => {
  const f = fixture({ git: true }); t.after(() => f.close());
  assert.equal(f.start({ pattern: 'swarm', prompt: 'Implement a settings API' }), undefined);
  writeFileSync(path.join(f.cwd(), 'plan.json'), JSON.stringify({ tasks: [
    { id: 'api', 'agent-name': 'backend worker', work: 'Implement the API.' },
    { id: 'tests', 'agent-name': 'test worker', work: 'Test the API.' },
  ] }));
  const planner = f.workers[0];
  planner.status = 'working'; f.room.onWorker(planner);
  planner.status = 'done'; f.room.onWorker(planner);
  for (const task of f.queuedTasks) { task.status = 'done'; task.outcome = 'done'; }
  f.room.pump();
  const runId = f.room.state().current!.id;
  const reportPath = path.join(f.dir, '.agent-office', 'meetings', runId, 'summary.json');
  assert.equal(JSON.parse(readFileSync(reportPath, 'utf8')).tasks[0].pr, undefined);

  f.queuedTasks[0].branch = 'office/settings-api';
  f.queuedTasks[0].pr = { number: 57, url: 'https://github.com/example/project/pull/57', state: 'OPEN', title: 'Settings API' };
  f.room.pump();
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  assert.equal(report.tasks[0].branch, 'office/settings-api');
  assert.equal(report.tasks[0].pr.number, 57);
});

test('in a git project the output is committed on the meeting branch, which outlives the room being cleared', async (t) => {
  const f = fixture({ git: true }); t.after(() => f.close());
  assert.equal(f.start({ rounds: 2, output: 'docs/decision.md', title: 'Pick a cache' }), undefined);
  const m0 = f.room.state().current!;
  assert.match(m0.worktree!.branch, /^office\/meeting-pick-a-cache-/);
  assert.ok(f.workers.every((w) => w.worktree?.path === m0.worktree!.path));
  // Every file a part names is a full path inside the meeting's worktree, never the project folder around it.
  assert.ok(f.prompts[0].text.includes(`Write it to ${path.join(f.cwd(), '.meeting', 'r1-1-chair.md')},`));
  for (const i of [0, 1, 2]) f.take(i);
  f.take(0, '# Redis\n');
  for (let i = 0; i < 50 && !f.room.state().current!.commit; i++) await new Promise((r) => setTimeout(r, 20));
  const m = f.room.state().current!;
  assert.equal(m.status, 'done');
  assert.ok(m.commit);
  const git = (...args: string[]) => execFileSync('git', args, { cwd: f.dir, encoding: 'utf8' }).trim();
  assert.equal(git('show', `${m.worktree!.branch}:docs/decision.md`), '# Redis');
  // Notes stay out of the commit.
  assert.equal(git('show', '--name-only', '--format=', m.worktree!.branch), 'docs/decision.md');
  assert.equal(f.room.clear('Ada'), undefined);
  for (let i = 0; i < 50 && existsSync(path.join(f.dir, m.worktree!.path)); i++) await new Promise((r) => setTimeout(r, 20));
  assert.equal(f.workers.length, 0);
  assert.ok(!existsSync(path.join(f.dir, m.worktree!.path)));
  assert.equal(git('rev-parse', '--abbrev-ref', m.worktree!.branch), m.worktree!.branch);
  assert.equal(f.room.state().current, null);
  assert.match(f.room.state().past[0].summary, /Debate · 2 rounds · 0 tokens · \$0\.00 · ✅ docs\/decision\.md on office\/meeting-pick-a-cache-/);
});

test('only the real meeting patterns pass, not what every object inherits', () => {
  for (const id of MEETING_PATTERN_IDS) assert.equal(isMeetingPattern(id), true);
  for (const v of ['constructor', '__proto__', 'toString', 'hasOwnProperty', 'valueOf', '', 'nope', 1, null, undefined]) assert.equal(isMeetingPattern(v), false, String(v));
});

test('a meeting says what the office’s rewritten prompts say, and seats the default worker when nobody picked one', (t) => {
  const f = fixture({
    rewritten: {
      'meeting.brief': 'You are the {{role}}. Topic: {{about}}{{nothing}}',
      'meeting.debate.propose': 'Pitch it as the {{role}}, into {{file}}.',
      'meeting.nudge': 'Still waiting on {{file}}!',
    },
    officeDefault: { provider: 'claude', model: 'sonnet', effort: 'medium' },
  });
  t.after(() => f.close());
  assert.equal(f.start({ rounds: 3, provider: undefined }), undefined);
  assert.equal(f.prompts[0].text, `You are the Chair. Topic: Which cache should we use?{{nothing}}\n\nRound 1 of 3, proposing. Pitch it as the Chair, into ${path.join(f.cwd(), '.agent-office', 'meetings', f.room.state().current!.id, 'r1-1-chair.md')}.`);
  assert.deepEqual(f.workers.map((w) => [w.provider, w.model, w.effort]), Array(3).fill(['claude', 'sonnet', 'medium']));
  // A worker that ends its turn without its part is nudged in the office's words.
  const w = f.workers[0];
  w.status = 'working';
  f.room.onWorker(w);
  w.status = 'done';
  f.room.onWorker(w);
  assert.match(f.prompts.at(-1)!.text, /^Still waiting on \S+r1-1-chair\.md!$/);
  // Picked, the meeting's own choice wins.
  const g = fixture({ officeDefault: { provider: 'claude', model: 'sonnet' } });
  t.after(() => g.close());
  assert.equal(g.start({ provider: 'claude', model: 'haiku' }), undefined);
  assert.deepEqual(g.workers.map((x) => x.model), ['haiku', 'haiku', 'haiku']);
});
