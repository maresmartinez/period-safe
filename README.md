# PeriodSafe

A local-first period tracking app. Your data never leaves your device — no accounts, no servers, no cloud sync.

## Features

- **Period Logging** — Log periods with start/end dates, flow intensity (light/medium/heavy), symptoms (cramps, fatigue, headache, and more), mood (1–5), and free-text notes. Supports creating and editing entries.

- **Cycle Prediction** — Automatically predicts upcoming period start dates based on the average of your past cycles. Predictions appear directly on the calendar as a highlighted window, giving you advance notice of when your next period is likely to arrive. The prediction window widens or narrows based on how consistent your cycles have been. Irregular cycles (shorter than 21 days or longer than 35 days) are flagged. All prediction computation happens locally in your browser — no data ever leaves your device.

- **Import / Export** — Download a full backup of all your periods and settings as a JSON file with a single click. Restore from a backup at any time with two strategies: **overwrite** (replace all existing data) or **merge** (add new records while keeping existing ones, skipping duplicates). You own your data — the export file is a plain, portable JSON document that you can store anywhere. The file format includes a schema version and timestamp for future compatibility.

## Privacy

All data is stored exclusively in your browser's IndexedDB and localStorage. No data is ever transmitted to any server.

## Prerequisites

- Node.js 18+ LTS

## Setup

```bash
git clone <repo-url>
cd period-safe
npm install
```

## Running

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production → `dist/` |
| `npm run test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint source files |
| `npm run preview` | Preview production build locally |
