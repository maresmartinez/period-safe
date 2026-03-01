# Changelog

PeriodSafe uses continuous deployment (CD) on Vercel — every commit to `main` is automatically deployed to production. This changelog is automatically generated from conventional commits.

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

