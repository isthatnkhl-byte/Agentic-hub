import { isAgentEffort, isAgentProvider, type AgentProvider, type SwarmPlan, type SwarmRole, type SwarmTaskPlan } from '../shared/protocol.js';
import { SWARM_ROLE_PROFILES } from '../shared/meetings.js';
import { validateWorkerEffort, validateWorkerModel } from './agents.js';

export const SWARM_TASKS_MIN = 2;
export const SWARM_TASKS_MAX = 12;
export const SWARM_PLAN_MAX_BYTES = 256_000;
const TASK_ID = /^[a-z0-9][a-z0-9-]{0,63}$/;

type JsonObject = Record<string, unknown>;

export function parseSwarmPlan(source: string, allowedProviders: readonly AgentProvider[]): SwarmPlan | string {
  if (Buffer.byteLength(source, 'utf8') > SWARM_PLAN_MAX_BYTES) return `plan.json must be no larger than ${SWARM_PLAN_MAX_BYTES} bytes`;
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    return 'plan.json is not valid JSON';
  }
  if (!isObject(parsed)) return 'plan.json must contain a JSON object';
  if (parsed.schemaVersion !== undefined && parsed.schemaVersion !== 1) return 'plan.json schemaVersion must be 1';
  const rawTasks = parsed.tasks;
  if (!Array.isArray(rawTasks) || rawTasks.length < SWARM_TASKS_MIN || rawTasks.length > SWARM_TASKS_MAX) {
    return `plan.json must contain ${SWARM_TASKS_MIN} to ${SWARM_TASKS_MAX} tasks`;
  }
  const title = parsed.title === undefined ? undefined : boundedText(parsed.title, 100);
  if (parsed.title !== undefined && !title) return 'plan title must be a non-empty string of at most 100 characters';

  const tasks: SwarmTaskPlan[] = [];
  const ids = new Set<string>();
  for (let index = 0; index < rawTasks.length; index++) {
    const raw = rawTasks[index];
    if (!isObject(raw)) return `task ${index + 1} must be an object`;
    const agentName = boundedText(raw['agent-name'], 64);
    if (!agentName || hasControls(agentName)) return `task ${index + 1} needs an agent-name of 1 to 64 printable characters`;
    const generatedId = `${slug(agentName) || 'agent'}-${index + 1}`;
    const id = raw.id === undefined ? generatedId : boundedText(raw.id, 64);
    if (!id || !TASK_ID.test(id)) return `task ${index + 1} id must contain lowercase letters, numbers, and hyphens`;
    if (ids.has(id)) return `duplicate task id: ${id}`;
    ids.add(id);
    const work = boundedText(raw.work, 12_000);
    if (!work || hasControls(work)) return `task ${id} needs work of 1 to 12000 printable characters`;
    const dependsOn = stringList(raw.dependsOn, `task ${id} dependsOn`, 12, 64);
    if (typeof dependsOn === 'string') return dependsOn;
    if (new Set(dependsOn).size !== dependsOn.length) return `task ${id} repeats a dependency`;
    if (dependsOn.includes(id)) return `task ${id} cannot depend on itself`;
    const acceptanceCriteria = stringList(raw.acceptanceCriteria, `task ${id} acceptanceCriteria`, 8, 500);
    if (typeof acceptanceCriteria === 'string') return acceptanceCriteria;
    const context = parseContext(raw.context, id);
    if (typeof context === 'string') return context;
    const route = parseRoute(raw.route, id, agentName, allowedProviders);
    if (typeof route === 'string') return route;
    tasks.push({ id, agentName, work, dependsOn, acceptanceCriteria, context, route });
  }

  const taskIds = new Set(tasks.map((task) => task.id));
  for (const task of tasks) {
    const missing = task.dependsOn.find((dependency) => !taskIds.has(dependency));
    if (missing) return `task ${task.id} depends on missing task ${missing}`;
  }
  const cycle = dependencyCycle(tasks);
  if (cycle) return `plan contains a dependency cycle: ${cycle.join(' -> ')}`;
  return { schemaVersion: 1, title, tasks: topologicalOrder(tasks) };
}

function parseContext(value: unknown, taskId: string): SwarmTaskPlan['context'] | string {
  if (value === undefined) return { include: [], exclude: [] };
  if (!isObject(value)) return `task ${taskId} context must be an object`;
  const include = pathList(value.include, `task ${taskId} context.include`);
  if (typeof include === 'string') return include;
  const exclude = pathList(value.exclude, `task ${taskId} context.exclude`);
  if (typeof exclude === 'string') return exclude;
  return { include, exclude };
}

function parseRoute(value: unknown, taskId: string, agentName: string, allowedProviders: readonly AgentProvider[]): SwarmTaskPlan['route'] | string {
  if (value === undefined) return { role: inferRole(agentName), provider: 'auto' };
  if (!isObject(value)) return `task ${taskId} route must be an object`;
  const role = value.role === undefined ? inferRole(agentName) : value.role;
  if (typeof role !== 'string' || !Object.hasOwn(SWARM_ROLE_PROFILES, role)) {
    return `task ${taskId} role must be one of ${Object.keys(SWARM_ROLE_PROFILES).join(', ')}`;
  }
  const provider = value.provider === undefined ? 'auto' : value.provider;
  if (provider !== 'auto' && (!isAgentProvider(provider) || !allowedProviders.includes(provider))) {
    return `task ${taskId} provider is not available on this floor`;
  }
  const model = value.model === undefined ? undefined : boundedText(value.model, 256);
  if (value.model !== undefined && (!model || hasControls(model) || provider === 'auto')) {
    return `task ${taskId} model requires an explicit provider and a value of at most 256 characters`;
  }
  const effort = value.effort;
  if (effort !== undefined && (!isAgentEffort(effort) || provider === 'auto')) {
    return `task ${taskId} effort requires an explicit provider and a supported effort level`;
  }
  if (provider !== 'auto') {
    const modelError = validateWorkerModel('agent', provider, model);
    if (modelError) return `task ${taskId}: ${modelError}`;
    const effortError = validateWorkerEffort('agent', provider, effort);
    if (effortError) return `task ${taskId}: ${effortError}`;
  }
  return { role: role as SwarmRole, provider, model, effort: effort as SwarmTaskPlan['route']['effort'] };
}

function pathList(value: unknown, label: string): string[] | string {
  const list = stringList(value, label, 24, 240);
  if (typeof list === 'string') return list;
  for (const entry of list) {
    const normalized = entry.replaceAll('\\', '/');
    if (normalized.startsWith('/') || /^[A-Za-z]:/.test(normalized) || hasControls(normalized) || normalized.split('/').some((part) => part === '..' || part === '.')) {
      return `${label} entries must be safe project-relative paths`;
    }
  }
  return list;
}

function stringList(value: unknown, label: string, maxItems: number, maxLength: number): string[] | string {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > maxItems) return `${label} must be an array of at most ${maxItems} strings`;
  const list: string[] = [];
  for (const item of value) {
    const text = boundedText(item, maxLength);
    if (!text || hasControls(text)) return `${label} entries must be non-empty strings of at most ${maxLength} characters`;
    list.push(text);
  }
  return list;
}

function dependencyCycle(tasks: SwarmTaskPlan[]): string[] | undefined {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];
  const visit = (id: string): string[] | undefined => {
    if (visiting.has(id)) return [...stack.slice(stack.indexOf(id)), id];
    if (visited.has(id)) return undefined;
    visiting.add(id);
    stack.push(id);
    for (const dependency of byId.get(id)?.dependsOn ?? []) {
      const result = visit(dependency);
      if (result) return result;
    }
    stack.pop();
    visiting.delete(id);
    visited.add(id);
    return undefined;
  };
  for (const task of tasks) {
    const result = visit(task.id);
    if (result) return result;
  }
  return undefined;
}

function topologicalOrder(tasks: SwarmTaskPlan[]): SwarmTaskPlan[] {
  const remaining = new Map(tasks.map((task) => [task.id, task]));
  const complete = new Set<string>();
  const ordered: SwarmTaskPlan[] = [];
  while (remaining.size) {
    const ready = [...remaining.values()].find((task) => task.dependsOn.every((id) => complete.has(id)));
    if (!ready) return tasks;
    remaining.delete(ready.id);
    complete.add(ready.id);
    ordered.push(ready);
  }
  return ordered;
}

function inferRole(value: string): SwarmRole {
  const text = value.toLowerCase();
  if (/front.?end|ui|design/.test(text)) return 'frontend';
  if (/back.?end|api|server/.test(text)) return 'backend';
  if (/test|qa|quality/.test(text)) return 'testing';
  if (/security|audit|threat/.test(text)) return 'security';
  if (/doc|readme|writing/.test(text)) return 'documentation';
  return 'general';
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48).replace(/-$/g, '');
}

function boundedText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const text = value.trim();
  return text && text.length <= maxLength ? text : undefined;
}

function hasControls(value: string): boolean {
  return /[\u0000-\u001f\u007f]/.test(value);
}

function isObject(value: unknown): value is JsonObject {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}