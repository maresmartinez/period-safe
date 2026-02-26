# PeriodSafe

A local-first period tracking app. Your data never leaves your device — no accounts, no servers, no cloud sync.

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
