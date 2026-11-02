import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initMobileToc } from './mobile-toc';

let observed: IntersectionObserverCallback;

function reportBoxBottom(bottom: number): void {
  const entry = { boundingClientRect: { bottom } };
  observed([entry as IntersectionObserverEntry], {} as IntersectionObserver);
}

function setTop(id: string, top: number): void {
  document.getElementById(id)!.getBoundingClientRect = () => ({ top }) as DOMRect;
}

const bar = () => document.querySelector('.toc-bar') as HTMLElement;
const popup = () => document.querySelector('.toc-popup') as HTMLDialogElement;
const popupLink = (name: string) => popup().querySelector(`a[href="#${name}"]`) as HTMLElement;
const barShown = () => bar().classList.contains('toc-bar-shown');
const open = () => bar().querySelector('button')!.click();
const click = (element: Element) =>
  element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

beforeEach(() => {
  document.body.innerHTML = `
    <header id="single_header"><h1>A &lt;b&gt;title&lt;/b&gt;</h1></header>
    <details class="toc-inside">
      <nav id="TableOfContentsMobile" aria-label="Table of Contents">
        <ul><li><a href="#one">One</a></li><li><a href="#two">Two</a></li></ul>
      </nav>
    </details>
    <div id="one" class="anchor"></div>
    <div id="two" class="anchor"></div>`;
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        observed = callback;
      }
      observe() {}
    },
  );
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
  Element.prototype.scrollIntoView = () => {};
});

describe('initMobileToc', () => {
  it('does nothing on a page without a table of contents', () => {
    document.getElementById('TableOfContentsMobile')!.remove();
    initMobileToc();
    expect(bar()).toBeNull();
  });

  it('shows the title as text, in the bar and the popup', () => {
    initMobileToc();
    expect(bar().querySelector('span')!.textContent).toBe('A <b>title</b>');
    expect(popup().querySelector('.toc-popup-header span')!.textContent).toBe('A <b>title</b>');
    expect(document.querySelector('b')).toBeNull();
  });

  it('copies the list without repeating its id', () => {
    initMobileToc();
    expect(document.querySelectorAll('#TableOfContentsMobile')).toHaveLength(1);
    expect(popup().querySelectorAll('a')).toHaveLength(2);
  });

  it('shows the bar only while the box is above the window', () => {
    initMobileToc();
    reportBoxBottom(900); // not reached yet
    expect(barShown()).toBe(false);
    reportBoxBottom(-200);
    expect(barShown()).toBe(true);
    reportBoxBottom(10);
    expect(barShown()).toBe(false);
  });

  it('highlights the section being read each time it opens', () => {
    initMobileToc();
    setTop('one', 50);
    setTop('two', 300);
    open();
    expect(popup().open).toBe(true);
    expect(popup().querySelector('[aria-current]')).toBeNull();

    setTop('one', -500);
    open();
    expect(popupLink('one').getAttribute('aria-current')).toBe('location');
    expect(popupLink('two').hasAttribute('aria-current')).toBe(false);

    setTop('two', -10);
    open();
    expect(popupLink('one').hasAttribute('aria-current')).toBe(false);
    expect(popupLink('two').getAttribute('aria-current')).toBe('location');
  });

  it('closes on a section, the close button or the backdrop, not on the header', () => {
    initMobileToc();
    open();
    click(popup().querySelector('.toc-popup-header')!);
    expect(popup().open).toBe(true);

    click(popupLink('two'));
    expect(popup().open).toBe(false);

    open();
    click(popup().querySelector('button')!);
    expect(popup().open).toBe(false);

    open();
    click(popup());
    expect(popup().open).toBe(false);
  });
});
