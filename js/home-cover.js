// Fades the homepage cover through its photos in random order, never showing the
// same one twice running.
const HOLD_MS = 6000;

const cover = document.querySelector('.home-cover');
const text = cover.querySelector('.home-cover-text');
const caption = cover.querySelector('.home-cover-caption');
const photos = JSON.parse(cover.dataset.covers);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

let index = -1;
let shown = null;

function pickNext() {
  const choices = photos.length - (index < 0 ? 0 : 1);
  const pick = Math.floor(Math.random() * choices);
  return index >= 0 && pick >= index ? pick + 1 : pick;
}

function show() {
  index = pickNext();
  const image = new Image();
  image.alt = '';
  image.src = photos[index].path;
  image.onload = () => {
    cover.insertBefore(image, text);
    caption.textContent = photos[index].caption;
    image.getBoundingClientRect(); // so the fade starts from opacity 0
    image.classList.add('is-shown');
    if (reducedMotion) {
      return;
    }
    image.addEventListener(
      'transitionend',
      () => {
        shown?.remove();
        shown = image;
        setTimeout(show, HOLD_MS);
      },
      { once: true }
    );
  };
}

show();
