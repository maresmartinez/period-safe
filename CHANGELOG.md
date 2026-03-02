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


## Documentation

- remove copy around high/med prediction stability

- always show prediction info modal


## Features

- replace mood number picker with emoji faces

- Add history page

- Add Week/Month/Year calendar views, and jumping to dates

- Show predicted cycle and duration

- Manage uncertainty in predictions and show uncertainty warnings for irregular data

- add predictions for ovulation and fertility window

- redesign prediction cards for clarity


## Performance

- Filter periods to visible window before building date map

- Use event delegation for calendar cell clicks


## Bug

- do not allow periods to overlap


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
