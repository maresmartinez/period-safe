# PeriodSafe

A private, local-first period tracking app. Your data never leaves your device — no accounts, no servers, no cloud sync.

**Live app:** [https://period-safe.vercel.app](https://period-safe.vercel.app)

---

## Privacy

🔒 **All data is stored exclusively in your browser's IndexedDB and localStorage.** No data is ever transmitted to any server. Your period history is yours alone.

---

## Features

- **Period Logging** — Log periods with start/end dates, flow intensity (light/medium/heavy), symptoms (cramps, fatigue, headache, bloating, mood swings, back pain, nausea, breast tenderness), mood (1–5 scale), and free-text notes. Create new entries or edit existing ones.

- **Month Calendar** — View all logged periods on a month grid. Click any period to see full details. Navigate between months smoothly. Keyboard navigation fully supported.

- **Cycle Prediction** — After logging 2+ periods, PeriodSafe automatically predicts your next period window based on your cycle history. Predictions include a confidence score and appear distinctly on the calendar. Irregular cycles (< 21 or > 35 days) are flagged as anomalies.

- **Settings** — Customize your average cycle length, toggle dark/light mode, and manage app preferences. All settings persist locally.

- **Import / Export** — Back up all your data as a plain JSON file with one click. Restore from a backup anytime using overwrite or merge strategies. You own your data — the export file is portable and can be stored anywhere.

- **Fully Accessible** — Keyboard navigation throughout, screen reader friendly, WCAG 2.1 AA color contrast, 48px+ touch targets on mobile.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS 4 |
| Storage | IndexedDB + localStorage |
| State | React Context + useReducer |
| Router | React Router v6 |
| Testing | Vitest + React Testing Library |
| Deployment | Vercel |

---

## Prerequisites

- Node.js 18 LTS or later
- npm 9 or later

---

## Setup & Local Development

### 1. Clone the repo

```bash
git clone https://github.com/your-username/period-safe.git
cd period-safe
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. Vite will hot-reload on file changes.

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server at http://localhost:5173 |
| `npm run build` | Build for production → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run all tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint source with ESLint |
| `npm run check-size` | Check gzipped JS bundle size (limit: 100KB) |

---

## Project Structure

```
src/
  components/          # UI components (Button, Card, Modal, etc.)
  hooks/               # Custom React hooks (usePeriodData, usePeriodPrediction, etc.)
  services/            # Data access layer (periodService, settingsService)
  stores/              # React Context providers
  utils/               # Pure utility functions (cyclePrediction, dateUtils, etc.)
  App.jsx              # Root component with routes
  main.jsx             # Entry point
  index.css            # Global styles + Tailwind
```

---

## Deployment

PeriodSafe is deployed to **Vercel** via GitHub integration.

### How it works

- **Production:** Every push to `main` auto-deploys to the production URL
- **Preview:** Every pull request gets a preview deployment with a unique URL
- **CI:** GitHub Actions runs lint → test → build → bundle-size check on every push/PR

### First-time setup

1. Fork or clone this repo on GitHub
2. Sign up at [vercel.com](https://vercel.com) and connect your GitHub account
3. Create a new Vercel project and select this repo
4. Vercel will auto-detect Vite and configure the rest

No environment secrets are required for MVP.

### Build settings in Vercel

- **Framework**: Vite
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Build Command**: `npm run build`
- **Development Command**: `npm run dev`

---

## Accessibility

PeriodSafe meets **WCAG 2.1 Level AA** standards:

- ✅ Full keyboard navigation (Tab, Arrow keys, Enter, Escape)
- ✅ Semantic HTML and ARIA labels throughout
- ✅ Color contrast ≥ 4.5:1 for text, ≥ 3:1 for large elements
- ✅ Touch targets ≥ 48px on mobile
- ✅ Screen reader friendly (tested with NVDA, JAWS, VoiceOver)
- ✅ Responsive design: 320px–2560px+

See [`.claude/specs/10-accessibility-audit.md`](.claude/specs/10-accessibility-audit.md) for the full audit.

---

## Testing

Tests are written with **Vitest** + **React Testing Library** using **fake-indexeddb** for IndexedDB simulation.

```bash
npm run test          # Run all tests once
npm run test:watch    # Run in watch mode
```

Key test suites:

- `src/components/**/*.test.jsx` — Component behavior tests
- `src/utils/**/*.test.js` — Business logic tests (cycle prediction, date utilities, etc.)
- `src/services/**/*.test.js` — Data access layer tests

---

## Contributing

Contributions are welcome! Here's the process:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes and add tests if applicable
4. Run `npm run lint` and `npm run test` — ensure all checks pass
5. Push to your fork and open a Pull Request

### Code style

- 2-space indentation
- ESLint + Prettier (auto-formatted on commit)
- No external component libraries — style with Tailwind only
- Async/await + try/catch for all I/O operations
- No PII logging — console logs must never contain user data (dates, symptoms, etc.)

---

## CLI / Manual Smoke Test

Before considering a release, run the manual smoke test:

```bash
npm run dev          # Start the dev server
# Then follow the steps in docs/smoke-test.md
```

Or in production:
1. Visit [https://period-safe.vercel.app](https://period-safe.vercel.app)
2. Follow [docs/smoke-test.md](docs/smoke-test.md)

---

## Performance

- **Bundle size:** < 100KB gzipped (checked by CI)
- **Calendar render:** 500 periods in < 200ms (tested)
- **Lighthouse scores:**
  - Performance: ≥ 90
  - Accessibility: 100
  - Best Practices: ≥ 90
  - SEO: ≥ 80

---

## Known Limitations (Post-MVP)

The following features are deferred beyond the MVP:

- Encryption at rest (TweetNaCl or libsodium.js candidate)
- Browser notifications for upcoming periods
- Mobile app (PWA or native)
- Period flow tracking (day-by-day granularity)
- Sharing encrypted data

---

## License

MIT License — see [LICENSE](LICENSE) file for details.

---

## Authors & Credits

**PeriodSafe** is built with care by developers who believe period data is sensitive and should never leave your control.

---

## Support & Feedback

- **Issues:** [GitHub Issues](https://github.com/your-username/period-safe/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-username/period-safe/discussions)
- **Email:** [contact@example.com](mailto:contact@example.com) (optional)

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

---

**Built with 💜 for your privacy.**


The app is deployed to [Vercel](https://vercel.com) via the Vercel GitHub integration.

### How it works

- **Production:** Every push to `main` triggers an automatic deploy to the production URL.
- **Previews:** Every pull request automatically gets a preview deployment. Vercel posts the preview URL as a PR comment.
- **CI:** GitHub Actions runs lint → test → build → bundle size check on every push and PR (see `.github/workflows/ci.yml`). The CI check must pass before merging.

### First-time setup

1. Install the [Vercel GitHub app](https://vercel.com/integrations/github) and link the repo.
2. In the Vercel dashboard, set **Output Directory** to `dist` (or rely on `vercel.json`).
3. Enable **Preview Deployments** in the Vercel project settings.

No GitHub Secrets are required — the Vercel GitHub integration handles authentication automatically.

### Branch protection (recommended)

In GitHub → Settings → Branches → Add rule for `main`:
- Require a pull request before merging
- Require the `CI` status check to pass before merging

### Environment variables

All Vite environment variables must be prefixed with `VITE_` to be accessible in client code.

```
# .env.local (not committed)
VITE_APP_ENV=development
```

For production, set environment variables in the Vercel dashboard under Settings → Environment Variables.
