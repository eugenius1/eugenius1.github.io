// Asks before loading Disqus comments, which set cookies and track visitors: a
// "Load comments" button sits where they go. The choice to always load them is
// kept in localStorage rather than a cookie, so asking sets no cookie itself.
// `npm run build` compiles it to js/consent.js.

export type Choice = 'granted' | 'denied';

export interface Consent {
  comments?: Choice;
}

export const STORAGE_KEY = 'cookie-consent';
const DISQUS_PRIVACY = 'https://disqus.com/privacy-policy/';

function isChoice(value: unknown): value is Choice {
  return value === 'granted' || value === 'denied';
}

// Storage can be missing or throw, as in some private windows, so every failure
// counts as no choice: the site then asks again and loads nothing.
export function readConsent(storage: Storage | null): Consent {
  try {
    const saved: unknown = JSON.parse(storage?.getItem(STORAGE_KEY) ?? '{}');
    if (typeof saved !== 'object' || saved === null) return {};
    const { comments } = saved as Record<string, unknown>;
    return isChoice(comments) ? { comments } : {};
  } catch {
    return {};
  }
}

// Says whether the choice was stored, so the page doesn't promise what it can't keep
export function writeConsent(storage: Storage | null, consent: Consent): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(consent));
    return true;
  } catch {
    return false;
  }
}

function localStorageOrNull(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

interface Settings {
  storage: Storage | null;
  doc?: Document;
}

export function setUp({ storage, doc = document }: Settings): void {
  const thread = doc.querySelector<HTMLElement>('#disqus_thread[data-src]');
  if (!thread) return;
  const src = thread.dataset.src!;

  function button(text: string, className: string, onClick: () => void) {
    const element = doc.createElement('button');
    element.type = 'button';
    element.className = className;
    element.textContent = text;
    element.addEventListener('click', onClick);
    return element;
  }

  function load() {
    const script = doc.createElement('script');
    script.src = src;
    script.dataset.timestamp = String(Date.now());
    // Blocked or offline: ask again, rather than leave an empty space
    script.addEventListener('error', () => {
      script.remove();
      showPlaceholder("The comments couldn't load. ");
    });
    (doc.head || doc.body).append(script);
  }

  // Below the comments, as Disqus replaces what's inside the thread
  function showUndo() {
    if (thread!.nextElementSibling?.classList.contains('consent-undo')) return;
    const undo = doc.createElement('p');
    undo.className = 'consent-remember consent-undo';
    // Announced, and keeps keyboard focus, once the button it replaces is gone
    undo.setAttribute('role', 'status');
    undo.tabIndex = -1;
    const ask = button('Ask before loading comments', 'consent-link-button', () => {
      undo.textContent = writeConsent(storage, { comments: 'denied' })
        ? 'Comments will wait for a click from the next page on.'
        : "Your browser didn't let the site save this, so comments may still load on their own.";
      undo.focus();
    });
    undo.append(ask);
    thread!.after(undo);
  }

  function showPlaceholder(problem = '') {
    const placeholder = doc.createElement('div');
    placeholder.className = 'consent-comments';
    const text = doc.createElement('p');
    text.append(problem, 'The comments are on Disqus, which sets cookies and tracks visitors. See ');
    const link = doc.createElement('a');
    link.href = DISQUS_PRIVACY;
    link.textContent = "Disqus's privacy policy";
    text.append(link, '.');

    const remember = doc.createElement('input');
    remember.type = 'checkbox';
    remember.id = 'consent-comments-always';
    const label = doc.createElement('label');
    label.htmlFor = remember.id;
    label.textContent = 'Always load comments';
    const rememberRow = doc.createElement('p');
    rememberRow.className = 'consent-remember';
    rememberRow.append(remember, ' ', label);

    const loadButton = button('Load comments', 'consent-button', () => {
      if (remember.checked && writeConsent(storage, { comments: 'granted' })) showUndo();
      placeholder.remove();
      // The button is gone, so keyboard users carry on from the comments
      thread!.tabIndex = -1;
      thread!.focus();
      load();
    });
    // The box before the button, as clicking the button removes both
    placeholder.append(text, rememberRow, loadButton);
    thread!.append(placeholder);
  }

  if (readConsent(storage).comments !== 'granted') {
    showPlaceholder();
    return;
  }

  showUndo();
  // As the theme did: only once the comments are about to scroll into view
  if (typeof IntersectionObserver === 'undefined') {
    load();
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      observer.disconnect();
      load();
    }
  });
  observer.observe(thread);
}

// Tests import the functions above without the script tag on the page
if (document.querySelector('script#consent-script')) {
  setUp({ storage: localStorageOrNull() });
}
