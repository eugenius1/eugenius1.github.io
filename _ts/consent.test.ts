// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  STORAGE_KEY,
  loadAnalytics,
  readConsent,
  setUp,
  stopAnalytics,
  writeConsent,
} from './consent';

const ID = 'G-TEST';

function analyticsScripts() {
  return document.querySelectorAll('script[data-google-analytics]');
}

function banner() {
  return document.querySelector<HTMLElement>('.consent-banner');
}

function buttonNamed(text: string, within: ParentNode = document) {
  const found = [...within.querySelectorAll('button')].find((b) => b.textContent === text);
  if (!found) throw new Error(`No button "${text}"`);
  return found;
}

beforeEach(() => {
  localStorage.clear();
  document.head.innerHTML = '';
  document.body.innerHTML = '';
  delete window.dataLayer;
  delete window[`ga-disable-${ID}`];
});

afterEach(() => {
  vi.unstubAllGlobals();
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim();
    if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
});

describe('stored choices', () => {
  it('reads back what was written', () => {
    writeConsent(localStorage, { analytics: 'granted', comments: 'denied' });
    expect(readConsent(localStorage)).toEqual({ analytics: 'granted', comments: 'denied' });
  });

  it('treats nothing, junk and unknown values as no choice', () => {
    expect(readConsent(localStorage)).toEqual({});
    localStorage.setItem(STORAGE_KEY, 'not json');
    expect(readConsent(localStorage)).toEqual({});
    localStorage.setItem(STORAGE_KEY, '{"analytics":"yes","comments":"denied"}');
    expect(readConsent(localStorage)).toEqual({ comments: 'denied' });
    expect(readConsent(null)).toEqual({});
  });

  it('survives storage that throws', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    } as unknown as Storage;
    expect(readConsent(broken)).toEqual({});
    expect(() => writeConsent(broken, { analytics: 'denied' })).not.toThrow();
  });

  it('sets no cookie', () => {
    setUp({ storage: localStorage, analyticsId: ID });
    buttonNamed('Refuse').click();
    expect(document.cookie).toBe('');
  });
});

describe('Google Analytics', () => {
  it('asks first, and loads nothing until then', () => {
    setUp({ storage: localStorage, analyticsId: ID });
    expect(banner()).not.toBeNull();
    expect(analyticsScripts()).toHaveLength(0);
    expect(window.dataLayer).toBeUndefined();
  });

  it('loads once accepted, and remembers it', () => {
    setUp({ storage: localStorage, analyticsId: ID });
    buttonNamed('Accept').click();
    expect(banner()).toBeNull();
    expect(analyticsScripts()).toHaveLength(1);
    expect((analyticsScripts()[0] as HTMLScriptElement).src).toBe(
      `https://www.googletagmanager.com/gtag/js?id=${ID}`,
    );
    expect(readConsent(localStorage)).toEqual({ analytics: 'granted' });

    // The next page loads it straight away, without asking
    document.head.innerHTML = '';
    setUp({ storage: localStorage, analyticsId: ID });
    expect(banner()).toBeNull();
    expect(analyticsScripts()).toHaveLength(1);
  });

  it('stays off once refused, and remembers it', () => {
    setUp({ storage: localStorage, analyticsId: ID });
    buttonNamed('Refuse').click();
    expect(banner()).toBeNull();
    expect(analyticsScripts()).toHaveLength(0);

    setUp({ storage: localStorage, analyticsId: ID });
    expect(banner()).toBeNull();
    expect(analyticsScripts()).toHaveLength(0);
  });

  it('queues gtag calls as arguments objects, as gtag.js expects', () => {
    loadAnalytics(ID);
    expect(window.dataLayer).toHaveLength(2);
    const config = window.dataLayer![1] as IArguments;
    expect(Array.isArray(config)).toBe(false);
    expect([...config]).toEqual(['config', ID]);
  });

  it('adds the script only once', () => {
    loadAnalytics(ID);
    loadAnalytics(ID);
    expect(analyticsScripts()).toHaveLength(1);
  });

  it('turns off and deletes its cookies when stopped', () => {
    loadAnalytics(ID);
    document.cookie = '_ga=GA1.1.1; path=/';
    document.cookie = '_ga_TEST=GS1.1; path=/';
    document.cookie = 'other=1; path=/';
    stopAnalytics(ID);
    expect(window[`ga-disable-${ID}`]).toBe(true);
    expect(document.cookie).toBe('other=1');

    // Accepting again turns it back on, and counts the page again
    loadAnalytics(ID);
    expect(window[`ga-disable-${ID}`]).toBe(false);
    expect(analyticsScripts()).toHaveLength(1);
    expect([...(window.dataLayer!.at(-1) as IArguments)]).toEqual(['config', ID]);
    expect(window.dataLayer).toHaveLength(3);
  });

  it('asks about nothing without an Analytics id, as in development', () => {
    setUp({ storage: localStorage });
    expect(banner()).toBeNull();
  });
});

describe('changing your mind', () => {
  function addSettingsLink() {
    const link = document.createElement('button');
    link.dataset.consentSettings = '';
    link.hidden = true;
    document.body.append(link);
    return link;
  }

  it('shows the settings link only once the script runs', () => {
    const link = addSettingsLink();
    setUp({ storage: localStorage, analyticsId: ID });
    expect(link.hidden).toBe(false);
  });

  it('reopens the banner, says what was chosen, and can switch it off again', () => {
    const link = addSettingsLink();
    setUp({ storage: localStorage, analyticsId: ID });
    buttonNamed('Accept').click();
    document.cookie = '_ga=GA1.1.1; path=/';

    link.click();
    expect(banner()).not.toBeNull();
    expect(document.activeElement).toBe(banner());
    expect(banner()!.textContent).toContain('You have accepted.');

    buttonNamed('Refuse').click();
    expect(readConsent(localStorage)).toEqual({ analytics: 'denied' });
    expect(window[`ga-disable-${ID}`]).toBe(true);
    expect(document.cookie).toBe('');
    // Keyboard users go back to where they were
    expect(document.activeElement).toBe(link);
  });

  it('closes a reopened banner with Escape, but not the first one', () => {
    const link = addSettingsLink();
    setUp({ storage: localStorage, analyticsId: ID });
    banner()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(banner()).not.toBeNull();
    buttonNamed('Refuse').click();

    link.click();
    banner()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(banner()).toBeNull();
    expect(readConsent(localStorage)).toEqual({ analytics: 'denied' });
  });

  it('opens only one banner at a time', () => {
    const link = addSettingsLink();
    setUp({ storage: localStorage, analyticsId: ID });
    link.click();
    expect(document.querySelectorAll('.consent-banner')).toHaveLength(1);
  });
});

describe('Disqus comments', () => {
  const SRC = 'https://example.disqus.com/embed.js';

  function addThread() {
    const thread = document.createElement('div');
    thread.id = 'disqus_thread';
    thread.dataset.src = SRC;
    document.body.append(thread);
    return thread;
  }

  function disqusScripts() {
    return document.querySelectorAll(`script[src="${SRC}"]`);
  }

  it('waits for a click before loading', () => {
    addThread();
    setUp({ storage: localStorage });
    expect(disqusScripts()).toHaveLength(0);

    buttonNamed('Load comments').click();
    expect(disqusScripts()).toHaveLength(1);
    expect(document.querySelector('.consent-comments')).toBeNull();
    // Only this once, as "Always load comments" was left unticked
    expect(readConsent(localStorage)).toEqual({});
  });

  it('loads on its own after "Always load comments", as the comments come into view', () => {
    addThread();
    setUp({ storage: localStorage });
    document.querySelector<HTMLInputElement>('#consent-comments-always')!.click();
    buttonNamed('Load comments').click();
    expect(readConsent(localStorage)).toEqual({ comments: 'granted' });

    document.head.innerHTML = '';
    document.body.innerHTML = '';
    let seen: IntersectionObserverCallback | undefined;
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          seen = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
    addThread();
    setUp({ storage: localStorage });
    expect(document.querySelector('.consent-comments')).toBeNull();
    expect(disqusScripts()).toHaveLength(0);
    seen!([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(disqusScripts()).toHaveLength(1);
  });

  it('can go back to asking, from the settings', () => {
    writeConsent(localStorage, { analytics: 'denied', comments: 'granted' });
    const link = document.createElement('a');
    link.dataset.consentSettings = '';
    document.body.append(link);
    setUp({ storage: localStorage, analyticsId: ID });

    link.click();
    buttonNamed('Ask before loading comments').click();
    expect(readConsent(localStorage)).toEqual({ analytics: 'denied', comments: 'denied' });
  });
});
