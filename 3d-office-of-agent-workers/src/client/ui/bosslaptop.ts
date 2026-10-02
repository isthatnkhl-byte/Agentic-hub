import * as THREE from 'three';
import { h, openModal, type Modal } from './dom';
import { ScreenZoom } from './arcade';
import { Minesweeper, W, H } from './minesweeper';
import type { Net } from '../net';
import type { Store } from '../state';
import type { WorkerInfo } from '../../shared/protocol';
import { isBusy } from '../../shared/status';

export interface IdeTreeNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  mtime?: number;
  children?: IdeTreeNode[];
}

export interface BossLaptopActions {
  openTerminal: (workerId: string) => void;
  promptWorker: (deskId: string) => void;
  openChanges: (workerId: string) => void;
  killWorker: (workerId: string) => void;
  hireWorker: () => void;
}

function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return '🔷';
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return '🟨';
    case 'json':
      return '⚙️';
    case 'html':
    case 'css':
      return '🌐';
    case 'md':
    case 'txt':
      return '📝';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
    case 'webp':
    case 'ico':
      return '🖼️';
    case 'sh':
    case 'bash':
    case 'bat':
    case 'cmd':
      return '⚡';
    case 'py':
      return '🐍';
    case 'rs':
      return '🦀';
    case 'go':
      return '🐹';
    default:
      return '📄';
  }
}

function formatSize(bytes?: number): string {
  if (bytes === undefined || bytes === null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getTaskInfo(w: WorkerInfo): { title: string; desc: string } {
  if (w.task?.name) {
    return {
      title: w.task.name,
      desc: w.task.summary || 'Working on assigned task...',
    };
  }
  if (w.prompt) {
    return {
      title: 'Current Instruction',
      desc: w.prompt,
    };
  }
  if (w.activity) {
    return {
      title: 'Active Operation',
      desc: w.activity,
    };
  }
  return {
    title: 'Assistant Worker',
    desc: w.kind === 'shell' ? 'Shared terminal session' : 'Standing by for tasks',
  };
}

export class BossLaptop {
  private readonly view: ScreenZoom | null = null;
  private readonly picture = document.createElement('canvas');
  private readonly texture: THREE.CanvasTexture | null = null;
  private modal: Modal | null = null;
  private currentTab: 'home' | 'office' | 'ide' | 'minesweeper' = 'home';
  private unsubs: Array<() => void> = [];

  // IDE state
  private fileTree: IdeTreeNode[] = [];
  private currentFilePath: string | null = null;
  private currentFileContent = '';
  private savedFileContent = '';
  private isFileDirty = false;
  private isImage = false;
  private isBinary = false;
  private searchFilter = '';
  private expandedDirs = new Set<string>();
  private ideStatusMsg = '';

  // Minesweeper state
  private readonly minesweeper = new Minesweeper();

  constructor(
    screen: THREE.Mesh | null | undefined,
    private readonly net: Net,
    private readonly store: Store,
    private readonly actions: BossLaptopActions,
  ) {
    if (screen) {
      this.view = new ScreenZoom(screen);
      this.picture.width = W;
      this.picture.height = H;
      this.texture = new THREE.CanvasTexture(this.picture);
      this.texture.colorSpace = THREE.SRGBColorSpace;
      const mat = screen.material as THREE.MeshBasicMaterial;
      mat.map = this.texture;
      mat.color.set('#ffffff');
      mat.toneMapped = false;

      // Draw initial 3D screen texture
      this.drawScreen();
      void document.fonts.ready.then(() => this.drawScreen());

      // Update 3D screen texture whenever workers change
      store.on('workers', () => this.drawScreen());
      store.on('project', () => this.drawScreen());

      // Periodic clock update on the 3D texture
      setInterval(() => this.drawScreen(), 15000);
    }
  }

  get zoomed(): boolean {
    return this.view ? this.view.zoomed : false;
  }

  stop() {
    this.modal?.close();
  }

  update(camera: THREE.PerspectiveCamera, dt: number) {
    this.view?.update(camera, dt, !!this.modal);
  }

  /** Draws the Boss Workstation OS screen onto the 3D laptop monitor in the loft */
  drawScreen() {
    const ctx = this.picture.getContext('2d');
    if (!ctx) return;

    // Sleek background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0d1117');
    grad.addColorStop(0.5, '#161b22');
    grad.addColorStop(1, '#0b0f19');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Decorative grid pattern
    ctx.strokeStyle = '#30363d22';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Top menu bar
    ctx.fillStyle = '#161b22f0';
    ctx.fillRect(0, 0, W, 40);
    ctx.strokeStyle = '#30363d';
    ctx.beginPath();
    ctx.moveTo(0, 40);
    ctx.lineTo(W, 40);
    ctx.stroke();

    // Brand / Title
    ctx.font = 'bold 15px -apple-system, sans-serif';
    ctx.fillStyle = '#f0f6fc';
    ctx.fillText('👑 BOSS WORKSTATION OS', 20, 25);

    // Project Name
    const projName = this.store.project?.name ?? 'Workspace';
    ctx.font = '13px monospace';
    ctx.fillStyle = '#58a6ff';
    ctx.fillText(`📁 ${projName}`, 260, 25);

    // Workers count pill
    const workers = [...this.store.workers.values()];
    const busyCount = workers.filter((w) => isBusy(w.status)).length;
    const needsInput = workers.filter((w) => w.status === 'needs_input').length;

    ctx.fillStyle = busyCount > 0 ? '#238636' : '#30363d';
    ctx.beginPath();
    ctx.roundRect(W - 250, 8, 140, 24, 12);
    ctx.fill();

    ctx.font = 'bold 12px -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`⚡ ${busyCount} Busy | ${workers.length} Total`, W - 240, 24);

    // Time
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    ctx.fillStyle = '#8b949e';
    ctx.font = '13px monospace';
    ctx.fillText(timeStr, W - 80, 25);

    // Desktop icons (Left Column)
    // 1. Office App icon
    ctx.fillStyle = '#161b22dd';
    ctx.beginPath();
    ctx.roundRect(40, 70, 200, 110, 10);
    ctx.fill();
    ctx.strokeStyle = '#388bfd';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = '28px sans-serif';
    ctx.fillText('🏢', 60, 115);
    ctx.font = 'bold 16px -apple-system, sans-serif';
    ctx.fillStyle = '#f0f6fc';
    ctx.fillText('Office', 105, 105);
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillStyle = '#8b949e';
    ctx.fillText(`${workers.length} agents (${busyCount} active)`, 105, 125);
    ctx.fillStyle = '#3fb950';
    ctx.fillText('● Total Control', 105, 145);

    // 2. Custom IDE App icon
    ctx.fillStyle = '#161b22dd';
    ctx.beginPath();
    ctx.roundRect(40, 200, 200, 110, 10);
    ctx.fill();
    ctx.strokeStyle = '#58a6ff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = '28px sans-serif';
    ctx.fillText('💻', 60, 245);
    ctx.font = 'bold 16px -apple-system, sans-serif';
    ctx.fillStyle = '#f0f6fc';
    ctx.fillText('Custom IDE', 105, 235);
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillStyle = '#8b949e';
    ctx.fillText('Repo File Editor', 105, 255);
    ctx.fillStyle = '#58a6ff';
    ctx.fillText('● View & Edit All Files', 105, 275);

    // 3. Minesweeper App icon
    ctx.fillStyle = '#161b22dd';
    ctx.beginPath();
    ctx.roundRect(40, 330, 200, 110, 10);
    ctx.fill();
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '28px sans-serif';
    ctx.fillText('💣', 60, 375);
    ctx.font = 'bold 16px -apple-system, sans-serif';
    ctx.fillStyle = '#f0f6fc';
    ctx.fillText('Minesweeper', 105, 365);
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillStyle = '#8b949e';
    ctx.fillText('Executive Relaxation', 105, 385);

    // Right Side Widget: Live Workforce Activity & Tasks
    ctx.fillStyle = '#161b22ee';
    ctx.beginPath();
    ctx.roundRect(270, 70, 650, 420, 12);
    ctx.fill();
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Widget Header
    ctx.font = 'bold 16px -apple-system, sans-serif';
    ctx.fillStyle = '#f0f6fc';
    ctx.fillText('🏢 OFFICE WORKFORCE — TOTAL CONTROL', 290, 105);

    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillStyle = '#8b949e';
    ctx.fillText('Live monitoring: Active agents and their assigned tasks', 290, 128);

    // Summary pills
    ctx.fillStyle = '#21262d';
    ctx.beginPath();
    ctx.roundRect(290, 142, 130, 30, 6);
    ctx.fill();
    ctx.font = 'bold 12px -apple-system, sans-serif';
    ctx.fillStyle = '#58a6ff';
    ctx.fillText(`👥 TOTAL: ${workers.length}`, 305, 162);

    ctx.fillStyle = '#21262d';
    ctx.beginPath();
    ctx.roundRect(430, 142, 130, 30, 6);
    ctx.fill();
    ctx.font = 'bold 12px -apple-system, sans-serif';
    ctx.fillStyle = '#3fb950';
    ctx.fillText(`⚡ BUSY: ${busyCount}`, 445, 162);

    ctx.fillStyle = '#21262d';
    ctx.beginPath();
    ctx.roundRect(570, 142, 160, 30, 6);
    ctx.fill();
    ctx.font = 'bold 12px -apple-system, sans-serif';
    ctx.fillStyle = needsInput > 0 ? '#f0883e' : '#8b949e';
    ctx.fillText(`⚠️ NEEDS INPUT: ${needsInput}`, 585, 162);

    // Agent items preview
    let y = 205;
    if (workers.length === 0) {
      ctx.font = '14px -apple-system, sans-serif';
      ctx.fillStyle = '#8b949e';
      ctx.fillText('No agents currently active. Click screen to deploy your workforce.', 290, y + 30);
    } else {
      for (const w of workers.slice(0, 4)) {
        ctx.fillStyle = '#0d1117cc';
        ctx.beginPath();
        ctx.roundRect(290, y, 610, 56, 8);
        ctx.fill();
        ctx.strokeStyle = isBusy(w.status) ? '#388bfd44' : '#30363d';
        ctx.stroke();

        // Status circle
        ctx.fillStyle = isBusy(w.status) ? '#3fb950' : w.status === 'needs_input' ? '#f0883e' : '#8b949e';
        ctx.beginPath();
        ctx.arc(310, y + 28, 6, 0, Math.PI * 2);
        ctx.fill();

        // Agent name & caller
        ctx.font = 'bold 14px -apple-system, sans-serif';
        ctx.fillStyle = '#f0f6fc';
        ctx.fillText(w.name, 330, y + 24);

        if (w.createdBy) {
          ctx.font = '11px -apple-system, sans-serif';
          ctx.fillStyle = '#8b949e';
          ctx.fillText(`(called by ${w.createdBy})`, 335 + ctx.measureText(w.name).width, y + 24);
        }

        // Assigned task
        const task = getTaskInfo(w);
        ctx.font = '12px -apple-system, sans-serif';
        ctx.fillStyle = '#58a6ff';
        const taskText = `📋 Task: ${task.title} - ${task.desc}`;
        const clipped = taskText.length > 68 ? taskText.slice(0, 65) + '...' : taskText;
        ctx.fillText(clipped, 330, y + 44);

        y += 66;
      }
    }

    // Bottom prompt tip
    ctx.font = '12px -apple-system, sans-serif';
    ctx.fillStyle = '#8b949e';
    ctx.fillText('💡 Click or press E to launch Boss Workstation & Custom IDE', 40, H - 15);

    if (this.texture) this.texture.needsUpdate = true;
  }

  /** Opens the interactive Boss Workstation window */
  open(initialTab: 'home' | 'office' | 'ide' | 'minesweeper' = 'home') {
    if (this.modal) {
      this.switchTab(initialTab);
      return;
    }
    this.currentTab = initialTab;

    const box = h('div.boss-laptop', { role: 'dialog', 'aria-label': 'Boss Workstation' });

    // Sizing
    const fit = () => {
      const boxSize = this.view ? this.view.box() : { width: 1100, height: 720 };
      const { width, height } = boxSize;
      const w = Math.max(width, Math.min(window.innerWidth * 0.92, 1160));
      const h_ = Math.max(height, Math.min(window.innerHeight * 0.88, 740));
      box.style.width = `${Math.round(w)}px`;
      box.style.height = `${Math.round(h_)}px`;
    };
    fit();
    window.addEventListener('resize', fit);

    // Top Header & Tab switcher
    const homeTab = h('button.boss-tab', { type: 'button' }, '🏠 Desktop');
    const officeTab = h('button.boss-tab', { type: 'button' }, '🏢 Office');
    const ideTab = h('button.boss-tab', { type: 'button' }, '💻 IDE');
    const minesweeperTab = h('button.boss-tab', { type: 'button' }, '💣 Minesweeper');

    const updateTabs = () => {
      homeTab.className = `boss-tab ${this.currentTab === 'home' ? 'active' : ''}`;
      officeTab.className = `boss-tab ${this.currentTab === 'office' ? 'active' : ''}`;
      ideTab.className = `boss-tab ${this.currentTab === 'ide' ? 'active' : ''}`;
      minesweeperTab.className = `boss-tab ${this.currentTab === 'minesweeper' ? 'active' : ''}`;

      const workers = [...this.store.workers.values()];
      const busyCount = workers.filter((w) => isBusy(w.status)).length;
      officeTab.replaceChildren(
        '🏢 Office ',
        h('span.tab-badge', {}, `${busyCount}/${workers.length}`),
      );

      const proj = this.store.project?.name ?? 'Repo';
      ideTab.replaceChildren(
        '💻 IDE ',
        h('span.tab-badge', {}, proj),
      );
    };

    homeTab.onclick = () => this.switchTab('home');
    officeTab.onclick = () => this.switchTab('office');
    ideTab.onclick = () => this.switchTab('ide');
    minesweeperTab.onclick = () => this.switchTab('minesweeper');

    const tabs = h('div.boss-tabs', {}, homeTab, officeTab, ideTab, minesweeperTab);

    const clockEl = h('div.boss-clock', {}, '00:00:00');
    const updateClock = () => {
      clockEl.textContent = new Date().toLocaleTimeString();
    };
    updateClock();
    const clockTimer = setInterval(updateClock, 1000);

    const closeBtn = h('button.boss-close-btn', { type: 'button', title: 'Close workstation' }, '✕');
    closeBtn.onclick = () => this.modal?.close();

    const topBar = h(
      'div.boss-topbar',
      {},
      h('div.boss-brand', {}, '👑 BOSS OS', h('span.boss-badge', {}, 'Loft Executive')),
      tabs,
      h('div.boss-top-actions', {}, clockEl, closeBtn),
    );

    const bodyContainer = h('div.boss-body');

    box.append(topBar, bodyContainer);

    this.renderCurrentView(bodyContainer);

    // Re-render when workers or project update
    const unSubWorkers = this.store.on('workers', () => {
      updateTabs();
      this.drawScreen();
      if (this.currentTab === 'home' || this.currentTab === 'office') {
        this.renderCurrentView(bodyContainer);
      }
    });

    const unSubProject = this.store.on('project', () => {
      updateTabs();
      this.drawScreen();
    });

    this.unsubs = [unSubWorkers, unSubProject];

    updateTabs();

    this.modal = openModal(box, {
      backdropCloses: false,
      closeButton: false,
      doing: '💻 at Boss Workstation',
      onClose: () => {
        window.removeEventListener('resize', fit);
        clearInterval(clockTimer);
        for (const u of this.unsubs) u();
        this.unsubs = [];
        this.modal = null;
      },
    });

    // Load file tree initially
    void this.fetchFileTree();
  }

  private switchTab(tab: 'home' | 'office' | 'ide' | 'minesweeper') {
    this.currentTab = tab;
    if (this.modal) {
      const topBar = this.modal.el.querySelector('.boss-topbar');
      if (topBar) {
        const tabs = topBar.querySelectorAll('.boss-tab');
        tabs.forEach((t) => t.classList.remove('active'));
      }
      const body = this.modal.el.querySelector('.boss-body') as HTMLElement;
      if (body) {
        this.renderCurrentView(body);
      }
    }
  }

  private renderCurrentView(container: HTMLElement) {
    container.replaceChildren();

    if (this.currentTab === 'home') {
      container.append(this.buildHomeView());
    } else if (this.currentTab === 'office') {
      container.append(this.buildOfficeView());
    } else if (this.currentTab === 'ide') {
      container.append(this.buildIdeView());
    } else if (this.currentTab === 'minesweeper') {
      container.append(this.buildMinesweeperView());
    }
  }

  // ---------------------------------------------------------------------------------------------
  // HOME SCREEN VIEW
  // ---------------------------------------------------------------------------------------------
  private buildHomeView(): HTMLElement {
    const workers = [...this.store.workers.values()];
    const busyCount = workers.filter((w) => isBusy(w.status)).length;
    const needsInput = workers.filter((w) => w.status === 'needs_input').length;
    const idleCount = workers.length - busyCount;
    const proj = this.store.project;

    // Welcome Header
    const welcome = h(
      'div.boss-welcome',
      {},
      h(
        'div',
        {},
        h('h1', {}, 'Executive Command Desk'),
        h('p', {}, 'Total control over agent workers, task allocations, and repository codebase.'),
      ),
      h(
        'div.boss-agent-actions',
        {},
        h(
          'button.boss-btn.boss-btn-primary',
          {
            type: 'button',
            onclick: () => this.actions.hireWorker(),
          },
          '➕ Deploy Worker',
        ),
      ),
    );

    // Quick metrics row
    const metrics = h(
      'div.boss-quick-metrics',
      {},
      h('div.boss-metric-card', {}, h('div.label', {}, 'Total Agents'), h('div.val', {}, String(workers.length))),
      h('div.boss-metric-card', {}, h('div.label', {}, 'Currently Busy'), h('div.val', { style: 'color: #3fb950;' }, String(busyCount))),
      h('div.boss-metric-card', {}, h('div.label', {}, 'Needs Input'), h('div.val', { style: needsInput > 0 ? 'color: #f0883e;' : '' }, String(needsInput))),
      h('div.boss-metric-card', {}, h('div.label', {}, 'Standby / Idle'), h('div.val', {}, String(idleCount))),
    );

    // App launch cards
    const officeAppCard = h(
      'div.boss-app-card',
      {
        onclick: () => this.switchTab('office'),
      },
      h('div.app-icon', {}, '🏢'),
      h('div.app-name', {}, 'Office — Total Control'),
      h(
        'div.app-desc',
        {},
        'View how many agents are currently working, review which agent is working on which assigned task, inspect live terminals, and direct agent actions.',
      ),
      h(
        'div.app-status',
        {},
        busyCount > 0 ? `🟢 ${busyCount} agent(s) active on tasks` : '⚪ Workforce standby',
      ),
    );

    const ideAppCard = h(
      'div.boss-app-card',
      {
        onclick: () => this.switchTab('ide'),
      },
      h('div.app-icon', {}, '💻'),
      h('div.app-name', {}, 'Custom Workspace IDE'),
      h(
        'div.app-desc',
        {},
        'Browse and edit all files in the current repository. Search files, edit code with line numbers, format code, and save modifications directly to disk.',
      ),
      h('div.app-status', { style: 'color: #58a6ff;' }, `📁 ${proj?.name ?? 'Workspace'} (${proj?.branch ?? 'main'})`),
    );

    const minesweeperCard = h(
      'div.boss-app-card',
      {
        onclick: () => this.switchTab('minesweeper'),
      },
      h('div.app-icon', {}, '💣'),
      h('div.app-name', {}, 'Minesweeper'),
      h('div.app-desc', {}, 'The classic executive relaxation game. Clear the minefield when taking a break from managing your AI workforce.'),
      h('div.app-status', { style: 'color: #8b949e;' }, 'Play game'),
    );

    const appsGrid = h('div.boss-apps-grid', {}, officeAppCard, ideAppCard, minesweeperCard);

    return h('div.boss-home-view', {}, welcome, metrics, appsGrid);
  }

  // ---------------------------------------------------------------------------------------------
  // OFFICE APP: TOTAL CONTROL INTERFACE
  // ---------------------------------------------------------------------------------------------
  private buildOfficeView(): HTMLElement {
    const workers = [...this.store.workers.values()].sort((a, b) => b.createdAt - a.createdAt);
    const busyCount = workers.filter((w) => isBusy(w.status)).length;
    const needsInput = workers.filter((w) => w.status === 'needs_input').length;

    // Header with search & deploy
    const searchInput = h('input.boss-ide-search-input', {
      type: 'text',
      placeholder: 'Filter agents by name, task, or caller...',
      style: 'width: 280px;',
    });

    const header = h(
      'div.boss-office-header',
      {},
      h(
        'div',
        {},
        h('h2', {}, '🏢 Office — Total Control Interface'),
        h('p', {}, `Currently ${busyCount} of ${workers.length} agents are actively working on assigned tasks.`),
      ),
      h(
        'div.boss-office-controls',
        {},
        searchInput,
        h(
          'button.boss-btn.boss-btn-primary',
          {
            type: 'button',
            onclick: () => this.actions.hireWorker(),
          },
          '➕ Deploy New Agent',
        ),
      ),
    );

    const body = h('div.boss-office-body');

    const renderAgentCards = (filter = '') => {
      body.replaceChildren();

      const filtered = workers.filter((w) => {
        if (!filter) return true;
        const q = filter.toLowerCase();
        const task = getTaskInfo(w);
        return (
          w.name.toLowerCase().includes(q) ||
          w.createdBy.toLowerCase().includes(q) ||
          task.title.toLowerCase().includes(q) ||
          task.desc.toLowerCase().includes(q) ||
          w.status.toLowerCase().includes(q)
        );
      });

      if (filtered.length === 0) {
        body.append(
          h(
            'div.boss-ide-placeholder',
            {},
            h('div', { style: 'font-size: 40px;' }, '🏢'),
            h('h3', { style: 'margin: 0; color: #f0f6fc;' }, filter ? 'No matching agents found' : 'No agents currently deployed'),
            h('p', { style: 'margin: 0; font-size: 13px; color: #8b949e;' }, filter ? 'Try clearing your search filter.' : 'Deploy a new agent to assign coding tasks.'),
            h(
              'button.boss-btn.boss-btn-primary',
              {
                type: 'button',
                style: 'margin-top: 8px;',
                onclick: () => this.actions.hireWorker(),
              },
              '➕ Deploy Agent',
            ),
          ),
        );
        return;
      }

      for (const w of filtered) {
        const desk = this.store.plan().byId.get(w.deskId);
        const ownsWorker = this.store.me.admin || (!!this.store.me.identityId && w.createdById === this.store.me.identityId);
        const deskLabel = desk ? desk.label : w.deskId;
        const task = getTaskInfo(w);

        // Status badge
        let statusBadgeClass = 'boss-badge-idle';
        let statusText = 'Standby';
        if (isBusy(w.status)) {
          statusBadgeClass = 'boss-badge-busy';
          statusText = '⚡ Busy / Working';
        } else if (w.status === 'needs_input') {
          statusBadgeClass = 'boss-badge-needs-input';
          statusText = '⚠️ Needs Boss Input';
        } else if (w.status === 'done') {
          statusBadgeClass = 'boss-badge-busy';
          statusText = '✅ Completed';
        }

        // Action Buttons for Total Control
        const terminalBtn = h(
          'button.boss-btn',
          {
            type: 'button',
            onclick: () => this.actions.openTerminal(w.id),
          },
          '📺 Terminal',
        );

        const promptBtn = h(
          'button.boss-btn',
          {
            type: 'button',
            disabled: !ownsWorker,
            title: ownsWorker ? 'Assign or steer this worker' : `Only ${w.createdBy} or an admin can control this worker`,
            onclick: () => this.actions.promptWorker(w.deskId),
          },
          '💬 Assign / Steer',
        );

        const changesBtn = h(
          'button.boss-btn',
          {
            type: 'button',
            onclick: () => this.actions.openChanges(w.id),
          },
          '🔍 View Changes',
        );

        const dismissBtn = h(
          'button.boss-btn.boss-btn-danger',
          {
            type: 'button',
            disabled: !ownsWorker,
            title: ownsWorker ? 'Send this worker home' : `Only ${w.createdBy} or an admin can control this worker`,
            onclick: () => this.actions.killWorker(w.id),
          },
          '🛑 Dismiss',
        );

        const card = h(
          'div.boss-agent-card',
          {},
          // Card Head
          h(
            'div.boss-agent-card-head',
            {},
            h(
              'div.boss-agent-identity',
              {},
              h(
                'div.boss-agent-avatar',
                { style: `background: ${w.color || '#388bfd'};` },
                w.name.slice(0, 1).toUpperCase(),
              ),
              h('div.boss-agent-name', {}, w.name),
              h('div.boss-agent-caller', {}, `called by ${w.createdBy || 'Office'}`),
            ),
            h(
              'div.boss-agent-badges',
              {},
              h('span.boss-badge-pill', { class: statusBadgeClass }, statusText),
              h('span.boss-badge-pill', { style: 'background: #21262d; color: #8b949e;' }, `📍 ${deskLabel}`),
              w.provider ? h('span.boss-badge-pill', { style: 'background: #21262d; color: #58a6ff;' }, `🤖 ${w.provider}`) : false,
            ),
          ),
          // Assigned Task Section (Explicitly requested by user)
          h(
            'div.boss-agent-task-box',
            {},
            h('div.boss-task-title', {}, `📋 Assigned Task: ${task.title}`),
            h('div.boss-task-desc', {}, task.desc),
            h(
              'div.boss-task-meta',
              {},
              w.workingSince
                ? `⏱️ Working for ${Math.round((Date.now() - w.workingSince) / 1000)}s`
                : `Deployed at ${new Date(w.createdAt).toLocaleTimeString()}`,
              w.worktree?.branch ? ` · 🌿 branch: ${w.worktree.branch}` : '',
            ),
          ),
          // Total Control Actions
          h('div.boss-agent-actions', {}, terminalBtn, promptBtn, changesBtn, dismissBtn),
        );

        body.append(card);
      }
    };

    searchInput.addEventListener('input', () => {
      renderAgentCards(searchInput.value.trim());
    });

    renderAgentCards();

    return h('div.boss-office-view', {}, header, body);
  }

  // ---------------------------------------------------------------------------------------------
  // CUSTOM IDE APP: REPOSITORY EXPLORER & EDITOR
  // ---------------------------------------------------------------------------------------------
  private buildIdeView(): HTMLElement {
    const sidebar = h('div.boss-ide-sidebar');
    const main = h('div.boss-ide-main');

    // Sidebar Header & Actions
    const searchInput = h('input.boss-ide-search-input', {
      type: 'text',
      placeholder: 'Search files in repo...',
      value: this.searchFilter,
    });

    const refreshBtn = h('button.boss-ide-icon-btn', { type: 'button', title: 'Refresh file tree' }, '🔄');
    const newFileBtn = h('button.boss-ide-icon-btn', { type: 'button', title: 'New File' }, '📄+');
    const newFolderBtn = h('button.boss-ide-icon-btn', { type: 'button', title: 'New Folder' }, '📁+');
    const collapseBtn = h('button.boss-ide-icon-btn', { type: 'button', title: 'Collapse All' }, '🔽');

    refreshBtn.onclick = () => void this.fetchFileTree();
    collapseBtn.onclick = () => {
      this.expandedDirs.clear();
      this.renderFileTree(treeContainer);
    };

    newFileBtn.onclick = async () => {
      const filename = prompt('Enter relative path for new file (e.g. src/utils/helper.ts):');
      if (!filename?.trim()) return;
      try {
        const res = await fetch('/api/ide/create', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ path: filename.trim(), type: 'file' }),
        });
        const data = await res.json();
        if (data.ok) {
          await this.fetchFileTree();
          await this.loadFile(data.path);
        } else {
          alert(`Error creating file: ${data.error}`);
        }
      } catch (err) {
        alert(`Failed to create file: ${String(err)}`);
      }
    };

    newFolderBtn.onclick = async () => {
      const foldername = prompt('Enter relative path for new folder (e.g. src/components):');
      if (!foldername?.trim()) return;
      try {
        const res = await fetch('/api/ide/create', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ path: foldername.trim(), type: 'dir' }),
        });
        const data = await res.json();
        if (data.ok) {
          await this.fetchFileTree();
        } else {
          alert(`Error creating folder: ${data.error}`);
        }
      } catch (err) {
        alert(`Failed to create folder: ${String(err)}`);
      }
    };

    const sidebarHeader = h(
      'div.boss-ide-sidebar-header',
      {},
      h('div.boss-ide-sidebar-title', {}, 'Explorer'),
      h('div.boss-ide-sidebar-actions', {}, refreshBtn, newFileBtn, newFolderBtn, collapseBtn),
    );

    const searchBox = h('div.boss-ide-search-box', {}, searchInput);
    const treeContainer = h('div.boss-ide-tree');

    searchInput.addEventListener('input', () => {
      this.searchFilter = searchInput.value.trim().toLowerCase();
      this.renderFileTree(treeContainer);
    });

    sidebar.append(sidebarHeader, searchBox, treeContainer);
    this.renderFileTree(treeContainer);

    // Main Pane: Toolbar & Editor
    const breadcrumb = h('div.boss-ide-breadcrumb', {}, 'Select a file to edit');
    const statusPill = h('span', { style: 'font-size: 11px; color: #8b949e;' }, '');

    const saveBtn = h(
      'button.boss-btn.boss-btn-primary',
      {
        type: 'button',
        title: 'Save file to disk (Ctrl+S)',
      },
      '💾 Save',
    );

    const discardBtn = h(
      'button.boss-btn',
      {
        type: 'button',
        title: 'Discard unsaved changes',
      },
      '↺ Discard',
    );

    const deleteBtn = h(
      'button.boss-btn.boss-btn-danger',
      {
        type: 'button',
        title: 'Delete this file',
      },
      '🗑️ Delete',
    );

    saveBtn.onclick = () => void this.saveCurrentFile();
    discardBtn.onclick = () => {
      if (!this.isFileDirty) return;
      if (confirm('Discard unsaved changes to this file?')) {
        this.currentFileContent = this.savedFileContent;
        this.isFileDirty = false;
        this.renderEditorPane(main);
      }
    };

    deleteBtn.onclick = async () => {
      if (!this.currentFilePath) return;
      if (confirm(`Are you sure you want to delete ${this.currentFilePath}?`)) {
        try {
          const res = await fetch('/api/ide/delete', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ path: this.currentFilePath }),
          });
          const data = await res.json();
          if (data.ok) {
            this.currentFilePath = null;
            this.currentFileContent = '';
            this.savedFileContent = '';
            this.isFileDirty = false;
            await this.fetchFileTree();
            this.renderEditorPane(main);
          } else {
            alert(`Error deleting file: ${data.error}`);
          }
        } catch (err) {
          alert(`Failed to delete file: ${String(err)}`);
        }
      }
    };

    const toolbar = h(
      'div.boss-ide-toolbar',
      {},
      breadcrumb,
      h('div.boss-ide-actions', {}, statusPill, discardBtn, saveBtn, deleteBtn),
    );

    main.append(toolbar);
    this.renderEditorPane(main);

    return h('div.boss-ide-view', {}, sidebar, main);
  }

  private async fetchFileTree() {
    try {
      const res = await fetch('/api/ide/tree');
      const data = await res.json();
      if (data.ok && Array.isArray(data.tree)) {
        this.fileTree = data.tree;
        // Re-render tree if container exists
        if (this.modal) {
          const treeContainer = this.modal.el.querySelector('.boss-ide-tree') as HTMLElement;
          if (treeContainer) this.renderFileTree(treeContainer);
        }
      }
    } catch (err) {
      console.error('Failed to load file tree:', err);
    }
  }

  private renderFileTree(container: HTMLElement) {
    container.replaceChildren();

    const renderNodes = (nodes: IdeTreeNode[], depth = 0): HTMLElement[] => {
      const elements: HTMLElement[] = [];
      for (const node of nodes) {
        if (this.searchFilter) {
          // If searching, check if node matches or has matching children
          const matches = node.name.toLowerCase().includes(this.searchFilter) || node.path.toLowerCase().includes(this.searchFilter);
          if (node.type === 'file' && !matches) continue;
          if (node.type === 'dir' && !matches) {
            // Check children
            const sub = renderNodes(node.children ?? [], depth + 1);
            if (sub.length === 0) continue;
            // Dir matches through child
            const folderRow = h(
              'div.boss-ide-node',
              {
                style: `padding-left: ${depth * 14 + 10}px; font-weight: 600;`,
                onclick: () => {
                  if (this.expandedDirs.has(node.path)) this.expandedDirs.delete(node.path);
                  else this.expandedDirs.add(node.path);
                  this.renderFileTree(container);
                },
              },
              h('span.boss-ide-node-icon', {}, '📂'),
              h('span', {}, node.name),
            );
            elements.push(folderRow, ...sub);
            continue;
          }
        }

        if (node.type === 'dir') {
          const isExpanded = this.expandedDirs.has(node.path) || !!this.searchFilter;
          const folderRow = h(
            'div.boss-ide-node',
            {
              style: `padding-left: ${depth * 14 + 10}px; font-weight: 600;`,
              onclick: () => {
                if (this.expandedDirs.has(node.path)) this.expandedDirs.delete(node.path);
                else this.expandedDirs.add(node.path);
                this.renderFileTree(container);
              },
            },
            h('span.boss-ide-node-icon', {}, isExpanded ? '📂' : '📁'),
            h('span', {}, node.name),
          );
          elements.push(folderRow);
          if (isExpanded && node.children) {
            elements.push(...renderNodes(node.children, depth + 1));
          }
        } else {
          const isActive = this.currentFilePath === node.path;
          const fileRow = h(
            'div.boss-ide-node',
            {
              class: isActive ? 'active' : '',
              style: `padding-left: ${depth * 14 + 10}px;`,
              onclick: () => void this.loadFile(node.path),
            },
            h('span.boss-ide-node-icon', {}, getFileIcon(node.name)),
            h('span', {}, node.name),
          );
          elements.push(fileRow);
        }
      }
      return elements;
    };

    const rendered = renderNodes(this.fileTree);
    if (rendered.length === 0) {
      container.append(
        h('div', { style: 'padding: 16px; font-size: 12px; color: #8b949e; text-align: center;' }, 'No files match your search'),
      );
    } else {
      container.append(...rendered);
    }
  }

  private async loadFile(filePath: string) {
    if (this.isFileDirty) {
      if (!confirm(`You have unsaved changes in ${this.currentFilePath}. Discard and open ${filePath}?`)) {
        return;
      }
    }

    try {
      const res = await fetch(`/api/ide/file?path=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      if (!data.ok) {
        alert(`Error opening file: ${data.error}`);
        return;
      }

      this.currentFilePath = filePath;
      this.isImage = !!data.isImage;
      this.isBinary = !!data.isBinary;
      this.currentFileContent = data.content ?? '';
      this.savedFileContent = this.currentFileContent;
      this.isFileDirty = false;
      this.ideStatusMsg = `Loaded ${formatSize(data.size)}`;

      if (this.modal) {
        const treeContainer = this.modal.el.querySelector('.boss-ide-tree') as HTMLElement;
        if (treeContainer) this.renderFileTree(treeContainer);

        const main = this.modal.el.querySelector('.boss-ide-main') as HTMLElement;
        if (main) this.renderEditorPane(main);
      }
    } catch (err) {
      alert(`Failed to load file: ${String(err)}`);
    }
  }

  private async saveCurrentFile() {
    if (!this.currentFilePath) return;
    try {
      this.ideStatusMsg = 'Saving...';
      if (this.modal) {
        const statusEl = this.modal.el.querySelector('.boss-ide-actions span');
        if (statusEl) statusEl.textContent = this.ideStatusMsg;
      }

      const res = await fetch('/api/ide/file', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          path: this.currentFilePath,
          content: this.currentFileContent,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        this.savedFileContent = this.currentFileContent;
        this.isFileDirty = false;
        this.ideStatusMsg = `Saved at ${new Date().toLocaleTimeString()} (${formatSize(data.size)})`;
      } else {
        this.ideStatusMsg = `Save error: ${data.error}`;
        alert(`Error saving file: ${data.error}`);
      }

      if (this.modal) {
        const main = this.modal.el.querySelector('.boss-ide-main') as HTMLElement;
        if (main) this.renderEditorPane(main);
      }
    } catch (err) {
      this.ideStatusMsg = 'Failed to save';
      alert(`Save request failed: ${String(err)}`);
    }
  }

  private renderEditorPane(main: HTMLElement) {
    // Update toolbar breadcrumb & actions
    const breadcrumb = main.querySelector('.boss-ide-breadcrumb') as HTMLElement;
    const statusPill = main.querySelector('.boss-ide-actions span') as HTMLElement;
    const saveBtn = main.querySelector('.boss-ide-actions button.boss-btn-primary') as HTMLButtonElement;
    const discardBtn = main.querySelector('.boss-ide-actions button:nth-child(2)') as HTMLButtonElement;
    const deleteBtn = main.querySelector('.boss-ide-actions button.boss-btn-danger') as HTMLButtonElement;

    if (breadcrumb) {
      if (this.currentFilePath) {
        breadcrumb.replaceChildren(
          h('span', {}, '📁 '),
          h('span.file-name', {}, this.currentFilePath),
          ...(this.isFileDirty ? [h('span.dirty-dot', {}, ' ● Unsaved')] : []),
        );
      } else {
        breadcrumb.textContent = 'Select a file from the explorer to view or edit';
      }
    }

    if (statusPill) statusPill.textContent = this.ideStatusMsg;
    if (saveBtn) saveBtn.style.display = this.currentFilePath && !this.isBinary ? 'inline-flex' : 'none';
    if (discardBtn) discardBtn.style.display = this.isFileDirty ? 'inline-flex' : 'none';
    if (deleteBtn) deleteBtn.style.display = this.currentFilePath ? 'inline-flex' : 'none';

    // Remove any existing editor container after toolbar
    const existingContainer = main.querySelector('.boss-ide-editor-container, .boss-ide-placeholder, .boss-ide-image-preview');
    if (existingContainer) existingContainer.remove();

    if (!this.currentFilePath) {
      main.append(
        h(
          'div.boss-ide-placeholder',
          {},
          h('div', { style: 'font-size: 48px;' }, '💻'),
          h('h3', { style: 'margin: 0; color: #f0f6fc;' }, 'Executive Workspace IDE'),
          h('p', { style: 'margin: 0; font-size: 13px; color: #8b949e;' }, 'Select any file from the explorer on the left to read or edit its contents.'),
          h('p', { style: 'margin: 0; font-size: 12px; color: #58a6ff;' }, '💡 Press Ctrl+S to save modifications back to disk.'),
        ),
      );
      return;
    }

    if (this.isImage) {
      main.append(
        h(
          'div.boss-ide-image-preview',
          {},
          h('img', { src: `/api/ide/raw?path=${encodeURIComponent(this.currentFilePath)}`, alt: this.currentFilePath }),
          h('div', { style: 'font-size: 12px; color: #8b949e;' }, `Image preview: ${this.currentFilePath}`),
        ),
      );
      return;
    }

    if (this.isBinary) {
      main.append(
        h(
          'div.boss-ide-placeholder',
          {},
          h('div', { style: 'font-size: 40px;' }, '📦'),
          h('h3', { style: 'margin: 0; color: #f0f6fc;' }, 'Binary File'),
          h('p', { style: 'margin: 0; font-size: 13px; color: #8b949e;' }, 'This file cannot be displayed or edited as text.'),
        ),
      );
      return;
    }

    // Text / Code Editor with Line Numbers Gutter
    const lineNumbers = h('div.boss-ide-line-numbers');
    const textarea = h('textarea.boss-ide-textarea', {
      spellcheck: false,
      autocomplete: 'off',
      autocorrect: 'off',
      autocapitalize: 'off',
    }) as HTMLTextAreaElement;

    textarea.value = this.currentFileContent;

    const updateLineNumbers = () => {
      const lines = textarea.value.split('\n').length;
      const nums = [];
      for (let i = 1; i <= lines; i++) nums.push(i);
      lineNumbers.textContent = nums.join('\n');
    };

    updateLineNumbers();

    // Synchronize scrolling between textarea and line numbers gutter
    textarea.addEventListener('scroll', () => {
      lineNumbers.scrollTop = textarea.scrollTop;
    });

    textarea.addEventListener('input', () => {
      this.currentFileContent = textarea.value;
      this.isFileDirty = this.currentFileContent !== this.savedFileContent;
      updateLineNumbers();
      if (breadcrumb) {
        breadcrumb.replaceChildren(
          h('span', {}, '📁 '),
          h('span.file-name', {}, this.currentFilePath!),
          ...(this.isFileDirty ? [h('span.dirty-dot', {}, ' ● Unsaved')] : []),
        );
      }
      if (discardBtn) discardBtn.style.display = this.isFileDirty ? 'inline-flex' : 'none';
    });

    // Keyboard shortcuts: Tab key support and Ctrl+S to save
    textarea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        e.stopPropagation();
        void this.saveCurrentFile();
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        this.currentFileContent = textarea.value;
        this.isFileDirty = this.currentFileContent !== this.savedFileContent;
        updateLineNumbers();
      }
    });

    const editorContainer = h('div.boss-ide-editor-container', {}, lineNumbers, textarea);
    main.append(editorContainer);
  }

  // ---------------------------------------------------------------------------------------------
  // MINESWEEPER APP (Arcade Game)
  // ---------------------------------------------------------------------------------------------
  private buildMinesweeperView(): HTMLElement {
    const game = this.minesweeper;
    if (game.state === 'won' || game.state === 'lost') game.reset();

    const canvas = h('canvas', {
      width: W,
      height: H,
      style: 'width: 100%; height: 100%; display: block; background: #0b1320; cursor: pointer;',
    }) as HTMLCanvasElement;

    const spot = (e: MouseEvent) => ({
      x: (e.offsetX * W) / canvas.clientWidth,
      y: (e.offsetY * H) / canvas.clientHeight,
    });

    let holding = false;
    canvas.addEventListener('pointerdown', (e) => {
      const { x, y } = spot(e);
      const i = game.cellAt(x, y);
      if (e.button === 2 || (e.button === 0 && (e.ctrlKey || e.shiftKey))) game.flag(i);
      else if (e.button === 1) game.chord(i);
      else if (e.button === 0 && game.onFace(x, y)) game.reset();
      else if (e.button === 0) {
        holding = true;
        game.pressed = i;
        canvas.setPointerCapture(e.pointerId);
      }
      game.paint(canvas.getContext('2d')!, false);
    });

    canvas.addEventListener('pointermove', (e) => {
      const { x, y } = spot(e);
      const i = game.cellAt(x, y);
      if (i === game.hover) return;
      game.hover = i;
      if (holding) game.pressed = i;
      game.paint(canvas.getContext('2d')!, false);
    });

    canvas.addEventListener('pointerup', (e) => {
      if (e.button !== 0 || !holding) return;
      holding = false;
      const i = game.pressed;
      game.pressed = -1;
      if (game.isOpen(i)) game.chord(i);
      else game.open(i);
      game.paint(canvas.getContext('2d')!, false);
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Initial draw
    requestAnimationFrame(() => game.paint(canvas.getContext('2d')!, false));

    return h('div', { style: 'flex: 1; display: flex; overflow: hidden;' }, canvas);
  }
}
