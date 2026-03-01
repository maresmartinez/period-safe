# Changelog

PeriodSafe uses continuous deployment (CD) on Vercel — every commit to `main` is automatically deployed to production.


## Bug

- Prediction lengths too long


## Bug Fixes

- use official git-cliff-action for changelog generation

- correct toml syntax in cliff.toml

- add github token to checkout for push permission

- add write permissions to changelog workflow

- make commit type patterns case-insensitive


## Chores

- set up automated changelog with git-cliff


## Documentation

- update changelog


## Features

- replace mood number picker with emoji faces

- Add history page

- Add Week/Month/Year calendar views, and jumping to dates

- Show predicted cycle and duration


---

## Post-MVP (Backlog)

The following features are deferred beyond the current release:

- Encryption at rest
- Browser notifications
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
