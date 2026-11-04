// Asks before loading Disqus comments, which set cookies and track visitors: a
// "Load comments" button sits where they go. The choice to always load them is
// kept in localStorage rather than a cookie, so asking sets no cookie itself.
// `npm run build` compiles it to assets/js/consent.js.

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

export function writeConsent(storage: Storage | null, consent: Consent): void {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // The choice then lasts for this page only
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
  const consent = readConsent(storage);

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
    (doc.head || doc.body).append(script);
  }

  if (consent.comments === 'granted') {
    // Below the comments, as Disqus replaces what's inside the thread
    const undo = doc.createElement('p');
    undo.className = 'consent-remember';
    // Announced, and keeps keyboard focus, once the button it replaces is gone
    undo.setAttribute('role', 'status');
    undo.tabIndex = -1;
    const ask = button('Ask before loading comments', 'consent-link-button', () => {
      writeConsent(storage, { comments: 'denied' });
      undo.textContent = 'Comments will wait for a click from the next page on.';
      undo.focus();
    });
    undo.append(ask);
    thread.after(undo);

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
    return;
  }

  const placeholder = doc.createElement('div');
  placeholder.className = 'consent-comments';
  const text = doc.createElement('p');
  text.append('The comments are on Disqus, which sets cookies and tracks visitors. See ');
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
    if (remember.checked) writeConsent(storage, { comments: 'granted' });
    placeholder.remove();
    // The button is gone, so keyboard users carry on from the comments
    thread.tabIndex = -1;
    thread.focus();
    load();
  });
  // The box before the button, as clicking the button removes both
  placeholder.append(text, rememberRow, loadButton);
  thread.append(placeholder);
}

// Tests import the functions above without the script tag on the page
if (document.querySelector('script#consent-script')) {
  setUp({ storage: localStorageOrNull() });
}
