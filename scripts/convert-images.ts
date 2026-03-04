import { readdir, mkdir, stat } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const BASE = process.cwd();
const OUTPUT_DIR = path.join(BASE, 'public/assets/images');

const SOURCE_DIRS = [
  path.join(BASE, 'Resource/Image'),
  path.join(BASE, 'Intro'),
];

function normalizeName(name: string): string {
  return name.replace(/\s+/g, '-').toLowerCase();
}

async function findIshiFiles(dir: string): Promise<string[]> {
  const results: string[] = [];

  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await findIshiFiles(fullPath)));
    } else if (entry.name.toLowerCase().endsWith('.ishi')) {
      results.push(fullPath);
    }
  }

  return results;
}

async function replaceMagenta(inputPath: string, outputPath: string) {
  const image = sharp(inputPath).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  const channels = info.channels;

  for (let i = 0; i < pixels.length; i += channels) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    if (r === 255 && g === 0 && b === 255) {
      pixels[i + 3] = 0;
    }
  }

  await sharp(Buffer.from(pixels.buffer, pixels.byteOffset, pixels.byteLength), {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .png()
    .toFile(outputPath);
}

async function processSource(sourceDir: string) {
  const files = await findIshiFiles(sourceDir);
  const sourceRoot = path.dirname(sourceDir);

  for (const file of files) {
    const relative = path.relative(sourceRoot, file);
    const parts = relative.split(path.sep);
    const normalized = parts.map(normalizeName).join(path.sep);
    const outputFile = normalized.replace(/\.ishi$/i, '.png');
    const outputPath = path.join(OUTPUT_DIR, outputFile);

    await mkdir(path.dirname(outputPath), { recursive: true });
    await replaceMagenta(file, outputPath);
    console.log(`${file} -> ${outputPath}`);
  }
}

async function main() {
  for (const dir of SOURCE_DIRS) {
    const exists = await stat(dir).catch(() => null);
    if (!exists) {
      console.warn(`Source directory not found, skipping: ${dir}`);
      continue;
    }
    await processSource(dir);
  }
  console.log('Image conversion complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
