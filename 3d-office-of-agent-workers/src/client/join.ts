export {}; // a module, so its names don't clash with the other pages' scripts

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const urlParams = new URLSearchParams(location.search);
const inviteHash = location.hash.slice(1);
const codeOrToken = inviteHash || urlParams.get('code') || '';
if (inviteHash) history.replaceState(null, '', location.pathname + location.search);

const form = $<HTMLFormElement>('form');
const codeInput = $<HTMLInputElement>('code');
const nameInput = $<HTMLInputElement>('name');
const passwordInput = $<HTMLInputElement>('password');
const passwordLabel = $('pwd-label');
const passwordNote = $('password-note');
const submitBtn = $<HTMLButtonElement>('submit');
const errorEl = $('error');
let checkedCode = '';
let joinKind: 'room' | 'account' | undefined;

if (codeOrToken) {
  codeInput.value = codeOrToken;
}

try {
  const savedName = localStorage.getItem('agent-office.login-name') || '';
  if (savedName && !nameInput.value) nameInput.value = savedName;
} catch {
  // storage blocked
}

async function post(body: Record<string, unknown>): Promise<{ ok: boolean; body: any }> {
  const res = await fetch('/api/join', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { ok: res.ok, body: await res.json().catch(() => ({})) };
}

async function checkCode(val: string): Promise<boolean> {
  if (!val) return false;
  errorEl.textContent = '';
  try {
    const r = await post({ token: val, code: val, peek: true });
    if (!r.ok) {
      errorEl.textContent = r.body.error ?? 'Invalid room code or invite link';
      return false;
    }
    const { name: invited, role, by, project, roomCode } = r.body;
    joinKind = roomCode ? 'room' : 'account';
    checkedCode = val;
    $('title').textContent = roomCode ? `Join ${project} (${roomCode})` : `Join the ${project} office`;
    $('sub').textContent = roomCode
      ? `Step into the 3D office to work on ${project} with your team.`
      : `${by} invited you${role === 'admin' ? ' as an admin' : ''}. Enter your name to come in.`;
    if (invited) {
      nameInput.value = invited;
      nameInput.readOnly = true;
    } else {
      nameInput.readOnly = false;
    }
    passwordInput.required = !roomCode;
    passwordLabel.textContent = roomCode ? 'Account password (optional)' : 'Create account password';
    passwordInput.placeholder = roomCode ? 'Leave blank for guest access' : 'At least 8 characters';
    passwordNote.hidden = false;
    passwordNote.textContent = roomCode
      ? 'Leave blank to join as a guest. Choose a password to create an account you can sign into later.'
      : 'This invite creates an account. Choose a password of at least 8 characters.';
    (invited ? passwordInput : nameInput).focus();
    return true;
  } catch {
    errorEl.textContent = 'Could not check that code. Check your connection and try again.';
    return false;
  }
}

codeInput.addEventListener('input', () => {
  if (codeInput.value.trim() === checkedCode) return;
  checkedCode = '';
  joinKind = undefined;
  passwordInput.required = false;
  passwordNote.hidden = true;
  nameInput.readOnly = false;
  errorEl.textContent = '';
});
for (const field of [nameInput, passwordInput]) field.addEventListener('input', () => (errorEl.textContent = ''));

if (codeOrToken) {
  void checkCode(codeOrToken);
} else {
  codeInput.focus();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';
  const currentCode = codeInput.value.trim();
  let currentName = nameInput.value.trim();
  const currentPass = passwordInput.value;

  if (!currentCode) {
    errorEl.textContent = 'Please enter a Room Code or invite token';
    codeInput.focus();
    return;
  }
  if (checkedCode !== currentCode && !(await checkCode(currentCode))) return;
  currentName = nameInput.value.trim();
  if (!currentName) {
    errorEl.textContent = 'Please enter your name';
    nameInput.focus();
    return;
  }
  if (joinKind === 'account' && currentPass.length < 8) {
    errorEl.textContent = 'Choose a password of at least 8 characters';
    passwordInput.focus();
    return;
  }
  if (currentPass && currentPass.length < 8) {
    errorEl.textContent = 'Use at least 8 characters, or leave the password blank for guest access';
    passwordInput.focus();
    return;
  }

  submitBtn.disabled = true;
  try {
    const r = await post({
      token: currentCode,
      code: currentCode,
      name: currentName,
      password: currentPass,
    });
    if (!r.ok) {
      errorEl.textContent = r.body.error ?? 'Could not join room';
      return;
    }
    try {
      localStorage.setItem('agent-office.login-name', r.body.name || currentName);
    } catch {
      // storage blocked
    }
    location.replace('/');
  } catch {
    errorEl.textContent = 'Server unreachable';
  } finally {
    submitBtn.disabled = false;
  }
});
