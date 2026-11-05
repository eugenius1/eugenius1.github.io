import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { copiesFor, processImages, type ImageData, type Options } from './images';

let dir: string;
let options: Options;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'images-'));
  options = {
    src: path.join(dir, '_images'),
    out: path.join(dir, 'assets/img'),
    data: path.join(dir, '_data/images.json'),
    url: '/assets/img',
  };
  await mkdir(options.src, { recursive: true });
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

async function original(name: string, width: number, height: number, format: 'png' | 'jpeg' = 'png') {
  const file = path.join(options.src, name);
  await mkdir(path.dirname(file), { recursive: true });
  await sharp({ create: { width, height, channels: 3, background: '#2a7' } })
    [format]()
    .toFile(file);
}

async function data(): Promise<Record<string, ImageData>> {
  return JSON.parse(await readFile(options.data, 'utf8'));
}

async function size(file: string) {
  const { width, height, format } = await sharp(path.join(options.out, file)).metadata();
  return { width, height, format };
}

describe('copiesFor', () => {
  it('makes every width for a wide original', () => {
    expect(copiesFor(4000)).toEqual([
      { slot: 480, width: 480 },
      { slot: 800, width: 800 },
      { slot: 1200, width: 1200 },
      { slot: 2000, width: 2000 },
    ]);
  });

  it('never makes a copy wider than the original', () => {
    expect(copiesFor(900)).toEqual([
      { slot: 480, width: 480 },
      { slot: 800, width: 800 },
      { slot: 1200, width: 900 },
    ]);
  });

  it('makes one copy of an original narrower than every width', () => {
    expect(copiesFor(300)).toEqual([{ slot: 480, width: 300 }]);
  });

  it('makes no extra copy of an original exactly one width wide', () => {
    expect(copiesFor(800)).toEqual([
      { slot: 480, width: 480 },
      { slot: 800, width: 800 },
    ]);
  });
});

describe('processImages', () => {
  it('writes WebP and the original format in each width', async () => {
    await original('blog/chart.png', 2400, 1200);
    await processImages(options);

    expect(await size('blog/chart-480.webp')).toEqual({ width: 480, height: 240, format: 'webp' });
    expect(await size('blog/chart-1200.png')).toEqual({ width: 1200, height: 600, format: 'png' });
    expect(await size('blog/chart-2000.webp')).toEqual({ width: 2000, height: 1000, format: 'webp' });
  });

  it('fills the wider slots with the original size rather than enlarging it', async () => {
    await original('photo.jpg', 900, 600, 'jpeg');
    await processImages(options);

    expect(await size('photo-1200.jpg')).toEqual({ width: 900, height: 600, format: 'jpeg' });
    expect(await size('photo-2000.webp')).toEqual({ width: 900, height: 600, format: 'webp' });
    expect((await data())['photo.jpg']).toEqual({
      base: '/assets/img/photo',
      ext: '.jpg',
      width: 900,
      height: 600,
      copies: [
        { slot: 480, width: 480 },
        { slot: 800, width: 800 },
        { slot: 1200, width: 900 },
      ],
    });
  });

  it('keeps the frames of an animated GIF', async () => {
    // Frames of 600 by 400, stacked in one tall image. Each is a different grey, as
    // identical frames are merged into one.
    const frames = 3;
    const frameSize = 600 * 400 * 3;
    const pixels = Buffer.alloc(frameSize * frames);
    for (let i = 0; i < frames; i++) pixels.fill(i * 100, i * frameSize, (i + 1) * frameSize);
    await sharp(pixels, { raw: { width: 600, height: 400 * frames, channels: 3, pageHeight: 400 } })
      .gif()
      .toFile(path.join(options.src, 'anim.gif'));

    await processImages(options);

    // Without `animated`, the size is the first frame's
    const webp = await sharp(path.join(options.out, 'anim-480.webp')).metadata();
    expect(webp.pages).toBe(frames);
    expect(webp.height).toBe(320);
    expect((await data())['anim.gif']).toMatchObject({ width: 600, height: 400 });
  });

  it('ignores files that are not images', async () => {
    await writeFile(path.join(options.src, 'slides.pptx'), 'not an image');
    await original('a.png', 100, 100);
    await processImages(options);

    expect(Object.keys(await data())).toEqual(['a.png']);
  });

  it('skips originals that have not changed', async () => {
    await original('a.png', 100, 100);
    await original('b.png', 100, 100);
    await processImages(options);
    await original('b.png', 200, 100);

    const summary = await processImages(options);

    expect(summary.unchanged).toEqual(['a.png']);
    expect(summary.made).toEqual(['b.png']);
    expect((await data())['b.png'].width).toBe(200);
  });

  it('makes an image again when one of its copies has gone', async () => {
    await original('a.png', 100, 100);
    await processImages(options);
    await rm(path.join(options.out, 'a-800.webp'));

    expect((await processImages(options)).made).toEqual(['a.png']);
  });

  it('removes the copies of an original that has gone', async () => {
    await original('a.png', 100, 100);
    await original('sub/b.png', 100, 100);
    await processImages(options);
    await rm(path.join(options.src, 'sub/b.png'));

    const summary = await processImages(options);

    expect(summary.removed).toBe(8);
    expect(await readdir(path.join(options.out, 'sub'))).toEqual([]);
    expect(Object.keys(await data())).toEqual(['a.png']);
  });

  it('removes a temporary file left by a run that stopped', async () => {
    await original('a.png', 100, 100);
    await processImages(options);
    await writeFile(path.join(options.out, 'a-480.webp.tmp'), 'cut off');

    expect((await processImages(options)).removed).toBe(1);
  });

  it('makes the data again when the address changes', async () => {
    await original('a.png', 100, 100);
    await processImages(options);

    const summary = await processImages({ ...options, url: '/img' });

    expect(summary.made).toEqual(['a.png']);
    expect((await data())['a.png'].base).toBe('/img/a');
  });

  it('refuses two originals that differ only in format', async () => {
    await original('chart.png', 100, 100);
    await original('chart.jpg', 100, 100, 'jpeg');

    await expect(processImages(options)).rejects.toThrow('chart.jpg and chart.png');
  });

  it('removes nothing when the folder of originals is missing', async () => {
    await original('a.png', 100, 100);
    await processImages(options);
    await rm(options.src, { recursive: true });

    await expect(processImages(options)).rejects.toThrow();
    expect(await readdir(options.out)).toContain('a-480.webp');
  });
});
