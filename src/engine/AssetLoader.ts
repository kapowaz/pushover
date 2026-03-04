export interface AssetManifest {
  images?: Record<string, string>;
  json?: Record<string, string>;
}

export interface LoadedAssets {
  images: Map<string, HTMLImageElement>;
  json: Map<string, unknown>;
}

export class AssetLoader {
  private imageCache = new Map<string, HTMLImageElement>();

  async loadImage(url: string): Promise<HTMLImageElement> {
    const cached = this.imageCache.get(url);
    if (cached) return cached;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.imageCache.set(url, img);
        resolve(img);
      };
      img.onerror = (_e) => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  async loadJSON<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${url} (${response.status})`);
    }
    return response.json() as Promise<T>;
  }

  async loadAll(manifest: AssetManifest): Promise<LoadedAssets> {
    const result: LoadedAssets = {
      images: new Map(),
      json: new Map(),
    };

    const imageEntries = Object.entries(manifest.images ?? {});
    const jsonEntries = Object.entries(manifest.json ?? {});

    const imagePromises = imageEntries.map(async ([key, url]) => {
      const img = await this.loadImage(url);
      result.images.set(key, img);
    });

    const jsonPromises = jsonEntries.map(async ([key, url]) => {
      const data: unknown = await this.loadJSON(url);
      result.json.set(key, data);
    });

    await Promise.all([...imagePromises, ...jsonPromises]);
    return result;
  }
}
