import { execFileSync } from 'node:child_process';
import type { SwarmContextManifest, SwarmTaskPlan } from '../shared/protocol.js';

const MAX_CONTEXT_FILES = 12;
const MAX_GREP_TERMS = 12;
const GREP_TIMEOUT_MS = 1200;
const STOP_WORDS = new Set(['about', 'after', 'also', 'before', 'build', 'change', 'create', 'from', 'into', 'make', 'more', 'must', 'need', 'project', 'should', 'that', 'their', 'then', 'this', 'with', 'work', 'worker', 'your']);
const INSTRUCTIONS = new Set(['AGENTS.MD', 'CLAUDE.MD', 'README.MD', 'COPILOT-INSTRUCTIONS.MD']);
const GENERATED = /(?:^|\/)(?:\.git|\.agent-office|node_modules|dist|build|coverage|vendor|target|\.next)(?:\/|$)/i;
const SENSITIVE = /(?:^|\/)(?:\.env(?:\.|$)|secrets?|credentials?|private[-_]?keys?|tokens?)(?:\/|$)|\.(?:pem|p12|pfx|key)$/i;
const TRACKED_FILES = new Map<string, string[]>();

interface Candidate {
  path: string;
  score: number;
  reason: string;
}

/** Build a compact, provenance-bearing path manifest; agents read file contents from their own worktrees. */
export function buildSwarmContext(root: string, task: SwarmTaskPlan): SwarmContextManifest {
  return buildSwarmContexts(root, [task]).get(task.id) ?? { files: [] };
}

export function buildSwarmContexts(root: string, tasks: SwarmTaskPlan[]): Map<string, SwarmContextManifest> {
  const baseCommit = git(root, ['rev-parse', 'HEAD']) || undefined;
  const indexTree = git(root, ['write-tree']) ?? baseCommit ?? 'unknown';
  const cacheKey = `${root}\0${baseCommit ?? ''}\0${indexTree}`;
  let tracked = TRACKED_FILES.get(cacheKey);
  if (!tracked) {
    tracked = (git(root, ['ls-files', '-z']) ?? '').split('\0').filter(Boolean);
    TRACKED_FILES.set(cacheKey, tracked);
    if (TRACKED_FILES.size > 32) TRACKED_FILES.delete(TRACKED_FILES.keys().next().value!);
  }
  const safeFiles = tracked.filter((file) => isSafeTrackedFile(file, []));
  const termsByTask = new Map(tasks.map((task) => [task.id, taskTerms(task)]));
  const allTerms = [...new Set([...termsByTask.values()].flat())].slice(0, tasks.length * MAX_GREP_TERMS);
  const matchesByTask = new Map(tasks.map((task) => [task.id, new Map<string, number>()]));

  if (allTerms.length && safeFiles.length) {
    const args = ['grep', '-I', '-n', '-i', '-F', ...allTerms.flatMap((term) => ['-e', term]), '--', ...safeFiles.slice(0, 5000)];
    try {
      const matches = execFileSync('git', args, { cwd: root, encoding: 'utf8', timeout: GREP_TIMEOUT_MS, maxBuffer: 2 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
      for (const line of matches.split('\n')) {
        const first = line.indexOf(':');
        const second = first < 0 ? -1 : line.indexOf(':', first + 1);
        if (first <= 0 || second < 0) continue;
        const file = line.slice(0, first);
        const content = line.slice(second + 1).toLowerCase();
        for (const task of tasks) {
          if (!isSafeTrackedFile(file, task.context.exclude)) continue;
          const matched = (termsByTask.get(task.id) ?? []).filter((term) => content.includes(term)).length;
          if (matched) {
            const scores = matchesByTask.get(task.id)!;
            scores.set(file, Math.min(50, (scores.get(file) ?? 0) + matched));
          }
        }
      }
    } catch {
      // A path-only manifest is still useful when grep times out or finds no matches.
    }
  }

  const results = new Map<string, SwarmContextManifest>();
  for (const task of tasks) {
    const candidates = new Map<string, Candidate>();
    const add = (file: string, score: number, reason: string) => {
      const previous = candidates.get(file);
      if (!previous || score > previous.score) candidates.set(file, { path: file, score, reason });
    };
    for (const include of task.context.include) {
      const normalized = normalize(include).replace(/\/$/, '');
      for (const file of safeFiles) {
        if (isSafeTrackedFile(file, task.context.exclude) && (file === normalized || file.startsWith(`${normalized}/`))) add(file, 1000, `plan context.include: ${include}`);
      }
    }
    for (const file of safeFiles) {
      if (!isSafeTrackedFile(file, task.context.exclude)) continue;
      const leaf = file.slice(file.lastIndexOf('/') + 1).toUpperCase();
      if (INSTRUCTIONS.has(leaf) && (file.split('/').length <= 3 || leaf !== 'README.MD')) add(file, 900, 'project instructions');
    }
    const terms = termsByTask.get(task.id) ?? [];
    for (const [file, count] of matchesByTask.get(task.id) ?? []) {
      if (!candidates.has(file)) add(file, count * 3 + pathScore(file, terms), `matches task terms (${count} lines)`);
    }
    for (const file of safeFiles) {
      if (candidates.has(file) || !isSafeTrackedFile(file, task.context.exclude)) continue;
      const score = pathScore(file, terms);
      if (score > 0) add(file, score, 'path matches task terms');
    }
    const files = [...candidates.values()].sort((a, b) => b.score - a.score || a.path.localeCompare(b.path)).slice(0, MAX_CONTEXT_FILES).map(({ path, reason }) => ({ path, reason }));
    results.set(task.id, { baseCommit, files });
  }
  return results;
}

function taskTerms(task: SwarmTaskPlan): string[] {
  return [...new Set(`${task.agentName} ${task.work} ${task.acceptanceCriteria.join(' ')}`
    .toLowerCase()
    .match(/[a-z0-9][a-z0-9_-]{2,}/g) ?? [])]
    .filter((term) => !STOP_WORDS.has(term))
    .slice(0, MAX_GREP_TERMS);
}

function git(root: string, args: string[]): string | undefined {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', timeout: GREP_TIMEOUT_MS, maxBuffer: 2 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }).trimEnd();
  } catch {
    return undefined;
  }
}

function isSafeTrackedFile(file: string, excludes: string[]): boolean {
  if (GENERATED.test(file) || SENSITIVE.test(file) || /[\u0000-\u001f]/.test(file)) return false;
  const normalized = normalize(file);
  return !excludes.some((entry) => {
    const excluded = normalize(entry).replace(/\/$/, '');
    return normalized === excluded || normalized.startsWith(`${excluded}/`);
  });
}

function normalize(value: string): string {
  return value.replaceAll('\\', '/').replace(/^\.\//, '');
}

function pathScore(file: string, terms: string[]): number {
  const lower = file.toLowerCase();
  return terms.reduce((score, term) => score + (lower.includes(term) ? 5 : 0), 0);
}