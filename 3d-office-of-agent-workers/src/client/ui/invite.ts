import type { Net } from '../net.js';
import { store } from '../state.js';
import { h, openModal } from './dom.js';
import { copyButton } from './team.js';

export function openInviteModal(net: Net) {
  const code = store.roomCode || 'OFFICE';
  const joinUrl = `${location.origin}/join#${code}`;
  const lanUrl =
    location.hostname === 'localhost' || location.hostname === '127.0.0.1'
      ? `http://<YOUR-IP>:${location.port || 4600}/join#${code}`
      : joinUrl;

  const close = h('button.btn.close', { 'aria-label': 'Close' }, '✕');

  const codeBox = h(
    'div.invite-code-card',
    {
      style:
        'background: rgba(108,92,231,0.08); border: 2px dashed #6c5ce7; border-radius: 12px; padding: 18px; text-align: center; margin: 12px 0;',
    },
    h(
      'div',
      {
        style:
          'font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #6c5ce7; font-weight: 700; margin-bottom: 6px;',
      },
      'Multiplayer Room Code',
    ),
    h(
      'div.invite-code-text',
      {
        style:
          'font-size: 32px; font-weight: 800; font-family: monospace; letter-spacing: 3px; color: #2d3436; margin: 8px 0;',
      },
      code,
    ),
    h(
      'div',
      { style: 'display: flex; gap: 8px; justify-content: center; margin-top: 10px; flex-wrap: wrap;' },
      copyButton('📋 Copy Room Code', () => code, 'primary'),
      copyButton('🔗 Copy Direct Link', () => joinUrl),
    ),
  );

  const instructions = h(
    'div.invite-instructions',
    { style: 'font-size: 14px; line-height: 1.6; color: #4b6584; margin: 16px 0;' },
    h(
      'p',
      { style: 'margin: 0 0 10px 0;' },
      h('strong', {}, 'How it works: '),
      'Teammates enter this Room Code to join this office. They can join as a guest or create an account with a password.',
    ),
    h(
      'ul',
      { style: 'margin: 0 0 12px 20px; padding: 0;' },
      h('li', {}, 'Walk up to any unoccupied desk and assign your own AI agents (Antigravity, Claude, OpenCode, Codex).'),
      h('li', {}, 'Everyone can see workers and their live terminals. Only the worker’s owner or an admin can prompt, stop, or type into it.'),
      h('li', {}, 'Issues, pull requests, queue state, and running service previews stay visible to the whole team.'),
      h('li', {}, 'Room codes are shared invitations. Use Accounts to create named, revocable accounts with individual roles.'),
      h('li', {}, 'Use the 🔄 Sync Workflow button on the dock anytime to pull latest remote git commits.'),
    ),
    h(
      'div',
      { style: 'background: #f1f2f6; border-radius: 8px; padding: 10px 14px; font-size: 13px;' },
      h('span', { style: 'font-weight: 600;' }, '🌐 Local Network Sharing: '),
      h('span', {}, `Share ${lanUrl} with anyone on your local network or VPN.`),
    ),
  );

  const peersList = h('div.invite-peers-list', { style: 'margin-top: 14px;' });
  const renderPeers = () => {
    peersList.replaceChildren();
    const peers = [...store.peers.values()];
    peersList.append(
      h(
        'div',
        { style: 'font-weight: 600; font-size: 13px; margin-bottom: 6px; color: #2f3542;' },
        `Teammates currently in office (${peers.length}):`,
      ),
      h(
        'div',
        { style: 'display: flex; flex-wrap: wrap; gap: 8px;' },
        ...peers.map((p) =>
          h(
            'span.peer-badge',
            {
              style:
                'display: inline-flex; align-items: center; gap: 6px; background: #fff; border: 1px solid #dcdde1; padding: 4px 10px; border-radius: 16px; font-size: 13px;',
            },
            h('span.dot', {
              style: `width: 8px; height: 8px; border-radius: 50%; background: ${p.color}; display: inline-block;`,
            }),
            p.name + (p.id === store.you ? ' (you)' : ''),
          ),
        ),
      ),
    );
  };
  renderPeers();

  const body = h('div.body.invite-modal-body', { style: 'padding: 4px 8px 16px;' }, codeBox, instructions, peersList);
  const footer = h(
    'footer',
    {},
    h('span.grow', { style: 'font-size: 12px; color: #747d8c;' }, 'Room Code enables seamless co-working for all participants.'),
    h('button.btn', { type: 'button', onclick: () => modal.close() }, 'Done'),
  );

  const el = h(
    'div.modal',
    { role: 'dialog', 'aria-label': 'Multiplayer Invite', style: 'width: min(580px, 95vw);' },
    h('header', {}, h('h2', {}, '👥 Multiplayer Invite & Room Code'), close),
    body,
    footer,
  );

  const modal = openModal(el);
  const unsubs = [store.on('peers', renderPeers)];
  const prevClose = modal.close;
  modal.close = () => {
    unsubs.forEach((u) => u());
    prevClose();
  };
  return modal;
}
