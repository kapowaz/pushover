const imageUrls = import.meta.glob('./images/**/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const soundUrls = import.meta.glob('./sounds/*.ogg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const musicUrls = import.meta.glob('./music/*.ogg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const mapModules = import.meta.glob('./maps/**/*.json');

export function getImageUrl(path: string): string {
  const key = `./images/${path}`;
  const url = imageUrls[key];
  if (!url) throw new Error(`Image not found: ${path}`);
  return url;
}

export function getSoundUrl(index: number): string | undefined {
  const key = `./sounds/${index}.ogg`;
  return soundUrls[key];
}

export function getMusicUrl(zone: number): string | undefined {
  const key = `./music/${zone}.ogg`;
  return musicUrls[key];
}

export async function loadMapData<T>(
  mapSet: number,
  mapNumber: number,
): Promise<T> {
  const key = `./maps/${mapSet}/${mapNumber}.json`;
  const loader = mapModules[key];
  if (!loader) throw new Error(`Map not found: ${mapSet}/${mapNumber}`);
  const module = (await loader()) as { default: T };
  return module.default;
}
