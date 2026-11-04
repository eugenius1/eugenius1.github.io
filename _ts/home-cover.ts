// Fades the homepage cover through its photos in random order, never showing the
// same one twice running. `npm run build` compiles it to js/home-cover.js.
const HOLD_MS = 6000;

// The copies of each photo, from _includes/home-cover.html
interface Photo {
  src: string;
  srcset: string;
  caption: string;
}

export function start(cover: HTMLElement): void {
  const text = cover.querySelector('.home-cover-text');
  const caption = cover.querySelector('.home-cover-caption')!;
  const photos: Photo[] = JSON.parse(cover.dataset.covers!);
  const sizes = cover.dataset.sizes ?? '100vw';
  let first = true;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  const failed = new Set<number>();
  let index = -1; // the photo shown
  let shown: HTMLImageElement | null = null;
  let fading: HTMLImageElement | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let busy = false;

  function scheduleNext() {
    clearTimeout(timer);
    if (!reducedMotion.matches && photos.length > 1) {
      timer = setTimeout(show, HOLD_MS);
    }
  }

  function finish(image: HTMLImageElement) {
    // Both transition events and reduced motion can finish the same photo
    if (image !== fading) return;
    fading = null;
    busy = false;
    shown?.remove();
    shown = image;
    scheduleNext();
  }

  function show() {
    // Turning reduced motion off can schedule another photo while one still loads
    // or fades in
    if (busy) return;
    const choices = photos.map((_, i) => i).filter((i) => i !== index && !failed.has(i));
    if (choices.length === 0) return;
    const current = choices[Math.floor(Math.random() * choices.length)];
    busy = true;

    const image = new Image();
    image.alt = '';
    // The first photo is what the page is waiting for, the others load out of sight
    if (first) image.setAttribute('fetchpriority', 'high');
    first = false;
    // sizes before srcset, or the browser may pick a size before it knows
    image.sizes = sizes;
    image.srcset = photos[current].srcset;
    image.src = photos[current].src;
    image.onerror = () => {
      // Try another photo, until each has failed
      busy = false;
      failed.add(current);
      show();
    };
    image.onload = () => {
      index = current;
      cover.insertBefore(image, text);
      caption.textContent = photos[current].caption;
      image.getBoundingClientRect(); // so the fade starts from opacity 0
      image.classList.add('is-shown');
      fading = image;
      // Reduced motion turns the fade off, so there's no transitionend to wait for,
      // and turning it on mid-fade cancels the transition
      if (reducedMotion.matches) {
        finish(image);
      } else {
        const done = () => finish(image);
        image.addEventListener('transitionend', done, { once: true });
        image.addEventListener('transitioncancel', done, { once: true });
      }
    };
  }

  reducedMotion.addEventListener('change', () => {
    // A fade that never started sends no transition event to finish it
    if (reducedMotion.matches && fading) finish(fading);
    else scheduleNext();
  });
  show();
}

// Tests import start() without a cover on the page
const cover = document.querySelector<HTMLElement>('.home-cover');
if (cover) start(cover);
