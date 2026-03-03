import { openDB, type IDBPDatabase } from 'idb';
import { DB_NAME, DB_VERSION } from '../config.ts';

let dbPromise: Promise<IDBPDatabase> | null = null;

export function initDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('periods')) {
          const periodStore = db.createObjectStore('periods', { keyPath: 'id' });
          periodStore.createIndex('startDate', 'startDate');
          periodStore.createIndex('endDate', 'endDate');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('intimacy')) {
          const intimacyStore = db.createObjectStore('intimacy', { keyPath: 'id' });
          intimacyStore.createIndex('date', 'date');
        }
      },
    });
  }
  return dbPromise;
}

export function resetDB(): void {
  dbPromise = null;
}
