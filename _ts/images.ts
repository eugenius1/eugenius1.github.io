// Makes the web copies of each original in _images/: WebP and the original's own
// format in each width of WIDTHS, never wider than the original, into assets/img/,
// and each image's size into _data/images.json for _includes/img.html. Neither is in
// git. `npm run images` runs it, and it skips originals that haven't changed.
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Each copy is named by its slot here, even when the original is narrower and the
// copy is too, so `<name>-1200.jpg` can be written in front matter for any image.
export const WIDTHS = [480, 800, 1200, 2000];

// Changing how copies are made should bump this, so every image is made again.
// The widths are part of it, as the data file lists each image's copies.
const VERSION = `1 ${WIDTHS.join(' ')}`;

const FORMATS: Record<string, 'jpeg' | 'png' | 'gif' | 'webp'> = {
  '.jpg': 'jpeg',
  '.jpeg': 'jpeg',
  '.png': 'png',
  '.gif': 'gif',
  '.webp': 'webp',
};

export interface Copy {
  slot: number;
  width: number;
}

export interface ImageData {
  // The address of the copies, without `-<slot>.<ext>`
  base: string;
  ext: string;
  // Of the largest copy
  width: number;
  height: number;
  // One for each distinct width, smallest first, for srcset
  copies: Copy[];
}

interface Manifest {
  version: string;
  images: Record<string, { hash: string; data: ImageData }>;
}

export interface Options {
  // Folder of originals
  src: string;
  // Folder the copies go in, which this script owns
  out: string;
  // The JSON data file
  data: string;
  // The address `out` is served at
  url: string;
}

export interface Summary {
  made: string[];
  unchanged: string[];
  removed: number;
}

// The slot each distinct width is named by, never wider than the original
export function copiesFor(originalWidth: number): Copy[] {
  const copies: Copy[] = [];
  for (const slot of WIDTHS) {
    const width = Math.min(slot, originalWidth);
    if (copies.at(-1)?.width !== width) copies.push({ slot, width });
  }
  return copies;
}

// Every slot's file name for an image, including the ones that repeat a width
function fileNames(name: string, ext: string): string[] {
  return WIDTHS.flatMap((slot) => [`${name}-${slot}.webp`, `${name}-${slot}${ext}`]);
}

async function walk(dir: string, root = dir): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full, root)));
    else files.push(path.relative(root, full).split(path.sep).join('/'));
  }
  return files.sort();
}

async function readManifest(file: string): Promise<Manifest> {
  try {
    const manifest: Manifest = JSON.parse(await readFile(file, 'utf8'));
    if (manifest.version === VERSION) return manifest;
  } catch {
    // Missing or unreadable, so every image is made again
  }
  return { version: VERSION, images: {} };
}

async function make(input: Buffer, name: string, ext: string, options: Options): Promise<ImageData> {
  // Animated GIFs keep their frames, and photos are turned the way their EXIF says
  const animated = ext === '.gif';
  const original = sharp(input, { animated, autoOrient: true });
  const meta = await original.metadata();
  const copies = copiesFor(meta.autoOrient.width);
  const format = FORMATS[ext];
  let height = 0;

  await mkdir(path.dirname(path.join(options.out, name)), { recursive: true });
  for (const [i, { width }] of copies.entries()) {
    // This copy fills its own slot and any wider ones the original can't
    const slots = WIDTHS.filter((slot) => slot >= copies[i].slot && (i === copies.length - 1 || slot < copies[i + 1].slot));
    const resized = original.clone().resize({ width });
    const encoded = {
      '.webp': resized.clone().webp({ quality: 80, effort: 5 }),
      [ext]: resized.clone()[format](format === 'jpeg' ? { quality: 80, mozjpeg: true } : {}),
    };
    for (const [suffix, image] of Object.entries(encoded)) {
      const { data, info } = await image.toBuffer({ resolveWithObject: true });
      for (const slot of slots) await writeFile(path.join(options.out, `${name}-${slot}${suffix}`), data);
      height = info.pageHeight ?? info.height;
    }
  }

  const largest = copies.at(-1)!;
  return {
    base: `${options.url}/${name}`,
    ext,
    width: largest.width,
    height,
    copies,
  };
}

export async function processImages(options: Options): Promise<Summary> {
  const manifestFile = path.join(options.out, '.manifest.json');
  const old = await readManifest(manifestFile);
  const manifest: Manifest = { version: VERSION, images: {} };
  const existing = new Set(await walk(options.out));
  const wanted = new Set(['.manifest.json']);
  const summary: Summary = { made: [], unchanged: [], removed: 0 };

  // Other files, such as Photoshop or PowerPoint sources, stay unpublished
  const originals = (await walk(options.src)).filter((file) => path.extname(file).toLowerCase() in FORMATS);
  for (const file of originals) {
    const ext = path.extname(file).toLowerCase();
    const name = file.slice(0, -ext.length);
    const input = await readFile(path.join(options.src, file));
    const hash = createHash('sha256').update(input).digest('hex');
    const files = fileNames(name, ext);
    files.forEach((name) => wanted.add(name));

    const before = old.images[file];
    if (before?.hash === hash && files.every((name) => existing.has(name))) {
      manifest.images[file] = before;
      summary.unchanged.push(file);
    } else {
      manifest.images[file] = { hash, data: await make(input, name, ext, options) };
      summary.made.push(file);
    }
  }

  // Copies of originals that have gone, or of slots that are no longer used
  for (const file of existing) {
    if (!wanted.has(file)) {
      await rm(path.join(options.out, file));
      summary.removed++;
    }
  }

  await mkdir(options.out, { recursive: true });
  await writeFile(manifestFile, JSON.stringify(manifest));
  const data = Object.fromEntries(Object.entries(manifest.images).map(([file, { data }]) => [file, data]));
  await mkdir(path.dirname(options.data), { recursive: true });
  await writeFile(options.data, `${JSON.stringify(data, null, 1)}\n`);
  return summary;
}

if (import.meta.main) {
  const summary = await processImages({
    src: '_images',
    out: 'assets/img',
    data: '_data/images.json',
    url: '/assets/img',
  });
  console.log(
    `Images: ${summary.made.length} made, ${summary.unchanged.length} unchanged, ${summary.removed} old copies removed`,
  );
}
