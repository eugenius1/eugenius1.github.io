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

describe('files copied from the Blowfish theme', () => {
  it.each(Object.entries(copiedFromTheme))('%s is up to date', (path, expected) => {
    const theme = readFileSync(`themes/blowfish/${path}`);
    expect(createHash('sha256').update(theme).digest('hex')).toBe(expected);
  });
});
