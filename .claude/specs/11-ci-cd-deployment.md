# Spec 11 — CI/CD & Deployment

## Goal

Set up a GitHub Actions workflow that runs tests and builds on every push, deploys to Vercel on merge to `main`, creates preview deployments on pull requests, and warns when the bundle size exceeds 100KB gzipped.

**Dependency:** All code slices (01–10) should be complete and tests passing before wiring up deployment.

---

## Deliverable Definition

- `.github/workflows/ci.yml` — test + build workflow for all branches/PRs
- `.github/workflows/deploy.yml` — Vercel deployment for `main` branch
- `vercel.json` — Vercel project configuration
- Bundle size check integrated into CI
- README "Deployment" section updated

---

## Scope

**In this slice:**
- GitHub Actions CI workflow: checkout → install → lint → test → build
- Vercel deploy workflow triggered on push to `main`
- Preview deploy for pull requests (using Vercel GitHub integration or CLI)
- Bundle size warning: fail CI if gzipped bundle > 100KB
- Environment variable pattern documented
- Branch protection rules documented (not automated — listed as manual step)

**Not in this slice:**
- Staging environment separate from preview deploys
- Automated E2E testing in CI (manual testing is sufficient for MVP)
- Sentry or error tracking integration
- CDN configuration beyond Vercel defaults

---

## Implementation Notes

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: ['**']
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --run  # non-watch mode for CI
      - run: npm run build
      - name: Check bundle size
        run: node scripts/check-bundle-size.js
```

### Bundle size check script

Create `scripts/check-bundle-size.js`:

```js
import { statSync, readdirSync } from 'fs';
import { gzipSync } from 'zlib';
import { readFileSync } from 'fs';

const LIMIT_KB = 100;
const distDir = './dist/assets';

const jsFiles = readdirSync(distDir).filter(f => f.endsWith('.js'));
let totalGzipped = 0;

for (const file of jsFiles) {
  const content = readFileSync(`${distDir}/${file}`);
  const gzipped = gzipSync(content);
  totalGzipped += gzipped.length;
}

const totalKB = (totalGzipped / 1024).toFixed(1);
console.log(`Bundle size: ${totalKB} KB gzipped`);

if (totalGzipped > LIMIT_KB * 1024) {
  console.error(`Bundle exceeds ${LIMIT_KB}KB limit (${totalKB} KB)`);
  process.exit(1);
}
```

Add to `package.json`:
```json
"scripts": {
  "check-size": "node scripts/check-bundle-size.js"
}
```

### `.github/workflows/deploy.yml`

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./
```

### `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Note: With `HashRouter`, the rewrite is less critical but good practice.

### Environment variables

For MVP, the app has no secrets. Document the pattern for future use:

```
# .env.local (not committed)
VITE_APP_ENV=development

# Vercel dashboard environment variables (production):
# VITE_APP_ENV=production
```

All environment variables in Vite must be prefixed with `VITE_` to be accessible in client code.

Access in code: `import.meta.env.VITE_APP_ENV`

### Vercel project setup (manual steps)

Document in `README.md` under "Deployment":
1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel` in project root to link to Vercel project
3. In Vercel dashboard → Settings → Environment Variables, add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` as GitHub Secrets
4. Enable "Preview Deployments" in Vercel dashboard for the repo

### Branch protection rules (manual — document only)

Recommend in README:
- Require PR to merge to `main`
- Require CI checks to pass before merge
- Require at least 1 reviewer (optional for solo project)

### Preview deploys for PRs

If using Vercel GitHub integration (recommended over GitHub Actions for previews):
- Install the [Vercel GitHub app](https://vercel.com/integrations/github)
- Vercel will automatically comment on PRs with a preview URL
- No additional GitHub Actions step needed for previews

---

## Acceptance Criteria

- [ ] `ci.yml` workflow runs on every push and PR
- [ ] CI runs lint → test → build in sequence
- [ ] Bundle size check script runs after build and outputs KB size to CI log
- [ ] Bundle size check fails CI if JS bundle > 100KB gzipped
- [ ] `deploy.yml` triggers on push to `main` only
- [ ] `vercel.json` exists with correct `outputDirectory: "dist"`
- [ ] Push to `main` triggers a Vercel production deploy
- [ ] PRs receive a Vercel preview URL comment
- [ ] `scripts/check-bundle-size.js` exists and runs without error on current build
- [ ] Environment variable pattern documented in README

---

## Slice Completion Checklist

Before marking this slice done, complete all three steps:

1. **Update `overview.md`:** Mark `11-ci-cd-deployment.md` checkbox as `[x]` and update the progress counter.

2. **Update `CLAUDE.md`:** Record the CI workflow steps (lint → test → build → size check), the Vercel deploy trigger (`push to main`), environment variable prefix (`VITE_`), and the `HashRouter` + `vercel.json` rewrite setup.

3. **Update `README.md`:** Add a "Deployment" section with: Vercel setup instructions (manual steps), GitHub Secrets required, branch protection recommendations, and how to read CI results on a PR.
