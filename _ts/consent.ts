// Asks before loading anything that sets cookies: Google Analytics, through a
// banner, and Disqus comments, through a button where they go. The choices are
// kept in localStorage rather than a cookie, so asking sets no cookie itself.
// `npm run build` compiles it to js/consent.js.

export type Choice = 'granted' | 'denied';

export interface Consent {
  analytics?: Choice;
  comments?: Choice;
}

export const STORAGE_KEY = 'cookie-consent';
const DISQUS_PRIVACY = 'https://disqus.com/privacy-policy/';

declare global {
  interface Window {
    dataLayer?: unknown[];
    [disableKey: `ga-disable-${string}`]: boolean | undefined;
  }
}

function isChoice(value: unknown): value is Choice {
  return value === 'granted' || value === 'denied';
}

// Storage can be missing or throw, as in some private windows, so every failure
// counts as no choice: the site then asks again and loads nothing.
export function readConsent(storage: Storage | null): Consent {
  try {
    const saved: unknown = JSON.parse(storage?.getItem(STORAGE_KEY) ?? '{}');
    if (typeof saved !== 'object' || saved === null) return {};
    const { analytics, comments } = saved as Record<string, unknown>;
    return {
      ...(isChoice(analytics) && { analytics }),
      ...(isChoice(comments) && { comments }),
    };
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

// What Chirpy's analytics/google.html did on every page, now only after consent
export function loadAnalytics(id: string, doc: Document = document): void {
  window[`ga-disable-${id}`] = false;
  window.dataLayer = window.dataLayer || [];
  // gtag.js reads the arguments object itself, not an array
  function gtag(..._: unknown[]) {
    window.dataLayer!.push(arguments);
  }
  // Accepting again after refusing on the same page counts the page again
  if (doc.querySelector('script[data-google-analytics]')) {
    gtag('config', id);
    return;
  }
  gtag('js', new Date());
  gtag('config', id);

  const script = doc.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  script.dataset.googleAnalytics = '';
  doc.head.append(script);
}

// Turns Analytics off on a page where it already loaded, and deletes its cookies.
// Google sets them on the widest domain it can, so each parent domain is tried.
export function stopAnalytics(id: string, doc: Document = document): void {
  window[`ga-disable-${id}`] = true;
  const names = doc.cookie
    .split(';')
    .map((cookie) => cookie.split('=')[0].trim())
    .filter((name) => name === '_ga' || name.startsWith('_ga_') || name === '_gid');
  const parts = doc.location.hostname.split('.');
  const domains = [''];
  for (let i = 0; i < parts.length - 1; i++) {
    domains.push(`; domain=.${parts.slice(i).join('.')}`);
  }
  for (const name of names) {
    for (const domain of domains) {
      doc.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
    }
  }
}

interface Settings {
  storage: Storage | null;
  analyticsId?: string;
  privacyUrl?: string;
  doc?: Document;
}

export function setUp({
  storage,
  analyticsId,
  privacyUrl = '/pages/privacy-policy/',
  doc = document,
}: Settings): void {
  let consent = readConsent(storage);
  let banner: HTMLElement | null = null;
  let opener: HTMLElement | null = null;

  function save(change: Consent) {
    consent = { ...consent, ...change };
    writeConsent(storage, consent);
  }

  function closeBanner() {
    banner?.remove();
    banner = null;
    // Back to the button that opened it, or keyboard users lose their place
    opener?.focus();
    opener = null;
  }

  function chooseAnalytics(choice: Choice) {
    save({ analytics: choice });
    if (analyticsId) {
      if (choice === 'granted') loadAnalytics(analyticsId, doc);
      else stopAnalytics(analyticsId, doc);
    }
    closeBanner();
  }

  function button(text: string, onClick: () => void): HTMLButtonElement {
    const element = doc.createElement('button');
    element.type = 'button';
    element.className = 'consent-button';
    element.textContent = text;
    element.addEventListener('click', onClick);
    return element;
  }

  function actions(...buttons: HTMLButtonElement[]): HTMLDivElement {
    const row = doc.createElement('div');
    row.className = 'consent-actions';
    row.append(...buttons);
    return row;
  }

  function openBanner(from?: HTMLElement) {
    if (banner) {
      banner.focus();
      return;
    }
    opener = from ?? null;
    banner = doc.createElement('section');
    banner.className = 'consent-banner';
    banner.setAttribute('aria-label', 'Cookie choices');
    banner.tabIndex = -1;

    const question = doc.createElement('p');
    question.append(
      analyticsId
        ? 'Can this site use Google Analytics to count visits? Google sets cookies only if you accept. '
        : 'This site asks before loading anything that sets cookies. ',
    );
    const policy = doc.createElement('a');
    policy.href = privacyUrl;
    policy.textContent = 'Privacy policy';
    question.append(policy);
    banner.append(question);

    if (analyticsId) {
      if (consent.analytics) {
        const current = doc.createElement('p');
        current.className = 'consent-current';
        current.textContent =
          consent.analytics === 'granted' ? 'You have accepted.' : 'You have refused.';
        banner.append(current);
      }
      banner.append(
        actions(
          button('Accept', () => chooseAnalytics('granted')),
          button('Refuse', () => chooseAnalytics('denied')),
        ),
      );
    }

    if (consent.comments === 'granted') {
      const comments = doc.createElement('p');
      comments.className = 'consent-current';
      comments.textContent =
        'Disqus comments load on their own, which lets Disqus set cookies. ';
      banner.append(
        comments,
        actions(
          button('Ask before loading comments', () => {
            save({ comments: 'denied' });
            closeBanner();
          }),
        ),
      );
    }

    // Opened from a settings button with nothing to change
    if (!analyticsId && consent.comments !== 'granted') {
      banner.append(actions(button('Close', closeBanner)));
    }

    banner.addEventListener('keydown', (event) => {
      // Escape only closes a banner someone opened, not the first one, which
      // needs an answer
      if (event.key === 'Escape' && opener) closeBanner();
    });
    doc.body.append(banner);
    if (from) banner.focus();
  }

  for (const settings of doc.querySelectorAll<HTMLElement>('[data-consent-settings]')) {
    settings.hidden = false;
    settings.addEventListener('click', (event) => {
      event.preventDefault();
      openBanner(settings);
    });
  }

  if (analyticsId) {
    if (consent.analytics === 'granted') loadAnalytics(analyticsId, doc);
    else if (!consent.analytics) openBanner();
  }

  const thread = doc.querySelector<HTMLElement>('#disqus_thread[data-src]');
  if (thread) setUpComments(thread);

  function setUpComments(thread: HTMLElement) {
    const src = thread.dataset.src!;
    const load = () => {
      placeholder?.remove();
      const script = doc.createElement('script');
      script.src = src;
      script.dataset.timestamp = String(Date.now());
      (doc.head || doc.body).append(script);
    };

    let placeholder: HTMLElement | null = null;
    if (consent.comments === 'granted') {
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

    placeholder = doc.createElement('div');
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

    const loadButton = button('Load comments', () => {
      if (remember.checked) save({ comments: 'granted' });
      load();
    });
    placeholder.append(text, actions(loadButton), rememberRow);
    thread.append(placeholder);
  }
}

// Tests import the functions above without the script tag on the page
const script = document.querySelector<HTMLScriptElement>('script#consent-script');
if (script) {
  setUp({
    storage: localStorageOrNull(),
    analyticsId: script.dataset.gaId || undefined,
    privacyUrl: script.dataset.privacyUrl,
  });
}
