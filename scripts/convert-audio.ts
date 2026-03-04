import { readdir, mkdir, copyFile, stat } from 'fs/promises';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execFileAsync = promisify(execFile);

const BASE = process.cwd();
const MUSIC_SRC = path.join(BASE, 'Resource/Music');
const SOUND_SRC = path.join(BASE, 'Resource/Sound');
const MUSIC_DEST = path.join(BASE, 'src/assets/music');
const SOUND_DEST = path.join(BASE, 'src/assets/sounds');

async function copyOggFiles() {
  let entries;
  try {
    entries = await readdir(MUSIC_SRC);
  } catch {
    console.warn(`Music source not found, skipping: ${MUSIC_SRC}`);
    return;
  }

  await mkdir(MUSIC_DEST, { recursive: true });

  for (const file of entries) {
    if (!file.toLowerCase().endsWith('.ogg')) continue;
    const src = path.join(MUSIC_SRC, file);
    const dest = path.join(MUSIC_DEST, file);
    await copyFile(src, dest);
    console.log(`${src} -> ${dest}`);
  }
}

async function convertWavFiles() {
  let entries;
  try {
    entries = await readdir(SOUND_SRC);
  } catch {
    console.warn(`Sound source not found, skipping: ${SOUND_SRC}`);
    return;
  }

  await mkdir(SOUND_DEST, { recursive: true });

  for (const file of entries) {
    if (!file.toLowerCase().endsWith('.wav')) continue;
    const src = path.join(SOUND_SRC, file);
    const oggName = file.replace(/\.wav$/i, '.ogg');
    const dest = path.join(SOUND_DEST, oggName);

    await execFileAsync('ffmpeg', ['-y', '-i', src, '-c:a', 'libvorbis', dest]);
    console.log(`${src} -> ${dest}`);
  }
}

async function main() {
  await copyOggFiles();
  await convertWavFiles();
  console.log('Audio conversion complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
