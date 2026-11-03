// Fades the homepage cover through its photos in random order, never showing the
// same one twice running.
const HOLD_MS = 6000;

const cover = document.querySelector('.home-cover');
const text = cover.querySelector('.home-cover-text');
const caption = cover.querySelector('.home-cover-caption');
const photos = JSON.parse(cover.dataset.covers);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

let index = -1;
let shown = null;
let timer;
let failures = 0;

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
  const previous = index;
  do {
    index = Math.floor(Math.random() * photos.length);
  } while (index === previous);

  const image = new Image();
  image.alt = '';
  image.src = photos[index].path;
  image.onerror = () => {
    // Try another photo, until each has had a turn at failing
    if (++failures < photos.length) show();
  };
  image.onload = () => {
    failures = 0;
    cover.insertBefore(image, text);
    caption.textContent = photos[index].caption;
    image.getBoundingClientRect(); // so the fade starts from opacity 0
    image.classList.add('is-shown');
    // Reduced motion turns the fade off, so there's no transitionend to wait for
    if (reducedMotion.matches) {
      finish(image);
    } else {
      image.addEventListener('transitionend', () => finish(image), { once: true });
    }
  };
}

reducedMotion.addEventListener('change', scheduleNext);
show();
