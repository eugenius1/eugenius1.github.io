// Screens too narrow for Blowfish's sidebar only get a box at the top of the article.
// Once that scrolls away, a bar over the site header shows the title and opens the
// contents in a popup. Without JavaScript the box still works.

const SVG_ATTRIBUTES =
  'viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"';
const LIST_ICON = `<svg ${SVG_ATTRIBUTES}><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>`;
const CLOSE_ICON = `<svg ${SVG_ATTRIBUTES}><path d="M6 6l12 12M18 6L6 18"/></svg>`;

function element(tag: string, className: string, text = ''): HTMLElement {
  const el = document.createElement(tag);
  el.className = className;
  el.textContent = text;
  return el;
}

function iconButton(icon: string, label: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.innerHTML = icon;
  button.setAttribute('aria-label', label);
  return button;
}

// The theme's .anchor sits above its heading, so it passes the top of the window as
// the heading reaches where a jump to it lands
function currentLink(links: HTMLAnchorElement[]): HTMLAnchorElement | undefined {
  return links
    .filter((link) => {
      const id = decodeURIComponent(link.hash.slice(1));
      const anchor = document.getElementById(id);
      return anchor !== null && anchor.getBoundingClientRect().top <= 0;
    })
    .pop();
}

function openPopup(popup: HTMLDialogElement, links: HTMLAnchorElement[]): void {
  links.forEach((link) => link.removeAttribute('aria-current'));
  const current = currentLink(links);
  current?.setAttribute('aria-current', 'location');
  popup.showModal();
  current?.scrollIntoView({ block: 'center' });
}

export function initMobileToc(): void {
  const toc = document.getElementById('TableOfContentsMobile');
  const box = toc?.closest('.toc-inside');
  const title = document.querySelector('#single_header h1')?.textContent?.trim();
  if (!toc || !box || !title) {
    return;
  }
  const label = toc.getAttribute('aria-label') ?? '';

  // lg:hidden is where the theme swaps the box for its sidebar
  const bar = element('div', 'toc-bar flex lg:hidden print:hidden');
  const openButton = iconButton(LIST_ICON, label);
  openButton.setAttribute('aria-haspopup', 'dialog');
  bar.append(element('span', 'truncate', title), openButton);

  const popup = element('dialog', 'toc-popup') as HTMLDialogElement;
  popup.setAttribute('aria-label', label);
  const header = element('div', 'toc-popup-header');
  header.append(element('span', 'truncate', title), iconButton(CLOSE_ICON, 'Close'));

  const list = toc.cloneNode(true) as HTMLElement;
  list.removeAttribute('id');
  list.classList.add('toc');
  const links = [...list.querySelectorAll('a')];
  popup.append(header, list);
  document.body.append(bar, popup);

  openButton.onclick = () => openPopup(popup, links);
  // The header and list fill the popup, so a click on it directly is on its backdrop
  popup.onclick = (event) => {
    if (event.target === popup || (event.target as Element).closest('a, button')) {
      popup.close();
    }
  };

  new IntersectionObserver((entries) => {
    entries.forEach(({ boundingClientRect }) => {
      bar.classList.toggle('toc-bar-shown', boundingClientRect.bottom < 0);
    });
  }).observe(box);
}
