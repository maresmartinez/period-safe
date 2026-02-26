# CLAUDE.md — PeriodSafe Quick Reference

## Project Identity

**PeriodSafe** — local-first period tracker. No backend. Data never leaves the browser.
All user data is stored in IndexedDB / localStorage on the user's device only.

Master spec: `.claude/specs/PeriodSafe.md`
Progress tracker: `.claude/specs/overview.md`

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18+ |
| Build tool | Vite |
| Styling | Tailwind CSS (no component libraries) |
| Global state | React Context + useReducer (one context per domain: periods, settings, UI) |
| Storage | IndexedDB via `idb` library + localStorage |
| Testing | Vitest + React Testing Library + `fake-indexeddb` |
| Hosting | Vercel |
| CI/CD | GitHub Actions |
| Router | React Router v6 |

---

## Repo Structure

```
src/
  components/       # Shared UI primitives (Button, Card, Modal, Toast, etc.)
    calendar/       # Calendar view components
    period-form/    # Period logging form components
    settings/       # Settings page components
    import-export/  # Import/export page components
    navigation/     # Header, bottom nav, layout shell
  hooks/            # Custom React hooks
  utils/            # Pure utility functions (cyclePrediction.js, etc.)
  services/         # Data access layer (periodService.js)
  stores/           # Context providers / reducers
  assets/           # Static assets
  config.js         # App config (version, env flags)
  main.jsx          # Entry point
  App.jsx           # Root component + router
```

---

## Data Models

```js
// Schema version: 1
Period: {
  id: string,           // uuid
  startDate: string,    // ISO 8601 date
  endDate: string,      // ISO 8601 date (nullable)
  flow: 'light' | 'medium' | 'heavy' | null,
  symptoms: string[],   // e.g. ['cramps', 'fatigue', 'headache']
  mood: number,         // 1–5 integer (nullable)
  notes: string,        // free text (nullable)
  schemaVersion: 1
}

UserSettings: {
  cycleLengthAverage: number,   // days, default 28
  cycleVariance: number,        // days
  reminderEnabled: boolean,
  reminderDaysBefore: number,
  theme: 'light' | 'dark',
  schemaVersion: 1
}

Prediction: {
  id: string,
  predictedStartDate: string,   // ISO 8601 date
  confidence: number,           // 0–1
  basedOnLastNCycles: number,
  schemaVersion: 1
}
```

---

## Critical Rules

1. **No data transmission** — no fetch/XHR to external servers, ever
2. **No PII logging** — console logs must never contain dates, symptoms, or any user data
3. **WCAG 2.1 AA** — all interactive elements keyboard-reachable; color contrast 4.5:1 text / 3:1 large
4. **async/await + try/catch** — all IndexedDB and async operations must handle errors explicitly
5. **2-space indents, Prettier, ESLint** — enforced; no exceptions
6. **48px minimum touch targets** — all buttons/inputs on mobile
7. **No component libraries** — only Tailwind CSS for styling

---

## Service Layer Pattern

`src/services/periodService.js` is the single owner of all IndexedDB access.

```js
// Function naming convention:
getPeriod(id)           // → Period | null
getAllPeriods()          // → Period[]
createPeriod(data)      // → Period (with generated id)
updatePeriod(id, data)  // → Period
deletePeriod(id)        // → void

// Settings (localStorage):
getSettings()           // → UserSettings
saveSettings(data)      // → UserSettings

// DB init:
initDB()                // → IDBDatabase (called once on app start)
```

Error contract: all functions throw with a structured error `{ code, message }` on failure; callers must catch.

---

## Custom Hook Contracts

```js
usePeriodData()
  // Returns: { periods, loading, error, createPeriod, updatePeriod, deletePeriod }

usePeriodPrediction(periods)
  // Returns: { predictions, confidence, nextPredictedStart }
  // Requires >= 2 complete cycles; returns null values if insufficient data

useLocalStorage(key, defaultValue)
  // Returns: [value, setValue]
  // Syncs with localStorage; survives page refresh
```

---

## Commands

```bash
npm run dev          # Vite dev server at http://localhost:5173
npm run build        # Production build → dist/
npm run test         # Run all Vitest tests
npm run test:watch   # Watch mode
```

---

## Architectural Defaults (Recorded Decisions)

- **State:** React Context + useReducer — no Zustand or Redux; one context per domain (periods, settings, UI)
- **Router:** React Router v6
- **IndexedDB:** `idb` wrapper library (not raw IndexedDB API)
- **Encryption at rest:** Deferred post-MVP (TweetNaCl or libsodium.js are candidates)
- **Date library:** `date-fns` (if needed; prefer native Date where trivial)
- **No analytics, no error tracking** (e.g., no Sentry) for MVP

---

## Navigation

- Progress tracker: [`.claude/specs/overview.md`](.claude/specs/overview.md)
- Master spec: [`.claude/specs/PeriodSafe.md`](.claude/specs/PeriodSafe.md)
- Spec 01 — Project scaffold: [`.claude/specs/01-project-scaffold.md`](.claude/specs/01-project-scaffold.md)
- Spec 02 — IndexedDB storage: [`.claude/specs/02-indexeddb-storage.md`](.claude/specs/02-indexeddb-storage.md)
- Spec 03 — Period logging form: [`.claude/specs/03-period-logging-form.md`](.claude/specs/03-period-logging-form.md)
- Spec 04 — Calendar view: [`.claude/specs/04-calendar-view.md`](.claude/specs/04-calendar-view.md)
- Spec 05 — Cycle prediction: [`.claude/specs/05-cycle-prediction.md`](.claude/specs/05-cycle-prediction.md)
- Spec 06 — Settings: [`.claude/specs/06-settings.md`](.claude/specs/06-settings.md)
- Spec 07 — Import/export: [`.claude/specs/07-import-export.md`](.claude/specs/07-import-export.md)
- Spec 08 — UI design system: [`.claude/specs/08-ui-design-system.md`](.claude/specs/08-ui-design-system.md)
- Spec 09 — Navigation/layout: [`.claude/specs/09-navigation-layout.md`](.claude/specs/09-navigation-layout.md)
- Spec 10 — Accessibility audit: [`.claude/specs/10-accessibility-audit.md`](.claude/specs/10-accessibility-audit.md)
- Spec 11 — CI/CD deployment: [`.claude/specs/11-ci-cd-deployment.md`](.claude/specs/11-ci-cd-deployment.md)
- Spec 12 — Performance & polish: [`.claude/specs/12-performance-and-polish.md`](.claude/specs/12-performance-and-polish.md)
