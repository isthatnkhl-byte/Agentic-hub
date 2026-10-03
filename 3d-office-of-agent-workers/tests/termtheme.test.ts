import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TERMINAL_THEMES,
  TERMINAL_THEME_CHOICES,
  TERM_THEME,
  setTerminalTheme,
  onTerminalThemeChange,
  getPalette,
  type TerminalThemeId,
} from '../src/client/ui/termtheme.js';

test('defines all expected terminal themes in TERMINAL_THEMES and TERMINAL_THEME_CHOICES', () => {
  const expectedThemes: TerminalThemeId[] = [
    'midnight',
    'one-dark',
    'tokyo-night',
    'monokai',
    'solarized-dark',
    'high-contrast',
    'github-light',
    'solarized-light',
  ];

  for (const id of expectedThemes) {
    assert.ok(id in TERMINAL_THEMES, `theme ${id} should exist in TERMINAL_THEMES`);
    const theme = TERMINAL_THEMES[id];
    assert.equal(theme.id, id);
    assert.ok(theme.background.startsWith('#'), `${id} background should be hex color`);
    assert.ok(theme.foreground.startsWith('#'), `${id} foreground should be hex color`);
    assert.ok(theme.cursor.startsWith('#'), `${id} cursor should be hex color`);
    assert.ok(theme.black.startsWith('#'), `${id} black should be hex color`);
    assert.ok(theme.white.startsWith('#'), `${id} white should be hex color`);
  }

  const choiceIds = TERMINAL_THEME_CHOICES.map((c) => c.id);
  assert.deepEqual(choiceIds, expectedThemes);
});

test('high contrast and light themes provide distinct backgrounds for reading output', () => {
  assert.equal(TERMINAL_THEMES['high-contrast'].background, '#000000');
  assert.equal(TERMINAL_THEMES['high-contrast'].foreground, '#ffffff');

  assert.equal(TERMINAL_THEMES['github-light'].background, '#ffffff');
  assert.equal(TERMINAL_THEMES['github-light'].foreground, '#24292f');

  assert.equal(TERMINAL_THEMES['solarized-light'].background, '#fdf6e3');
});

test('setTerminalTheme updates TERM_THEME and notifies subscribers', () => {
  const notifications: string[] = [];
  const off = onTerminalThemeChange((t) => {
    notifications.push(t.id);
  });

  const updated = setTerminalTheme('github-light');
  assert.equal(updated.id, 'github-light');
  assert.equal(TERM_THEME.id, 'github-light');
  assert.equal(TERM_THEME.background, '#ffffff');
  assert.deepEqual(notifications, ['github-light']);

  // Changing to another theme
  setTerminalTheme('tokyo-night');
  assert.equal(TERM_THEME.id, 'tokyo-night');
  assert.deepEqual(notifications, ['github-light', 'tokyo-night']);

  // Unsubscribe stops notifications
  off();
  setTerminalTheme('midnight');
  assert.equal(TERM_THEME.id, 'midnight');
  assert.deepEqual(notifications, ['github-light', 'tokyo-night'], 'unsubscribed listener should not fire');
});

test('setTerminalTheme gracefully handles unknown theme ID by falling back to midnight', () => {
  const fallback = setTerminalTheme('non-existent-theme' as unknown as TerminalThemeId);
  assert.equal(fallback.id, 'midnight');
  assert.equal(TERM_THEME.id, 'midnight');
});

test('getPalette computes 256 colors reflecting the active theme base colors', () => {
  const palette = getPalette(TERMINAL_THEMES['github-light']);
  assert.equal(palette.length, 256, 'palette must contain 256 colors');
  assert.equal(palette[0], TERMINAL_THEMES['github-light'].black);
  assert.equal(palette[1], TERMINAL_THEMES['github-light'].red);
  assert.equal(palette[7], TERMINAL_THEMES['github-light'].white);
  assert.equal(palette[8], TERMINAL_THEMES['github-light'].brightBlack);
  assert.equal(palette[15], TERMINAL_THEMES['github-light'].brightWhite);

  // Colors 16-231 should be 6x6x6 RGB cube
  assert.equal(palette[16], 'rgb(0,0,0)');
  assert.equal(palette[231], 'rgb(255,255,255)');

  // Colors 232-255 should be grayscale ramp
  assert.equal(palette[232], 'rgb(8,8,8)');
  assert.equal(palette[255], 'rgb(238,238,238)');
});
