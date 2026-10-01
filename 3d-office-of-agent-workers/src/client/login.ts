export {}; // a module, so its names don't clash with the other pages' scripts

const form = document.getElementById('form') as HTMLFormElement;
const nameRow = document.getElementById('name-row') as HTMLLabelElement;
const nameInput = document.getElementById('name') as HTMLInputElement;
const nameNote = document.getElementById('name-note') as HTMLParagraphElement;
const sub = document.getElementById('sub') as HTMLParagraphElement;
const input = document.getElementById('password') as HTMLInputElement;
const error = document.getElementById('error') as HTMLParagraphElement;
const submit = document.getElementById('submit') as HTMLButtonElement;

const NAME_KEY = 'agent-office.login-name';
/** Where to go once in: the 2D view if that's where you were headed (see loginUrl in net.ts), else the office. */
const NEXT = new URLSearchParams(location.search).get('next') === '/lite' ? '/lite' : '/';
const PROFILE_KEY = 'agent-office.profile';

function saveDisplayName(name: string) {
  if (!name) return;
  try {
    let profile: Record<string, unknown> = {};
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(PROFILE_KEY) ?? 'null');
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) profile = saved as Record<string, unknown>;
    } catch {
      // Start a fresh profile if the saved one is unreadable.
    }
    profile.name = name;
    if (typeof profile.color !== 'string') profile.color = '#4f86f7';
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // storage blocked
  }
}

// A sign-in link from the office's terminal (/login#key=…): it works once, so take it out of the
// address bar and trade it for a session. The key is after the #, so it never reaches a server log.
const linkKey = new URLSearchParams(location.hash.slice(1)).get('key');
if (linkKey) {
  history.replaceState(null, '', location.pathname + location.search);
  void fetch('/api/link', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key: linkKey }) })
    .then(async (res) => {
      if (res.ok) return location.replace(NEXT);
      error.textContent = ((await res.json().catch(() => ({}))) as { error?: string }).error ?? 'Could not sign in';
    })
    .catch(() => void (error.textContent = 'Server unreachable'));
}

// Ask for a name once people have accounts; it's optional while the shared password still works.
void fetch('/api/login', { cache: 'no-store' })
  .then(async (r) => {
    if (!r.ok) throw new Error('Could not load sign-in options');
    return r.json();
  })
  .then(({ accounts, shared }: { accounts: boolean; shared: boolean }) => {
    if (typeof accounts !== 'boolean' || typeof shared !== 'boolean') throw new Error('Invalid sign-in options');
    nameRow.hidden = !accounts && !shared;
    nameInput.required = !shared;
    nameNote.hidden = !shared;
    if (!accounts && shared) {
      sub.textContent = 'Sign in with the shared password and choose your display name.';
      nameNote.textContent = 'Your name is visible to teammates. Use the shared office password below.';
      nameInput.placeholder = 'Name teammates will see';
    } else if (accounts && shared) {
      sub.textContent = 'Sign in with your account, or use the shared office password.';
      nameNote.textContent = 'For shared access, use a display name that is not an account name, or leave this blank.';
      nameInput.placeholder = 'Account name or display name';
    } else {
      sub.textContent = 'Sign in with your own account.';
      nameInput.placeholder = 'Account name';
    }
    try {
      nameInput.value = localStorage.getItem(NAME_KEY) ?? '';
    } catch {
      // storage blocked
    }
    (nameInput.value ? input : nameInput).focus();
    submit.disabled = false;
  })
  .catch(() => {
    nameRow.hidden = false;
    nameInput.required = false;
    nameNote.hidden = false;
    nameInput.placeholder = 'Account name or display name';
    nameNote.textContent = 'Sign-in options could not load. Leave your name blank to try the shared password.';
    sub.textContent = 'Enter your sign-in details to continue.';
    error.textContent = 'Could not load sign-in options. Check the connection and try again.';
    submit.disabled = false;
  });

for (const field of [nameInput, input]) field.addEventListener('input', () => (error.textContent = ''));

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  error.textContent = '';
  submit.disabled = true;
  const buttonText = submit.textContent ?? 'Sign in';
  submit.textContent = 'Signing in…';
  const name = nameRow.hidden ? '' : nameInput.value.trim();
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, password: input.value }),
    });
    if (res.ok) {
      try {
        localStorage.setItem(NAME_KEY, name);
      } catch {
        // storage blocked
      }
      saveDisplayName(name);
      location.href = NEXT;
      return;
    }
    const body = await res.json().catch(() => ({}));
    error.textContent = body.error ?? 'Could not sign in';
    input.select();
  } catch {
    error.textContent = 'Server unreachable';
  } finally {
    submit.disabled = false;
    submit.textContent = buttonText;
  }
});
