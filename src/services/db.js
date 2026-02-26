import { openDB } from 'idb';
import { DB_NAME, DB_VERSION } from '../config.js';

let dbPromise = null;

export function initDB() {
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
      },
    });
  }
  return dbPromise;
}

export function resetDB() {
  dbPromise = null;
}
