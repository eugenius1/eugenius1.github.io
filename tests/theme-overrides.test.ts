// @vitest-environment node
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Files copied from Blowfish, or based on one, with the hash of the theme's
// version they came from. When a theme update fails this test, bring the
// theme's changes into the file, then update the hash here.
const copiedFromTheme = {
  'layouts/shortcodes/carousel.html':
    '8804e4edd4547b9c7c766c7be760c91116588330affb0af36b86f7929fca913a',
  'layouts/partials/header/basic.html':
    '7db61178a998e92fdaaf6dfad17ccbe340b0e0a34d84c1d2cabb52be8c246b4d',
  'layouts/_default/rss.xml':
    '1126493c87522c5baaff8671db93e4585405158ac3ce0717a95ee126c96befb7',
};

// Theme files that assets/ts/toc/mobile-toc.ts and its bundle test in
// layouts/partials/extend-head-uncached.html depend on. The bar disappears
// silently if these change. When a theme update fails this test, check that its
// ids and classes, the table of contents test and the .anchor element are still
// there, then update the hash here.
const reliedOnFromTheme = {
  'layouts/partials/toc.html': 'e7421777786958877067ccf24fd867d1ca4399786fac249ef19c1f977cab9ee9',
  'layouts/_default/single.html':
    '95df346429c81282daad118b45224c0b3c3be15fbf1739bba9ef1bb4e3130272',
  'layouts/_default/_markup/render-heading.html':
    '3e4e7bdfb50b3a93db8a864c331c47b86330981fd6e787ede17039f03bcaf412',
};

function hashOfThemeFile(path: string): string {
  return createHash('sha256').update(readFileSync(`themes/blowfish/${path}`)).digest('hex');
}

describe('files copied from the Blowfish theme', () => {
  it.each(Object.entries(copiedFromTheme))('%s is up to date', (path, expected) => {
    expect(hashOfThemeFile(path)).toBe(expected);
  });
});

describe('Blowfish files the table of contents bar relies on', () => {
  it.each(Object.entries(reliedOnFromTheme))('%s is unchanged', (path, expected) => {
    expect(hashOfThemeFile(path)).toBe(expected);
  });
});
