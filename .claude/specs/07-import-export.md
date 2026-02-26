# Spec 07 — Import / Export

## Goal

Build the Import/Export page that lets users download all their data as a JSON file and restore it by uploading a previously exported file. Includes shape validation, an overwrite-or-merge prompt, a full data clear function, and privacy-framing copy. Data never leaves the browser — all file operations are client-side only.

**Dependency:** Requires spec 02 (IndexedDB storage) and `clearAllPeriods()` service function. Requires spec 08 (design system) for `Button`, `Modal`, and `Toast` primitives.

---

## Deliverable Definition

- `src/components/import-export/ImportExportPage.jsx` — full UI
- `src/utils/dataTransfer.js` — pure functions for serialization, validation, and merging
- `src/utils/dataTransfer.test.js` — unit tests
- Tests for validation logic and merge strategy

---

## Scope

**In this slice:**
- Export: serialize all periods + settings to JSON; trigger browser file download
- Import: file picker → parse JSON → validate shape → overwrite-or-merge prompt → write to IndexedDB
- Shape validation: reject files that don't match the expected schema
- Overwrite-or-merge prompt: modal dialog with clear options
- Data clear: "Clear all data" button with confirmation modal
- Privacy-framing copy on the page

**Not in this slice:**
- Encrypted export/import (post-MVP)
- Automatic cloud backup
- Partial exports (e.g., date range filter)
- CSV format support

---

## Implementation Notes

### Export JSON shape

```json
{
  "schemaVersion": 1,
  "exportedAt": "2025-03-15T10:30:00.000Z",
  "appName": "PeriodSafe",
  "data": {
    "periods": [ /* Period[] */ ],
    "settings": { /* UserSettings */ }
  }
}
```

### Export function

```js
// src/utils/dataTransfer.js
async function exportData() {
  const periods = await periodService.getAllPeriods();
  const settings = settingsService.getSettings();
  const payload = {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    appName: APP_NAME,
    data: { periods, settings },
  };
  return JSON.stringify(payload, null, 2);
}
```

Trigger download using a temporary `<a>` element:
```js
function downloadJSON(jsonString, filename) {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;  // e.g., "periodsafe-export-2025-03-15.json"
  a.click();
  URL.revokeObjectURL(url);
}
```

### Import validation

```js
function validateImportShape(parsed) {
  // Must have: schemaVersion (number), data.periods (array), data.settings (object)
  // Each period must have: id (string), startDate (string)
  // Returns: { valid: boolean, errors: string[] }
}
```

Validation rules:
- `schemaVersion` must be a number and ≤ current `SCHEMA_VERSION`
- `data.periods` must be an array (may be empty)
- Each period must have `id` (string) and `startDate` (valid ISO date string)
- `data.settings` must be an object (null settings is recoverable — use defaults)
- Reject if file > 10MB (warn user; prevent browser freeze)

### Overwrite vs. Merge

Present a modal after validation succeeds:

**Overwrite:** Delete all existing periods, then import from file. Settings also replaced.

**Merge:** Add imported periods to existing data. Skip any period whose `id` already exists in the database (no duplicates). Settings from file are NOT applied in merge mode (keep current settings).

```js
async function importData(parsedPayload, strategy) {
  // strategy: 'overwrite' | 'merge'
  if (strategy === 'overwrite') {
    await periodService.clearAllPeriods();
    settingsService.saveSettings(parsedPayload.data.settings);
  }
  for (const period of parsedPayload.data.periods) {
    if (strategy === 'merge') {
      const existing = await periodService.getPeriod(period.id);
      if (existing) continue; // skip duplicates
    }
    await periodService.createPeriod(period);
  }
}
```

### Clear all data

Separate "Danger zone" section at the bottom of the page. Clicking "Clear all data" opens a confirmation modal:
- Heading: "Clear all data?"
- Body: "This will permanently delete all your logged periods. This cannot be undone. Export your data first if you want a backup."
- Buttons: "Cancel" (ghost), "Clear everything" (danger/red)

On confirm: calls `periodService.clearAllPeriods()` and `settingsService.resetSettings()`.

### Privacy-framing copy

Include at the top of the page:
> "Your data lives only on this device. Exporting gives you a backup you control. PeriodSafe never sends your data anywhere."

Include a lock icon (SVG or emoji) next to this message.

### File input approach

Use `<input type="file" accept=".json,application/json">` hidden, triggered by a styled button. On `change` event, read the file using `FileReader.readAsText()`.

### Test cases
- `validateImportShape` with valid payload → `{ valid: true, errors: [] }`
- `validateImportShape` with missing `data.periods` → `{ valid: false, errors: [...] }`
- `validateImportShape` with invalid period (missing `startDate`) → invalid
- `validateImportShape` with schemaVersion > current → invalid
- `exportData` produces JSON with correct envelope structure
- `importData` with `overwrite` clears existing and imports all
- `importData` with `merge` skips duplicate IDs; imports new ones
- Merge preserves existing settings

---

## Acceptance Criteria

- [ ] Export button triggers a JSON file download with correct filename (`periodsafe-export-YYYY-MM-DD.json`)
- [ ] Exported JSON contains `schemaVersion`, `exportedAt`, `appName`, and `data` envelope
- [ ] Import file picker accepts `.json` files only
- [ ] Invalid JSON file shows a user-facing error toast (no crash)
- [ ] Invalid shape (missing required fields) shows specific error message
- [ ] Valid import → overwrite/merge modal appears with clear options
- [ ] Overwrite: deletes existing periods and replaces with imported data
- [ ] Merge: skips periods with duplicate IDs; adds new ones
- [ ] Clear all data button shows confirmation modal; cancel does nothing; confirm deletes all
- [ ] Privacy-framing copy visible on page load
- [ ] All tests pass (`npm run test`)

---

## Slice Completion Checklist

Before marking this slice done, complete all three steps:

1. **Update `overview.md`:** Mark `07-import-export.md` checkbox as `[x]` and update the progress counter.

2. **Update `CLAUDE.md`:** Record the export JSON envelope shape, `validateImportShape` behavior (what it checks), and the two import strategies (`overwrite` vs `merge`).

3. **Update `README.md`:** Add "Import / Export" to the features list. Emphasize user data ownership and the privacy angle. Add export file format description.
