import { beforeEach, describe, expect, it } from 'vitest';
import { isStorageAvailable, ScopedStorage } from './storage';

beforeEach(() => {
  sessionStorage.clear();
});

describe('isStorageAvailable', () => {
  it('is true when storage works', () => {
    expect(isStorageAvailable()).toBe(true);
    expect(sessionStorage.length).toBe(0);
  });
});

describe('ScopedStorage', () => {
  it('returns null for missing keys', () => {
    expect(new ScopedStorage('a/').getItem('missing')).toBeNull();
  });

  it('round-trips strings that look like other types', () => {
    const storage = new ScopedStorage('a/');
    storage.setItem('text', '[not json');
    storage.setItem('digits', '123');
    expect(storage.getItem('text')).toBe('[not json');
    expect(storage.getItem('digits')).toBe('123');
  });

  it('round-trips objects, arrays, numbers and booleans', () => {
    const storage = new ScopedStorage('a/');
    storage.setItem('list', [{ id: 1 }]);
    storage.setItem('number', 3);
    storage.setItem('flag', false);
    expect(storage.getItem('list')).toEqual([{ id: 1 }]);
    expect(storage.getItem('number')).toBe(3);
    expect(storage.getItem('flag')).toBe(false);
  });

  it('keeps scopes apart', () => {
    const first = new ScopedStorage('a/');
    const second = new ScopedStorage('b/');
    first.setItem('key', 'one');
    second.setItem('key', 'two');
    expect(first.getItem('key')).toBe('one');
    expect(second.getItem('key')).toBe('two');
  });

  it('clears every key in its scope and leaves other keys', () => {
    const storage = new ScopedStorage('a/');
    sessionStorage.setItem('other', 'kept');
    storage.setItem('one', 1);
    storage.setItem('two', 2);
    storage.setItem('three', 3);
    storage.clear();
    expect(sessionStorage.length).toBe(1);
    expect(sessionStorage.getItem('other')).toBe('kept');
  });
});
