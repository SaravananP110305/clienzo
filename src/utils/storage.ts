// LocalStorage helper utilities for SaiFlow CRM Demo

export function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error("Error reading localStorage key:", key, error);
    return defaultValue;
  }
}

/**
 * Like getStorage, but re-seeds from defaultValue whenever the stored array
 * has fewer items than the current default. Use this for all master data
 * lookups so that newly added seed entries are always reflected.
 */
export function getMasterStorage<T extends unknown[]>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    const stored = JSON.parse(item) as T;
    if (Array.isArray(stored) && stored.length < defaultValue.length) {
      // Seed data has grown — refresh cache with latest default
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return stored;
  } catch (error) {
    console.error("Error reading localStorage key:", key, error);
    return defaultValue;
  }
}

export function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error setting localStorage key:", key, error);
  }
}
