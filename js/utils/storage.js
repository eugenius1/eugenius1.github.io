const storageTypes = {
  localStorage: 'localStorage',
  sessionStorage: 'sessionStorage'
}

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
function isStorageAvailable(type) {
  var storage;
  try {
    storage = window[type];
    var x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  }
  catch (e) {
    return e instanceof DOMException && (
      // everything except Firefox
      e.code === 22 ||
      // Firefox
      e.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      e.name === 'QuotaExceededError' ||
      // Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      (storage && storage.length !== 0);
  }
}

class ScopedStorage {
  constructor(scope, type = 'sessionStorage', allStringValues = false) {
    this.scope = scope;
    this.storage = window[type];
    if (allStringValues) {
      this.keyToType = null;
    } else {
      this.keyToType = new ScopedStorage('ScopedStorage__/', type, true);
    }
  }

  clear() {
    if (this.scope) {
      for (let i = 0; i < this.storage.length; ++i) {
        let rawKey = this.storage.key(i);
        if (rawKey.startsWith(this.scope)) {
          this.storage.removeItem(rawKey);
        }
      }
    } else {
      // if no scope, clear all
      this.storage.clear();
    }
    if (this.keyToType) this.keyToType.clear();
  }

  getItem(key) {
    let stored = this.storage.getItem(this.scope + key);
    // if the type wasn't originally a string, parse it back to its original type
    if (this.keyToType && (stored !== null) && (this.keyToType.getItem(key) !== 'string')) {
      stored = JSON.parse(stored);
      let originalType = this.keyToType.getItem(key);
      let parsedType = typeof (stored);
      if (parsedType !== originalType) {
        console.error(`ScopedStorage: getItem: Parsed stored value for key "${key}" to ${parsedType} type instead of ${originalType} originally`);
      }
    }
    return stored;
  }

  removeItem(key) {
    this.storage.removeItem(this.scope + key);
    if (this.keyToType) this.keyToType.removeItem(key);
  }

  setItem(key, value) {
    let valueAsString;
    if (typeof (value) === 'string') {
      valueAsString = value;
    } else {
      valueAsString = JSON.stringify(value);
    }
    this.storage.setItem(this.scope + key, valueAsString);
    if (this.keyToType) this.keyToType.setItem(key, typeof (value));
  }
}