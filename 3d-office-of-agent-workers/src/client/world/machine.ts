import * as THREE from 'three';
import type { MachineState } from '../../shared/protocol';
import { officeFull } from '../../shared/machine';

const FONT = 'Nunito, ui-rounded, system-ui, sans-serif';
const INK = '#1b1d2e';
const MUTED = '#9aa0b8';

/** Green while there's room, amber when it's getting full, red from where hiring gets a warning. */
export function loadColor(pct: number): string {
  return pct >= 90 ? '#ef476f' : pct >= 70 ? '#ffd166' : '#06d6a0';
}

export function fmtGb(bytes: number): string {
  const gb = bytes / 2 ** 30;
  return `${gb.toFixed(gb < 10 ? 1 : 0)} GB`;
}

/**
 * The machine monitor on the west wall: how busy the CPU and memory are, with the last few minutes
 * of each, and how many workers the office runs of the most it takes.
 */
export class MachineTexture {
  readonly texture: THREE.CanvasTexture;
  private canvas = document.createElement('canvas');
  private ctx: CanvasRenderingContext2D;
  private drawn = '';

  constructor() {
    // The screen's own shape (MACHINE_MONITOR is 2.3 × 1.3 m).
    this.canvas.width = 920;
    this.canvas.height = 520;
    this.ctx = this.canvas.getContext('2d')!;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 8;
  }

  render(s: MachineState) {
    const key = JSON.stringify(s);
    if (key === this.drawn) return;
    this.drawn = key;
    const g = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    g.fillStyle = INK;
    g.fillRect(0, 0, W, H);
    g.textBaseline = 'alphabetic';

    // Header: what this is, and whether there's room for another worker.
    g.textAlign = 'left';
    g.fillStyle = '#ffffff';
    g.font = `900 40px ${FONT}`;
    g.fillText('🖥️ This machine', 30, 62);
    const full = officeFull(s);
    const status = !s.memTotal ? ['…', MUTED] : s.pressure ? ['⚠️ Under pressure', '#ef476f'] : full ? ['🚫 Office full', '#ffd166'] : ['✅ Room to hire', '#06d6a0'];
    g.font = `800 30px ${FONT}`;
    const tw = g.measureText(status[0]).width;
    g.fillStyle = status[1];
    roundRect(g, W - 30 - tw - 32, 24, tw + 32, 50, 25);
    g.fill();
    g.fillStyle = INK;
    g.textAlign = 'center';
    g.fillText(status[0], W - 30 - (tw + 32) / 2, 60);

    const memPct = s.memTotal ? Math.round((s.memUsed / s.memTotal) * 100) : 0;
    this.panel(30, 100, 415, 'CPU', s.cpu, s.cores ? `${s.cores} core${s.cores === 1 ? '' : 's'}` : '', s.history.map(([c]) => c));
    this.panel(475, 100, 415, 'Memory', memPct, s.memTotal ? `${fmtGb(s.memUsed)} of ${fmtGb(s.memTotal)}` : '', s.history.map(([, m]) => m));

    // Footer: the workers, one pip each, against the limit.
    const y = 440;
    g.textAlign = 'left';
    g.font = `800 32px ${FONT}`;
    g.fillStyle = '#ffffff';
    const label = s.limit === undefined ? `👷 ${s.workers} worker${s.workers === 1 ? '' : 's'} · no limit` : `👷 ${s.workers} of ${s.limit} workers`;
    g.fillText(label, 30, y + 12);
    if (s.limit !== undefined) {
      const x0 = 30 + g.measureText(label).width + 28;
      const room = W - 30 - x0;
      const pip = Math.min(34, room / Math.max(s.limit, s.workers));
      for (let i = 0; i < Math.max(s.limit, s.workers); i++) {
        g.fillStyle = i >= s.limit ? '#ef476f' : i < s.workers ? (full ? '#ffd166' : '#06d6a0') : '#3a3d55';
        roundRect(g, x0 + i * pip, y - 14, Math.max(2, pip - 6), 30, Math.min(8, pip / 3));
        g.fill();
      }
    }
    this.texture.needsUpdate = true;
  }

  /** One gauge: its name, the percent now, a line under it, and the last few minutes as a filled graph. */
  private panel(x: number, y: number, w: number, name: string, pct: number, sub: string, history: number[]) {
    const g = this.ctx;
    const color = loadColor(pct);
    g.fillStyle = '#25283d';
    roundRect(g, x, y, w, 300, 18);
    g.fill();
    g.textAlign = 'left';
    g.fillStyle = MUTED;
    g.font = `800 28px ${FONT}`;
    g.fillText(name, x + 20, y + 42);
    g.fillStyle = color;
    g.font = `900 84px ${FONT}`;
    g.fillText(`${pct}%`, x + 20, y + 124);
    g.fillStyle = MUTED;
    g.font = `700 24px ${FONT}`;
    g.fillText(sub, x + 20, y + 160);
    // The graph: 0-100%, the newest reading on the right.
    const gx = x + 20;
    const gy = y + 180;
    const gw = w - 40;
    const gh = 100;
    // The 90% line: past it, hiring comes with a warning.
    g.strokeStyle = '#3a3d55';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(gx, gy + gh * 0.1);
    g.lineTo(gx + gw, gy + gh * 0.1);
    g.stroke();
    if (history.length < 2) return;
    const step = gw / (history.length - 1);
    const at = (i: number) => [gx + i * step, gy + gh - (Math.max(0, Math.min(100, history[i])) / 100) * gh] as const;
    g.beginPath();
    g.moveTo(gx, gy + gh);
    for (let i = 0; i < history.length; i++) g.lineTo(...at(i));
    g.lineTo(gx + gw, gy + gh);
    g.closePath();
    g.globalAlpha = 0.28;
    g.fillStyle = color;
    g.fill();
    g.globalAlpha = 1;
    g.beginPath();
    for (let i = 0; i < history.length; i++) (i ? g.lineTo : g.moveTo).call(g, ...at(i));
    g.strokeStyle = color;
    g.lineWidth = 4;
    g.stroke();
  }
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
}

export interface UserHardwareInfo {
  peerId: string;
  name: string;
  color: string;
  isYou: boolean;
  hardware?: {
    cores: number;
    memoryGb: number;
    platform: string;
    screen: string;
    gpu?: string;
    cpuPct?: number;
  };
  calledWorkers: number;
  machine?: MachineState;
}

/**
 * Machine monitor for an individual human peer on the west wall.
 * Displays that user's hardware configuration (cores, RAM, OS/platform, screen, GPU)
 * and the workers they called, running isolated in their terminal.
 */
export class UserMachineTexture {
  readonly texture: THREE.CanvasTexture;
  private canvas = document.createElement('canvas');
  private ctx: CanvasRenderingContext2D;
  private drawn = '';

  constructor() {
    this.canvas.width = 920;
    this.canvas.height = 520;
    this.ctx = this.canvas.getContext('2d')!;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 8;
  }

  render(info: UserHardwareInfo) {
    const key = JSON.stringify({
      id: info.peerId,
      name: info.name,
      color: info.color,
      hw: info.hardware,
      workers: info.calledWorkers,
      isYou: info.isYou,
      mach: info.machine?.cpu,
    });
    if (key === this.drawn) return;
    this.drawn = key;

    const g = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    g.fillStyle = INK;
    g.fillRect(0, 0, W, H);
    g.textBaseline = 'alphabetic';

    // Header: User avatar dot and title
    g.beginPath();
    g.arc(52, 48, 14, 0, Math.PI * 2);
    g.fillStyle = info.color || '#4f86f7';
    g.fill();
    g.lineWidth = 3;
    g.strokeStyle = '#ffffff';
    g.stroke();

    g.textAlign = 'left';
    g.fillStyle = '#ffffff';
    g.font = `900 36px ${FONT}`;
    const titleText = `🖥️ ${info.name}'s Machine${info.isYou ? ' (You)' : ''}`;
    g.fillText(titleText.length > 28 ? titleText.slice(0, 27) + '…' : titleText, 80, 58);

    // Status Pill on top-right
    const isLocal = info.isYou;
    const statusText = isLocal ? '🟢 Active (Host)' : '🟢 Remote Peer';
    const statusColor = isLocal ? '#06d6a0' : '#4f86f7';
    g.font = `800 24px ${FONT}`;
    const tw = g.measureText(statusText).width;
    g.fillStyle = '#25283d';
    roundRect(g, W - 30 - tw - 32, 24, tw + 32, 48, 24);
    g.fill();
    g.strokeStyle = statusColor;
    g.lineWidth = 2;
    g.stroke();
    g.fillStyle = statusColor;
    g.textAlign = 'center';
    g.fillText(statusText, W - 30 - (tw + 32) / 2, 57);

    // Hardware parameters
    const cores = info.hardware?.cores ?? 8;
    const memGb = info.hardware?.memoryGb ?? 16;
    const platform = info.hardware?.platform ?? (isLocal ? 'Local System' : 'Remote');
    const screen = info.hardware?.screen ?? '1920×1080';
    const gpu = info.hardware?.gpu;
    const cpuPct = info.hardware?.cpuPct ?? (info.machine?.cpu ?? Math.min(95, Math.max(12, Math.round(15 + info.calledWorkers * 14))));

    // Panel 1: CPU & Platform (x: 30, y: 95, w: 415, h: 295)
    this.drawCpuPanel(30, 95, 415, cores, platform, screen, gpu, cpuPct);

    // Panel 2: Memory & Assigned Workers (x: 475, y: 95, w: 415, h: 295)
    this.drawMemPanel(475, 95, 415, memGb, info.calledWorkers, info.color);

    // Footer: Isolated Terminal Execution & Worker Attribution
    this.drawFooter(30, 415, W - 60, info.name, info.calledWorkers, info.color);

    this.texture.needsUpdate = true;
  }

  private drawCpuPanel(x: number, y: number, w: number, cores: number, platform: string, screen: string, gpu: string | undefined, cpuPct: number) {
    const g = this.ctx;
    g.fillStyle = '#25283d';
    roundRect(g, x, y, w, 295, 18);
    g.fill();

    g.textAlign = 'left';
    g.fillStyle = MUTED;
    g.font = `800 24px ${FONT}`;
    g.fillText('CPU & PLATFORM', x + 20, y + 36);

    const loadCol = loadColor(cpuPct);
    g.fillStyle = loadCol;
    g.font = `900 68px ${FONT}`;
    g.fillText(`${cores} Cores`, x + 20, y + 104);

    g.fillStyle = '#ffffff';
    g.font = `800 26px ${FONT}`;
    g.fillText(platform, x + 20, y + 140);

    g.fillStyle = MUTED;
    g.font = `700 20px ${FONT}`;
    g.fillText(`Display: ${screen} · Load: ${cpuPct}%`, x + 20, y + 170);

    if (gpu) {
      g.fillStyle = '#b0b6cf';
      g.font = `600 18px ${FONT}`;
      const gpuStr = gpu.length > 34 ? gpu.slice(0, 33) + '…' : gpu;
      g.fillText(`GPU: ${gpuStr}`, x + 20, y + 196);
    }

    // Mini activity wave bar
    const barY = y + 225;
    const barW = w - 40;
    const barH = 50;
    g.fillStyle = '#1b1d2e';
    roundRect(g, x + 20, barY, barW, barH, 8);
    g.fill();

    g.beginPath();
    g.moveTo(x + 20, barY + barH);
    const steps = 16;
    for (let i = 0; i <= steps; i++) {
      const px = x + 20 + (i / steps) * barW;
      const hNorm = 0.2 + 0.6 * (Math.sin(i * 0.9 + cores) * 0.5 + 0.5) * (cpuPct / 100);
      const py = barY + barH - hNorm * barH;
      g.lineTo(px, py);
    }
    g.lineTo(x + 20 + barW, barY + barH);
    g.closePath();
    g.fillStyle = loadCol + '44';
    g.fill();
    g.strokeStyle = loadCol;
    g.lineWidth = 2.5;
    g.stroke();
  }

  private drawMemPanel(x: number, y: number, w: number, memGb: number, workers: number, color: string) {
    const g = this.ctx;
    g.fillStyle = '#25283d';
    roundRect(g, x, y, w, 295, 18);
    g.fill();

    g.textAlign = 'left';
    g.fillStyle = MUTED;
    g.font = `800 24px ${FONT}`;
    g.fillText('MEMORY & WORKERS', x + 20, y + 36);

    g.fillStyle = '#4f86f7';
    g.font = `900 68px ${FONT}`;
    g.fillText(`${memGb} GB`, x + 20, y + 104);

    g.fillStyle = '#ffffff';
    g.font = `800 26px ${FONT}`;
    g.fillText(`${workers} Active Worker${workers === 1 ? '' : 's'}`, x + 20, y + 140);

    g.fillStyle = MUTED;
    g.font = `700 20px ${FONT}`;
    g.fillText(`Terminal: Dedicated Local PTY`, x + 20, y + 170);

    // RAM allocation gauge
    const barY = y + 215;
    const barW = w - 40;
    const barH = 22;
    g.fillStyle = '#1b1d2e';
    roundRect(g, x + 20, barY, barW, barH, 11);
    g.fill();

    const usedRatio = Math.min(1, Math.max(0.15, 0.25 + workers * 0.18));
    g.fillStyle = '#4f86f7';
    roundRect(g, x + 20, barY, barW * usedRatio, barH, 11);
    g.fill();

    g.fillStyle = '#ffffff';
    g.font = `800 18px ${FONT}`;
    g.fillText(`${(memGb * usedRatio).toFixed(1)} GB used of ${memGb} GB`, x + 20, y + 265);
  }

  private drawFooter(x: number, y: number, w: number, who: string, workers: number, color: string) {
    const g = this.ctx;
    g.fillStyle = '#212438';
    roundRect(g, x, y, w, 82, 14);
    g.fill();

    g.textAlign = 'left';
    g.font = `800 26px ${FONT}`;
    g.fillStyle = '#ffffff';
    const label = workers > 0
      ? `👷 ${workers} worker${workers === 1 ? '' : 's'} called by ${who} · Runs in ${who}'s terminal only`
      : `🔒 Isolated Terminal: Workers called by ${who} run exclusively on their machine`;
    g.fillText(label.length > 56 ? label.slice(0, 55) + '…' : label, x + 20, y + 50);

    // Pips on the right
    const px = x + w - 30;
    const py = y + 36;
    if (workers > 0) {
      for (let i = 0; i < Math.min(6, workers); i++) {
        g.fillStyle = color || '#06d6a0';
        roundRect(g, px - i * 26, py - 12, 18, 24, 6);
        g.fill();
      }
    } else {
      g.fillStyle = '#06d6a0';
      g.font = `800 22px ${FONT}`;
      g.textAlign = 'right';
      g.fillText('Ready', px, y + 50);
    }
  }

  dispose() {
    this.texture.dispose();
  }
}

