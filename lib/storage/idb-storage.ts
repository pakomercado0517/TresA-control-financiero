/**
 * Storage adapter para IndexedDB usando idb-keyval
 * Compatible con Zustand persist middleware
 */

import { get, set, del, clear, keys } from 'idb-keyval';

export const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await get(name);
    return value ?? null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
  clear: async (): Promise<void> => {
    await clear();
  },
  getAllKeys: async (): Promise<string[]> => {
    const allKeys = await keys();
    return allKeys.map((key) => String(key));
  },
};

