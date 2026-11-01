// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
export function isStorageAvailable(): boolean {
  let storage: Storage | undefined;
  try {
    storage = window.sessionStorage;
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage !== undefined &&
      storage.length !== 0
    );
  }
}

// sessionStorage with every key prefixed by a scope, keeping values' JSON types
export class ScopedStorage {
  constructor(private readonly scope: string) {}

  clear(): void {
    // collect first as removing shifts the storage's indexes
    const keys = Object.keys(sessionStorage).filter((key) => key.startsWith(this.scope));
    keys.forEach((key) => sessionStorage.removeItem(key));
  }

  getItem<T>(key: string): T | null {
    const stored = sessionStorage.getItem(this.scope + key);
    return stored === null ? null : (JSON.parse(stored) as T);
  }

  setItem(key: string, value: unknown): void {
    sessionStorage.setItem(this.scope + key, JSON.stringify(value));
  }
}
