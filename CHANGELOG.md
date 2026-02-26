# Changelog

All notable changes to PeriodSafe will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-02-26

### Added (MVP Release)

- **Period Logging** — Log periods with start/end dates, flow intensity, symptoms, mood, and notes
- **Month Calendar** — Interactive calendar view with period visualization and navigation
- **Cycle Prediction** — Auto-predicted period windows based on past cycles with confidence scoring
- **Settings** — Customizable cycle length and light/dark theme preference
- **Import/Export** — Full-featured data backup and restore with overwrite/merge strategies
- **Privacy Banner** — First-visit privacy disclosure explaining local-only data storage
- **Accessibility** — WCAG 2.1 Level AA compliant with full keyboard navigation
- **Performance** — Calendar renders 500+ periods in < 200ms; bundle < 100KB gzipped
- **Error Boundaries** — Graceful error handling with user-friendly fallback UI
- **Responsive Design** — Mobile-first design supporting 320px–2560px+ viewports
- **Local Storage** — IndexedDB + localStorage for zero-server, zero-account experience

### Tech Stack

- React 19 + Vite
- Tailwind CSS 4
- React Router v6
- Vitest + React Testing Library
- Vercel deployment

---

## Post-MVP (Backlog)

The following features are deferred beyond the MVP:

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
- Reminders are UI stub for MVP (no browser notifications)

---

