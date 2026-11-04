// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEY, readConsent, setUp, writeConsent } from './consent';

const SRC = 'https://example.disqus.com/embed.js';

function buttonNamed(text: string) {
  const found = [...document.querySelectorAll('button')].find((b) => b.textContent === text);
  if (!found) throw new Error(`No button "${text}"`);
  return found;
}

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

// Stands in for IntersectionObserver, and returns a way to scroll the comments into view
function stubObserver() {
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
  return () =>
    seen!([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
}

beforeEach(() => {
  localStorage.clear();
  document.head.innerHTML = '';
  document.body.innerHTML = '';
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('stored choices', () => {
  it('reads back what was written', () => {
    writeConsent(localStorage, { comments: 'granted' });
    expect(readConsent(localStorage)).toEqual({ comments: 'granted' });
  });

  it('treats nothing, junk and unknown values as no choice', () => {
    expect(readConsent(localStorage)).toEqual({});
    localStorage.setItem(STORAGE_KEY, 'not json');
    expect(readConsent(localStorage)).toEqual({});
    localStorage.setItem(STORAGE_KEY, '{"comments":"yes"}');
    expect(readConsent(localStorage)).toEqual({});
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
    expect(() => writeConsent(broken, { comments: 'granted' })).not.toThrow();
  });
});

describe('Disqus comments', () => {
  it('does nothing on a page without comments', () => {
    setUp({ storage: localStorage });
    expect(document.body.innerHTML).toBe('');
  });

  it('waits for a click before loading, and sets no cookie', () => {
    addThread();
    setUp({ storage: localStorage });
    expect(disqusScripts()).toHaveLength(0);

    buttonNamed('Load comments').click();
    expect(disqusScripts()).toHaveLength(1);
    expect(document.querySelector('.consent-comments')).toBeNull();
    // Only this once, as "Always load comments" was left unticked
    expect(readConsent(localStorage)).toEqual({});
    expect(document.cookie).toBe('');
    // Keyboard users carry on from the comments, not the top of the page
    expect(document.activeElement).toBe(document.querySelector('#disqus_thread'));
  });

  it('loads on its own after "Always load comments", as the comments come into view', () => {
    addThread();
    setUp({ storage: localStorage });
    document.querySelector<HTMLInputElement>('#consent-comments-always')!.click();
    buttonNamed('Load comments').click();
    expect(readConsent(localStorage)).toEqual({ comments: 'granted' });

    document.head.innerHTML = '';
    document.body.innerHTML = '';
    const scrollIntoView = stubObserver();
    addThread();
    setUp({ storage: localStorage });
    expect(document.querySelector('.consent-comments')).toBeNull();
    expect(disqusScripts()).toHaveLength(0);
    scrollIntoView();
    expect(disqusScripts()).toHaveLength(1);
  });

  it('can go back to asking, from below the comments', () => {
    writeConsent(localStorage, { comments: 'granted' });
    stubObserver();
    addThread();
    setUp({ storage: localStorage });

    buttonNamed('Ask before loading comments').click();
    expect(readConsent(localStorage)).toEqual({ comments: 'denied' });
    expect(document.activeElement?.textContent).toContain('wait for a click');

    document.body.innerHTML = '';
    addThread();
    setUp({ storage: localStorage });
    expect(buttonNamed('Load comments')).toBeTruthy();
  });
});
