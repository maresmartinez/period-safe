# Changelog

PeriodSafe uses continuous deployment (CD) on Vercel — every commit to `main` is automatically deployed to production. Changes are listed by deployment date, with commit SHAs for reference.

---

## 2026-03-01

- **feat:** Show predicted cycle and duration in calendar (`3d72ef6`)
- **fix:** Fix production site URL in README (`654b82b`)
- **feat:** Add Week/Month/Year calendar views and date jumping (`0ef420b`)
- **fix:** Adjust prediction window lengths (`8177da3`)

---

## 2026-02-27

- **feat:** Add history page to view past periods (`6997906`)
- **fix:** Rename footer link for clarity (`5657e6d`)
- **feat:** Replace mood number picker with emoji faces (`062c908`)
- **feat:** Add privacy philosophy page and footer (`c68f47f`)
- **feat:** Simplify footer with GitHub link (`fc3b01d`)
- **fix:** Update mood labels (Horrible instead of Really Bad) (`5546f30`)
- **fix:** Tidy up footer styling (`10e26cb`)
- **fix:** Remove promise about analytics; clarify future encryption plans (`d014800`)
- **fix:** Add custom favicon (`e2d26d3`)
- **fix:** Fix import statements (`ce9cf49`)
- **feat:** TypeScript migration — convert all JS to TS (`fbcef45`)

---

## 2026-02-26

- **feat:** Calendar month view with period visualization
- **feat:** Full period logging form (date, flow, symptoms, mood, notes)
- **feat:** Cycle prediction with confidence scoring
- **feat:** Settings page (cycle length, dark/light theme)
- **feat:** Import/export with overwrite/merge strategies
- **feat:** Error boundaries and graceful error handling
- **feat:** Navigation layout (header, bottom nav, routing)
- **feat:** CI/CD pipeline (GitHub Actions, Vercel integration)
- **feat:** Polish & performance (bundle size checks, perf tests, privacy banner)
- **feat:** UI design system (Button, Modal, Toast, Card components)
- **feat:** IndexedDB storage for periods and settings
- **feat:** Add edit period capability to calendar view

---

## Post-MVP (Backlog)

The following features are deferred beyond the current release:

- Encryption at rest (TweetNaCl.js or libsodium.js candidate)
- Browser notifications for upcoming periods
- Mobile app (PWA or native)
- Day-by-day flow tracking
- Secure data sharing
- Analytics dashboard
- Internationalization (i18n)

---

## Known Limitations

- All data is cleared if browser cookies/storage are wiped (by design)
- No sync across devices (local to each browser)
- Reminders are UI stub (no browser notifications)

---

## Tech Stack

- React 19 + Vite
- Tailwind CSS 4
- React Router v6
- TypeScript
- Vitest + React Testing Library
- Vercel deployment with GitHub Actions CI

---

