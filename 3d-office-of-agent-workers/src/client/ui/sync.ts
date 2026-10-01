import type { Net } from '../net.js';
import type { ServerMsg } from '../../shared/protocol.js';
import { toast } from './dom.js';

let syncing = false;

export function routeSyncMessage(msg: ServerMsg) {
  if (msg.t === 'workflow.synced') {
    syncing = false;
    if (msg.ok) {
      const branchInfo = msg.branch ? `[${msg.branch}] ` : '';
      const syncStatus =
        msg.ahead !== undefined || msg.behind !== undefined
          ? `(${msg.behind ?? 0} behind, ${msg.ahead ?? 0} ahead)`
          : 'up to date';
      toast(
        `✅ ${branchInfo}Workflow synced with remote ${syncStatus} · ${msg.workers ?? 0} workers active`,
        'info',
      );
    } else {
      toast(`⚠️ Workflow sync: ${msg.error ?? 'Fetch failed'}`, 'warn');
    }
  }
}

export function syncWorkflow(net: Net) {
  if (syncing) {
    toast('Workflow sync is already in progress…', 'info');
    return;
  }
  syncing = true;
  toast('🔄 Syncing workflow: fetching remote commits and waking workers…', 'info');
  net.send({ t: 'workflow.sync' });
  setTimeout(() => {
    syncing = false;
  }, 12000);
}
