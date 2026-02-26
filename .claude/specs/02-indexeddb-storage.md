# Spec 02 — IndexedDB Storage

## Goal

Implement the complete data persistence layer: initialize an IndexedDB database using the `idb` library, define all three object stores with the correct schema and indexes, and deliver `periodService.js` with full CRUD operations and a consistent error contract. Wire up `fake-indexeddb` so tests can run against a real-ish IndexedDB environment.

---

## Deliverable Definition

- `src/services/periodService.js` with all CRUD functions implemented and tested
- `src/services/db.js` handling DB initialization (called once on app start)
- `fake-indexeddb` configured in the test environment
- A Vitest test suite (`periodService.test.js`) with ≥70% coverage of the service functions

---

## Scope

**In this slice:**
- Install `idb` package
- Install `fake-indexeddb` as a dev dependency
- `src/services/db.js` — `initDB()` function that opens/upgrades the database
- `src/services/periodService.js` — all CRUD functions for periods
- `src/services/settingsService.js` — localStorage-based settings read/write
- Vitest test setup for IndexedDB (global fake-indexeddb shim in `test-setup.js`)
- Test file: `src/services/periodService.test.js`

**Not in this slice:**
- Any UI components
- Any React hooks that call these services (that's spec 03+)
- Prediction storage (predictions are computed on the fly, not persisted)
- Data migration logic (schema is v1 only)

---

## Implementation Notes

### Install
```bash
npm install idb
npm install -D fake-indexeddb
```

### Database schema

Three stores:
1. `periods` — keyPath: `id`, indexes: `startDate`, `endDate`
2. `settings` — keyPath: `key` (single record, key = `'userSettings'`)
3. `predictions` — keyPath: `id`, index: `predictedStartDate` (optional for MVP; compute on the fly)

```js
// src/services/db.js
import { openDB } from 'idb';
import { DB_NAME, DB_VERSION, SCHEMA_VERSION } from '../config.js';

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
```

### `periodService.js` function signatures and error contract

```js
// All functions are async. On failure, throw: { code: string, message: string }
// Error codes: 'DB_ERROR', 'NOT_FOUND', 'VALIDATION_ERROR'

getPeriod(id)           // → Period | null
getAllPeriods()          // → Period[] sorted by startDate descending
createPeriod(data)      // → Period (auto-generates id with crypto.randomUUID())
updatePeriod(id, data)  // → Period (merges data into existing record)
deletePeriod(id)        // → void
clearAllPeriods()       // → void (used by import/export spec 07)
```

### Period shape validation (in `createPeriod` / `updatePeriod`)
- `startDate` is required; throw `VALIDATION_ERROR` if missing or not a valid ISO date string
- `endDate` (if provided) must be >= `startDate`
- `flow` must be `'light'`, `'medium'`, `'heavy'`, or `null`
- `mood` must be integer 1–5 or `null`
- `symptoms` must be an array (default `[]`)
- Stamp `schemaVersion: SCHEMA_VERSION` on every record written

### ID generation
Use `crypto.randomUUID()` (available in all modern browsers + Node 18+).

### `settingsService.js`
```js
// Uses localStorage, not IndexedDB
const SETTINGS_KEY = 'periodSafe_userSettings';
const DEFAULTS = {
  cycleLengthAverage: 28,
  cycleVariance: 3,
  reminderEnabled: false,
  reminderDaysBefore: 2,
  theme: 'light',
  schemaVersion: 1,
};

getSettings()       // → UserSettings (returns DEFAULTS if not set)
saveSettings(data)  // → UserSettings (merges with existing, saves to localStorage)
resetSettings()     // → UserSettings (resets to DEFAULTS)
```

### Test setup for IndexedDB
In `src/test-setup.js`, add:
```js
import 'fake-indexeddb/auto';
```
This shims `indexedDB` globally so `idb` works in the Vitest/jsdom environment.

Reset the DB between tests using `IDBFactory` reset or by calling `initDB()` with a unique DB name per test.

### Test file coverage targets
- `createPeriod` — creates record, returns with id and schemaVersion
- `getAllPeriods` — returns empty array when no records; returns sorted array
- `getPeriod` — returns null for missing id; returns correct record
- `updatePeriod` — merges correctly; throws NOT_FOUND for bad id
- `deletePeriod` — removes record; no-ops on missing id
- `createPeriod` validation — throws VALIDATION_ERROR with missing startDate
- Settings CRUD — default values, save, retrieve

---

## Acceptance Criteria

- [ ] `npm install` — `idb` and `fake-indexeddb` installed
- [ ] `initDB()` creates the `periods` and `settings` object stores with correct indexes
- [ ] `createPeriod({ startDate: '2025-01-01' })` → returns object with `id`, `schemaVersion: 1`
- [ ] `getAllPeriods()` → returns array sorted by `startDate` descending
- [ ] `updatePeriod(unknownId, data)` → throws `{ code: 'NOT_FOUND', ... }`
- [ ] `createPeriod({ endDate: '2025-01-01' })` (missing startDate) → throws `{ code: 'VALIDATION_ERROR', ... }`
- [ ] `getSettings()` → returns default values when localStorage is empty
- [ ] `npm run test` → all service tests pass
- [ ] Zero use of raw `indexedDB` global — all access is through `idb`

---

## Slice Completion Checklist

Before marking this slice done, complete all three steps:

1. **Update `overview.md`:** Mark `02-indexeddb-storage.md` checkbox as `[x]` and update the progress counter.

2. **Update `CLAUDE.md`:** Record any facts discovered — exact `idb` version pinned, actual error code constants used, any schema deviations, the `fake-indexeddb` import pattern that works in the test environment.

3. **Update `README.md`:** No user-facing changes expected from this slice, but update the "Tech Stack" or "Data Storage" section if it exists to mention IndexedDB + `idb`.
