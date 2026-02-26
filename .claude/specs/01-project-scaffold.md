# Spec 01 — Project Scaffold

## Goal

Bootstrap the PeriodSafe repository with a working Vite + React project that has Tailwind CSS, ESLint, Prettier, the full `src/` folder structure, and a blank shell that renders without errors. No business logic yet — this slice is purely infrastructure.

---

## Deliverable Definition

A repository where:
- `npm install` succeeds
- `npm run dev` starts the Vite server and the browser shows a blank PeriodSafe shell (title visible, no errors in console)
- `npm run build` produces a `dist/` folder without errors
- `npm run test` runs Vitest (zero tests pass, zero fail — the harness just needs to be wired up)
- ESLint and Prettier are configured and `npm run lint` passes on the initial codebase

---

## Scope

**In this slice:**
- Vite project init with React template
- Tailwind CSS v3 configuration
- ESLint (with `eslint-plugin-react`, `eslint-plugin-jsx-a11y`) + Prettier setup
- Full `src/` directory structure (empty placeholder files or `// TODO` stubs)
- `src/config.js` stub with app name and schema version constant
- `App.jsx` rendering a minimal shell: `<h1>PeriodSafe</h1>` inside a layout wrapper
- `main.jsx` entry point
- Vitest + React Testing Library wired up (no actual tests yet)
- `index.html` with correct title and Inter font link

**Not in this slice:**
- Any IndexedDB or localStorage code
- Any real components (Button, Calendar, etc.)
- Any routing
- Any state management
- Any CI/CD

---

## Implementation Notes

### Package versions (install these)
```bash
npm create vite@latest . -- --template react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install -D eslint eslint-plugin-react eslint-plugin-jsx-a11y prettier eslint-config-prettier
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Tailwind config
`tailwind.config.js` content paths must include `./src/**/*.{js,jsx}`.

### Prettier config (`.prettierrc`)
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### ESLint config (`.eslintrc.cjs`)
Extend: `eslint:recommended`, `plugin:react/recommended`, `plugin:react/jsx-runtime`, `plugin:jsx-a11y/recommended`, `prettier`.

### Vitest config
In `vite.config.js`, add:
```js
test: {
  environment: 'jsdom',
  setupFiles: ['./src/test-setup.js'],
  globals: true,
}
```
Create `src/test-setup.js` that imports `@testing-library/jest-dom`.

### `src/config.js`
```js
export const APP_NAME = 'PeriodSafe';
export const SCHEMA_VERSION = 1;
export const DB_NAME = 'period-safe-db';
export const DB_VERSION = 1;
```

### Directory structure to create
```
src/
  components/
    calendar/       (empty — .gitkeep)
    period-form/    (empty — .gitkeep)
    settings/       (empty — .gitkeep)
    import-export/  (empty — .gitkeep)
    navigation/     (empty — .gitkeep)
  hooks/            (empty — .gitkeep)
  utils/            (empty — .gitkeep)
  services/         (empty — .gitkeep)
  stores/           (empty — .gitkeep)
  assets/           (empty — .gitkeep)
  config.js
  test-setup.js
  main.jsx
  App.jsx
```

### `App.jsx`
Minimal shell — just render the title in a centered layout. No router yet.

```jsx
function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 p-4">
        PeriodSafe
      </h1>
    </div>
  );
}
export default App;
```

---

## Acceptance Criteria

- [ ] `npm install` exits with no errors
- [ ] `npm run dev` → browser shows "PeriodSafe" heading, zero console errors
- [ ] `npm run build` → `dist/` folder created, no build errors
- [ ] `npm run test` → Vitest starts and reports 0 test suites (or runs setup without failure)
- [ ] `npm run lint` → ESLint passes with no errors on the initial files
- [ ] All directories listed in the structure exist in `src/`
- [ ] `src/config.js` exports `APP_NAME`, `SCHEMA_VERSION`, `DB_NAME`, `DB_VERSION`
- [ ] Prettier is configured; running Prettier on `App.jsx` produces no diff

---

## Slice Completion Checklist

Before marking this slice done, complete all three steps:

1. **Update `overview.md`:** Mark `01-project-scaffold.md` checkbox as `[x]` and update the progress counter.

2. **Update `CLAUDE.md`:** Add/amend any facts discovered during implementation — e.g., exact package versions pinned, any deviations from the plan, Vite config options used, actual ESLint config shape.

3. **Update `README.md`:** Add human-facing setup instructions:
   - Prerequisites (Node 18+ LTS)
   - Clone + install steps
   - `npm run dev` instruction
   - Brief project description and privacy statement
