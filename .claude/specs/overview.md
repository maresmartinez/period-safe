# PeriodSafe — Spec Overview & Progress Tracker

This file tracks implementation progress across all 12 MVP spec slices.
**How to update:** When a slice is complete, mark its checkbox `[x]` and update the "Status" column.
Each spec file contains a "Slice Completion Checklist" — follow it before considering a slice done.

---

## Implementation Progress

| # | Filename | Description | Done? |
|---|----------|-------------|-------|
| 01 | `01-project-scaffold.md` | Vite + React init, Tailwind, ESLint/Prettier, folder structure, blank shell | [x] |
| 02 | `02-indexeddb-storage.md` | IndexedDB init, schema, full `periodService.js` CRUD, test setup | [x] |
| 03 | `03-period-logging-form.md` | `PeriodForm` component — all fields, validation, wired to service, toasts | [x] |
| 04 | `04-calendar-view.md` | Month grid calendar, period ranges, modal detail, keyboard nav, ARIA | [ ] |
| 05 | `05-cycle-prediction.md` | `cyclePrediction.js` utility, `usePeriodPrediction` hook, calendar overlay | [ ] |
| 06 | `06-settings.md` | Settings page, `UserSettings` in localStorage, theme toggle, persistence | [ ] |
| 07 | `07-import-export.md` | JSON export/import, file download, shape validation, overwrite/merge prompt | [ ] |
| 08 | `08-ui-design-system.md` | Shared primitives: Button, Card, Modal, Toast, LoadingSpinner; Tailwind tokens | [x] |
| 09 | `09-navigation-layout.md` | App shell, Header, React Router v6 routes, bottom nav, lazy loading, 404 | [ ] |
| 10 | `10-accessibility-audit.md` | axe-core in Vitest, keyboard nav, ARIA audit, contrast check, screen reader | [ ] |
| 11 | `11-ci-cd-deployment.md` | GitHub Actions workflow, Vercel config, preview deploys, bundle size CI | [ ] |
| 12 | `12-performance-and-polish.md` | Lighthouse CI, error boundaries, perf check, privacy banner, smoke test | [ ] |

**Progress: 4 / 12 complete**

---

## Implementation Order (Critical)

> **Spec 08 (UI design system) is numbered late for logical grouping but must be implemented early.**
> Treat 08 as a dependency of spec 03 and beyond — implement it in parallel with or directly after spec 02.

Recommended build order:

```
01 (scaffold) → 02 (storage) + 08 (design system, in parallel)
                    └→ 03 (period form) → 04 (calendar) → 05 (prediction)
                    └→ 07 (import/export)
06 (settings) — after 03
09 (navigation) — threaded in during 03–07
10 (a11y) → 11 (CI/CD) → 12 (polish)
```

---

## Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | React Context + useReducer | No extra dependencies; one context per domain |
| Router | React Router v6 | Standard, well-supported |
| IndexedDB wrapper | `idb` library | Cleaner API than raw IndexedDB |
| Styling | Tailwind CSS only | No component libraries; reduces bundle |
| Encryption at rest | Deferred post-MVP | Adds complexity; not MVP-critical |
| Testing | Vitest + RTL + fake-indexeddb | Fast, Vite-native test runner |
| Deployment | Vercel | Already in use; free tier sufficient |

---

## Definition of MVP Complete

All 12 spec checkboxes are marked `[x]` **AND** the following manual smoke test passes:

- [ ] Log a period (all fields) on desktop Chrome
- [ ] Log a period on mobile Safari (real device or DevTools mobile)
- [ ] Verify period appears on calendar
- [ ] Verify prediction appears after 2+ periods logged
- [ ] Toggle light/dark mode; verify preference survives page refresh
- [ ] Export data as JSON; verify file downloads and contains correct shape
- [ ] Import exported JSON; verify periods re-appear in calendar
- [ ] Clear all data; verify calendar and predictions are empty
- [ ] Run full Lighthouse audit: Performance ≥90, Accessibility 100
- [ ] Run `npm run test` — all tests pass

---

## Spec Summaries

**01 — Project Scaffold:** Sets up the Vite + React project with Tailwind, ESLint, Prettier, and the full `src/` folder structure. Output is a blank app that renders without errors.

**02 — IndexedDB Storage:** Implements the `idb` wrapper, defines the three database stores (periods, settings, predictions) with indexes and schema versioning. Delivers the complete `periodService.js` CRUD interface with a `fake-indexeddb` test harness.

**03 — Period Logging Form:** Builds the `PeriodForm` component with all MVP fields: startDate (required), endDate, flow select, symptoms multi-select, mood 1–5 picker, and notes textarea. Validates and writes to `periodService.createPeriod`. Uses design system primitives from spec 08.

**04 — Calendar View:** Month grid calendar showing logged period date ranges, month navigation, a read-only period detail modal on cell click, full keyboard navigation, ARIA grid semantics, and responsive layout from 320px up.

**05 — Cycle Prediction:** Pure `cyclePrediction.js` utility (average cycle length, variance, predicted window, confidence score) + `usePeriodPrediction` hook. Predicted periods render distinctly on the calendar from spec 04. Handles edge cases: fewer than 2 cycles returns no prediction; cycles outside 21–35 days are flagged.

**06 — Settings:** Settings page with `UserSettings` model stored in localStorage via `useLocalStorage`. Allows cycle length override, reminder toggle (UI only), and light/dark mode toggle using Tailwind `dark:` class strategy. Settings persist across page refresh.

**07 — Import/Export:** Import/Export page with JSON export (schema version + timestamp envelope), browser file download trigger, file picker import, shape validation, and an overwrite-or-merge prompt. Includes data-clear function and privacy-framing copy.

**08 — UI Design System:** Shared component primitives — `Button` (primary/secondary/ghost/danger variants), `Card`, `Modal` (focus trap + ESC close), `Toast`, `LoadingSpinner`. Tailwind color token config: warm neutrals + rose/mauve accent palette with dark variants. 8px spacing system, Inter font, 48px minimum touch targets.

**09 — Navigation/Layout:** `App.jsx` shell, `Header` component (title + settings icon), React Router v6 route definitions, bottom nav for mobile / tab nav for desktop, active route indicator, page-level lazy loading with Suspense, 404 fallback route.

**10 — Accessibility Audit:** axe-core integrated into Vitest, keyboard navigation checklist for all interactive elements, ARIA audit of calendar grid, color contrast verification (4.5:1 text, 3:1 large), screen reader test script, and remediation tracking.

**11 — CI/CD Deployment:** GitHub Actions workflow (test → build → deploy to Vercel), Vercel project configuration, preview deploys on PRs, bundle size CI warning trigger (>100KB gzipped), environment variable pattern.

**12 — Performance & Polish:** Lighthouse CI targets (Performance ≥90, Accessibility 100), React error boundaries, 500-period calendar performance check, privacy notice banner, manual smoke test checklist across Chrome/Firefox/Safari + real mobile, README finalization.
