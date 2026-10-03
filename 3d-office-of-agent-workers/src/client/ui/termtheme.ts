// The terminals' colors: in a terminal window (ui/terminal.ts), and on the laptops at the desks (world/laptop.ts).

export type TerminalThemeId =
  | 'midnight'
  | 'one-dark'
  | 'tokyo-night'
  | 'monokai'
  | 'solarized-dark'
  | 'high-contrast'
  | 'github-light'
  | 'solarized-light';

export interface TerminalTheme {
  id: TerminalThemeId;
  name: string;
  background: string;
  foreground: string;
  cursor: string;
  selectionBackground: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
}

export const TERMINAL_THEMES: Record<TerminalThemeId, TerminalTheme> = {
  midnight: {
    id: 'midnight',
    name: 'Midnight (Default)',
    background: '#1e1f2e',
    foreground: '#e6e6f0',
    cursor: '#ffd166',
    selectionBackground: '#44475a',
    black: '#282a36',
    red: '#ff5c7a',
    green: '#7cf29a',
    yellow: '#ffd166',
    blue: '#6cb6ff',
    magenta: '#d69cff',
    cyan: '#72ddf7',
    white: '#e6e6f0',
    brightBlack: '#6c7086',
    brightRed: '#ff8fa3',
    brightGreen: '#a6f4b8',
    brightYellow: '#ffe29a',
    brightBlue: '#9ccfff',
    brightMagenta: '#e5c1ff',
    brightCyan: '#a5ecfb',
    brightWhite: '#ffffff',
  },
  'one-dark': {
    id: 'one-dark',
    name: 'One Dark',
    background: '#282c34',
    foreground: '#abb2bf',
    cursor: '#528bff',
    selectionBackground: '#3e4451',
    black: '#1e2127',
    red: '#e06c75',
    green: '#98c379',
    yellow: '#e5c07b',
    blue: '#61afef',
    magenta: '#c678dd',
    cyan: '#56b6c2',
    white: '#abb2bf',
    brightBlack: '#5c6370',
    brightRed: '#be5046',
    brightGreen: '#98c379',
    brightYellow: '#d19a66',
    brightBlue: '#61afef',
    brightMagenta: '#c678dd',
    brightCyan: '#56b6c2',
    brightWhite: '#ffffff',
  },
  'tokyo-night': {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    background: '#1a1b26',
    foreground: '#a9b1d6',
    cursor: '#c0caf5',
    selectionBackground: '#283457',
    black: '#15161e',
    red: '#f7768e',
    green: '#9ece6a',
    yellow: '#e0af68',
    blue: '#7aa2f7',
    magenta: '#bb9af7',
    cyan: '#7dcfff',
    white: '#a9b1d6',
    brightBlack: '#414868',
    brightRed: '#f7768e',
    brightGreen: '#9ece6a',
    brightYellow: '#e0af68',
    brightBlue: '#7aa2f7',
    brightMagenta: '#bb9af7',
    brightCyan: '#7dcfff',
    brightWhite: '#c0caf5',
  },
  monokai: {
    id: 'monokai',
    name: 'Monokai',
    background: '#272822',
    foreground: '#f8f8f2',
    cursor: '#f8f8f0',
    selectionBackground: '#49483e',
    black: '#272822',
    red: '#f92672',
    green: '#a6e22e',
    yellow: '#f4bf75',
    blue: '#66d9ef',
    magenta: '#ae81ff',
    cyan: '#a1efe4',
    white: '#f8f8f2',
    brightBlack: '#75715e',
    brightRed: '#f92672',
    brightGreen: '#a6e22e',
    brightYellow: '#f4bf75',
    brightBlue: '#66d9ef',
    brightMagenta: '#ae81ff',
    brightCyan: '#a1efe4',
    brightWhite: '#f9f8f5',
  },
  'solarized-dark': {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    background: '#002b36',
    foreground: '#839496',
    cursor: '#93a1a1',
    selectionBackground: '#073642',
    black: '#073642',
    red: '#dc322f',
    green: '#859900',
    yellow: '#b58900',
    blue: '#268bd2',
    magenta: '#d33682',
    cyan: '#2aa198',
    white: '#eee8d5',
    brightBlack: '#002b36',
    brightRed: '#cb4b16',
    brightGreen: '#586e75',
    brightYellow: '#657b83',
    brightBlue: '#839496',
    brightMagenta: '#6c71c4',
    brightCyan: '#93a1a1',
    brightWhite: '#fdf6e3',
  },
  'high-contrast': {
    id: 'high-contrast',
    name: 'High Contrast Black',
    background: '#000000',
    foreground: '#ffffff',
    cursor: '#ffff00',
    selectionBackground: '#333333',
    black: '#222222',
    red: '#ff4444',
    green: '#44ff44',
    yellow: '#ffff44',
    blue: '#4488ff',
    magenta: '#ff44ff',
    cyan: '#44ffff',
    white: '#ffffff',
    brightBlack: '#666666',
    brightRed: '#ff7777',
    brightGreen: '#77ff77',
    brightYellow: '#ffff77',
    brightBlue: '#77aaff',
    brightMagenta: '#ff77ff',
    brightCyan: '#77ffff',
    brightWhite: '#ffffff',
  },
  'github-light': {
    id: 'github-light',
    name: 'GitHub Light',
    background: '#ffffff',
    foreground: '#24292f',
    cursor: '#044289',
    selectionBackground: '#b6e3ff',
    black: '#24292e',
    red: '#cf222e',
    green: '#116329',
    yellow: '#9a6700',
    blue: '#0969da',
    magenta: '#8250df',
    cyan: '#1b7c83',
    white: '#6e7781',
    brightBlack: '#57606a',
    brightRed: '#a40e26',
    brightGreen: '#1a7f37',
    brightYellow: '#633c01',
    brightBlue: '#218bff',
    brightMagenta: '#a475f9',
    brightCyan: '#3192aa',
    brightWhite: '#8c959f',
  },
  'solarized-light': {
    id: 'solarized-light',
    name: 'Solarized Light',
    background: '#fdf6e3',
    foreground: '#657b83',
    cursor: '#586e75',
    selectionBackground: '#eee8d5',
    black: '#073642',
    red: '#dc322f',
    green: '#859900',
    yellow: '#b58900',
    blue: '#268bd2',
    magenta: '#d33682',
    cyan: '#2aa198',
    white: '#eee8d5',
    brightBlack: '#002b36',
    brightRed: '#cb4b16',
    brightGreen: '#586e75',
    brightYellow: '#657b83',
    brightBlue: '#839496',
    brightMagenta: '#6c71c4',
    brightCyan: '#93a1a1',
    brightWhite: '#fdf6e3',
  },
};

export const TERMINAL_THEME_CHOICES: { id: TerminalThemeId; label: string; description: string }[] = [
  { id: 'midnight', label: 'Midnight (Default)', description: 'Dark blue-purple palette with pastel accents' },
  { id: 'one-dark', label: 'One Dark', description: 'Balanced dark gray palette' },
  { id: 'tokyo-night', label: 'Tokyo Night', description: 'Crisp deep navy palette with neon accents' },
  { id: 'monokai', label: 'Monokai', description: 'Dark olive charcoal with vivid syntax colors' },
  { id: 'solarized-dark', label: 'Solarized Dark', description: 'Deep teal palette tuned for terminal contrast' },
  { id: 'high-contrast', label: 'High Contrast Black', description: 'Pure black background with vivid bright text' },
  { id: 'github-light', label: 'GitHub Light', description: 'Clean white background for dark text readability' },
  { id: 'solarized-light', label: 'Solarized Light', description: 'Warm off-white background with solarized accents' },
];

export const TERM_THEME: TerminalTheme = { ...TERMINAL_THEMES.midnight };

const THEME_KEY = 'agent-office.term-theme';

export function loadTerminalTheme(): TerminalThemeId {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved && saved in TERMINAL_THEMES) return saved as TerminalThemeId;
    }
  } catch {
    // storage blocked
  }
  return 'midnight';
}

type ThemeListener = (theme: TerminalTheme) => void;
const listeners = new Set<ThemeListener>();

export function onTerminalThemeChange(fn: ThemeListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setTerminalTheme(id: TerminalThemeId): TerminalTheme {
  const theme = TERMINAL_THEMES[id] ?? TERMINAL_THEMES.midnight;
  Object.assign(TERM_THEME, theme);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_KEY, theme.id);
    }
  } catch {
    // storage blocked
  }
  for (const fn of listeners) {
    try {
      fn(TERM_THEME);
    } catch {
      // ignore listener error
    }
  }
  return TERM_THEME;
}

export function getPalette(theme: TerminalTheme): string[] {
  const base16 = [
    theme.black, theme.red, theme.green, theme.yellow, theme.blue, theme.magenta, theme.cyan, theme.white,
    theme.brightBlack, theme.brightRed, theme.brightGreen, theme.brightYellow, theme.brightBlue, theme.brightMagenta, theme.brightCyan, theme.brightWhite,
  ];
  const p = [...base16];
  const steps = [0, 95, 135, 175, 215, 255];
  for (let r = 0; r < 6; r++) for (let g = 0; g < 6; g++) for (let b = 0; b < 6; b++) p.push(`rgb(${steps[r]},${steps[g]},${steps[b]})`);
  for (let i = 0; i < 24; i++) {
    const v = 8 + i * 10;
    p.push(`rgb(${v},${v},${v})`);
  }
  return p;
}

setTerminalTheme(loadTerminalTheme());
