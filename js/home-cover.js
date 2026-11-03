// Fades the homepage cover through its photos in random order, never showing the
// same one twice running.
const HOLD_MS = 6000;

const cover = document.querySelector('.home-cover');
const text = cover.querySelector('.home-cover-text');
const caption = cover.querySelector('.home-cover-caption');
const photos = JSON.parse(cover.dataset.covers);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

const failed = new Set();
let index = -1;
let shown = null;
let timer;

function scheduleNext() {
  clearTimeout(timer);
  if (!reducedMotion.matches && photos.length > 1) {
    timer = setTimeout(show, HOLD_MS);
  }
}

function finish(image) {
  shown?.remove();
  shown = image;
  scheduleNext();
}

function show() {
  const choices = photos.map((_, i) => i).filter((i) => i !== index && !failed.has(i));
  if (choices.length === 0) return;
  const current = choices[Math.floor(Math.random() * choices.length)];
  index = current;

  const image = new Image();
  image.alt = '';
  image.src = photos[current].path;
  image.onerror = () => {
    // Try another photo, until each has failed
    failed.add(current);
    show();
  };
  image.onload = () => {
    cover.insertBefore(image, text);
    caption.textContent = photos[current].caption;
    image.getBoundingClientRect(); // so the fade starts from opacity 0
    image.classList.add('is-shown');
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

reducedMotion.addEventListener('change', scheduleNext);
show();
