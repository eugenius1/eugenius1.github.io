// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { start } from './home-cover';

const HOLD_MS = 6000;

// Stands in for matchMedia('(prefers-reduced-motion: reduce)')
class FakeMediaQuery extends EventTarget {
  matches = false;

  set(matches: boolean) {
    this.matches = matches;
    this.dispatchEvent(new Event('change'));
  }
}

let images: HTMLImageElement[];
let reducedMotion: FakeMediaQuery;

beforeEach(() => {
  vi.useFakeTimers();
  images = [];
  reducedMotion = new FakeMediaQuery();
  vi.stubGlobal('matchMedia', () => reducedMotion);
  // jsdom never loads images, so each test fires load and error itself
  vi.stubGlobal(
    'Image',
    class {
      constructor() {
        const image = document.createElement('img');
        images.push(image);
        return image;
      }
    },
  );
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

function startCover(count: number) {
  document.body.innerHTML = `
    <section class="home-cover">
      <div class="home-cover-text"></div>
      <p class="home-cover-caption"></p>
    </section>`;
  const cover = document.querySelector<HTMLElement>('.home-cover')!;
  const photos = Array.from({ length: count }, (_, i) => ({
    path: `/img/${i}.jpg`,
    caption: `Caption ${i}`,
  }));
  cover.dataset.covers = JSON.stringify(photos);
  start(cover);
  return cover;
}

function latest() {
  return images[images.length - 1];
}

// Which photo an image is of
function photo(image: HTMLImageElement) {
  return Number(image.getAttribute('src')!.match(/(\d+)\.jpg$/)![1]);
}

function load(image = latest()) {
  image.dispatchEvent(new Event('load'));
}

function fail(image = latest()) {
  image.dispatchEvent(new Event('error'));
}

function fadeIn(image = latest()) {
  image.dispatchEvent(new Event('transitionend'));
}

// Loads and fades in the current photo, then waits for the next one to start
function rotate() {
  load();
  fadeIn();
  vi.advanceTimersByTime(HOLD_MS);
}

// The cover shows this image and no other
function expectOnly(cover: HTMLElement, image: HTMLImageElement) {
  const shown = cover.querySelectorAll('img');
  expect(shown).toHaveLength(1);
  expect(shown[0]).toBe(image);
}

function caption() {
  return document.querySelector('.home-cover-caption')!.textContent;
}

describe('home cover', () => {
  it('rotates in random order, never the same photo twice running', () => {
    startCover(4);
    for (let i = 0; i < 200; i++) rotate();

    const order = images.map(photo);
    expect(order).toHaveLength(201);
    for (let i = 1; i < order.length; i++) {
      expect(order[i]).not.toBe(order[i - 1]);
    }
    expect(new Set(order)).toEqual(new Set([0, 1, 2, 3]));
    // Not a fixed cycle: photo 0 is followed by more than one other photo
    const afterFirst = new Set(order.filter((p, i) => i > 0 && order[i - 1] === 0));
    expect(afterFirst.size).toBeGreaterThan(1);
  });

  it('picks from the photos not just shown', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.99);
    startCover(3);
    expect(photo(latest())).toBe(2);
    random.mockReturnValue(0);
    rotate();
    expect(photo(latest())).toBe(0);
    random.mockReturnValue(0.5);
    rotate();
    expect(photo(latest())).toBe(2);
  });

  it('waits for a photo to fade in, then holds it before the next', () => {
    const cover = startCover(3);
    load();
    expect(latest().classList.contains('is-shown')).toBe(true);
    vi.advanceTimersByTime(HOLD_MS * 2);
    expect(images).toHaveLength(1);

    fadeIn();
    vi.advanceTimersByTime(HOLD_MS - 1);
    expect(images).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(images).toHaveLength(2);

    // The old photo stays behind the new one until the new one has faded in
    load();
    expect(cover.querySelectorAll('img')).toHaveLength(2);
    fadeIn();
    expectOnly(cover, latest());
  });

  it('shows each photo with its own caption', () => {
    startCover(4);
    expect(caption()).toBe('');
    for (let i = 0; i < 20; i++) {
      load();
      expect(caption()).toBe(`Caption ${photo(latest())}`);
      fadeIn();
      vi.advanceTimersByTime(HOLD_MS);
      // The caption changes with the photo, not before it loads
      expect(caption()).toBe(`Caption ${photo(images[images.length - 2])}`);
    }
  });

  it('skips a failed photo and never tries it again', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    startCover(3);
    expect(photo(latest())).toBe(0);
    fail();
    expect(images).toHaveLength(2);
    expect(photo(latest())).toBe(1);

    vi.mocked(Math.random).mockRestore();
    for (let i = 0; i < 20; i++) rotate();
    const order = images.slice(1).map(photo);
    expect(order).not.toContain(0);
    // Only two left, so they take turns
    expect(order.join('')).toBe('12'.repeat(21).slice(0, order.length));
  });

  it('stops once every photo has failed', () => {
    const cover = startCover(3);
    fail();
    fail();
    fail();
    expect(images.map(photo).sort()).toEqual([0, 1, 2]);
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(HOLD_MS * 10);
    expect(images).toHaveLength(3);
    expect(cover.querySelector('img')).toBeNull();
  });

  it('stops once the rest have failed, keeping the photo it shows', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const cover = startCover(3);
    load();
    fadeIn();
    vi.advanceTimersByTime(HOLD_MS);
    fail();
    fail();
    expect(images.map(photo)).toEqual([0, 1, 2]);
    vi.advanceTimersByTime(HOLD_MS * 10);
    expect(images).toHaveLength(3);
    expectOnly(cover, images[0]);
  });

  it('swaps photos straight away with reduced motion, and holds the photo', () => {
    reducedMotion.matches = true;
    const cover = startCover(3);
    load();
    // No fade to wait for
    expectOnly(cover, latest());
    expect(caption()).toBe(`Caption ${photo(latest())}`);
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(HOLD_MS * 10);
    expect(images).toHaveLength(1);
  });

  it('stops when reduced motion turns on, and resumes when it turns off', () => {
    startCover(3);
    rotate();
    expect(images).toHaveLength(2);
    load();
    fadeIn();
    reducedMotion.set(true);
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(HOLD_MS * 10);
    expect(images).toHaveLength(2);

    reducedMotion.set(false);
    vi.advanceTimersByTime(HOLD_MS);
    expect(images).toHaveLength(3);
    rotate();
    expect(images).toHaveLength(4);
  });

  it('shows a photo straight away when reduced motion turns on mid-fade', () => {
    const cover = startCover(3);
    rotate();
    load();
    reducedMotion.set(true);
    // Turning the fade off cancels the transition
    latest().dispatchEvent(new Event('transitioncancel'));
    expectOnly(cover, latest());
    expect(vi.getTimerCount()).toBe(0);
  });

  it('shows a photo straight away when reduced motion turns on before its fade starts', () => {
    const cover = startCover(3);
    rotate();
    load();
    reducedMotion.set(true);
    expectOnly(cover, latest());
    expect(vi.getTimerCount()).toBe(0);

    // A late transition event leaves the photo shown
    latest().dispatchEvent(new Event('transitioncancel'));
    expectOnly(cover, latest());
    reducedMotion.set(false);
    vi.advanceTimersByTime(HOLD_MS);
    expect(images).toHaveLength(3);
    rotate();
    expect(images).toHaveLength(4);
  });

  it('does not start a photo while one is loading', () => {
    startCover(3);
    reducedMotion.set(true);
    reducedMotion.set(false);
    vi.advanceTimersByTime(HOLD_MS);
    expect(images).toHaveLength(1);

    load();
    fadeIn();
    vi.advanceTimersByTime(HOLD_MS);
    expect(images).toHaveLength(2);
  });

  it('does not start a photo while one is fading in', () => {
    const cover = startCover(3);
    load();
    // A change event that leaves reduced motion off, which schedules the next photo
    reducedMotion.dispatchEvent(new Event('change'));
    vi.advanceTimersByTime(HOLD_MS);
    expect(images).toHaveLength(1);

    latest().dispatchEvent(new Event('transitioncancel'));
    expectOnly(cover, latest());
    vi.advanceTimersByTime(HOLD_MS);
    expect(images).toHaveLength(2);
  });

  it('never rotates one photo on its own', () => {
    startCover(1);
    load();
    fadeIn();
    expect(vi.getTimerCount()).toBe(0);
    reducedMotion.set(true);
    reducedMotion.set(false);
    vi.advanceTimersByTime(HOLD_MS * 10);
    expect(images).toHaveLength(1);
    expect(caption()).toBe('Caption 0');
  });
});
