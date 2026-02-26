# PeriodSafe: Master Specification

*Last Updated: Feb 25, 2026*

---

## 1. Project Overview

### 1.1 Product Vision
This web app will be called Period Safe. This is a period tracking app that lets someone log their period dates, mood, and other notes about their period, and projects when their periods will start. The main philosophy of this app is that all storage is local, private, and secure. It should be possible to visit this website and store their period information, but it will not be stored on the cloud or shared with others. It should be possible to export data to json, and import if needed, but that decision should be in the hands of the user.

### 1.2 Success Criteria
- User can log a period start/end date in < 30 seconds from any device
- Period prediction accuracy within ±3 days of user's actual cycle
- 100% of user data remains local and is never transmitted to external servers

### 1.3 Project Constraints
- WCAG 2.1 AA accessibility standard minimum
- Never log any PII, everything for debugging is anonymous or privatized

---

## 2. MVP Scope & Features

### 2.1 Core User Features (MVP)
- Log period occurrence (start date, end date, optional: flow, symptoms, mood notes)
- View calendar visualization of past/predicted periods
- Simple cycle prediction based on historical data
- Import/export user data as JSON
- Local data persistence (no account/login required)

### 2.2 Feature Priorities
- **Must-have:** Period logging, calendar view, local storage
- **Should-have:** Symptom tracking, cycle prediction, export/import, light mode/dark mode
- **Nice-to-have:** Multiple cycle views (timeline, statistics), notifications, data backup to encrypted cloud

### 2.3 Out of Scope
- Social sharing or community features
- Multi-user/family accounts or sharing
- Integration with wearables or health platforms
- Cloud sync across devices
- Mobile app (web-responsive only for MVP)

---

## 3. System Design Parameters

### 3.1 Architecture Overview
- Frontend: SPA (React) with local-first architecture (no backend API required)
- Storage: IndexedDB for structured data, localStorage for UI state
- No server component; static site deployment (GitHub Pages, Vercel, Netlify). Preferrably Vercel

### 3.2 Data Model & Key Entities
- **Period:** { id, startDate, endDate, flow (light/medium/heavy), symptoms: [string], mood (int 1-5), notes }
- **UserSettings:** { cycleLengthAverage, cycleVariance, reminderEnabled, reminderDaysBefore }
- **Prediction:** { id, predictedStartDate, confidence, basedOnLastNCycles }

### 3.3 Key User Flows
- Flow 1: New user → Land on app → Log current period → View calendar with predictions
- Flow 2: Returning user → See calendar → Add period details → Confirm predictions updated
- Flow 3: Export data → Download JSON → Switch devices → Import JSON → Resume tracking

### 3.4 Performance Requirements
- Initial page load: < 2 seconds on 3G connection
- Period logging form submission: < 500ms
- Calendar render with 2+ years of data: < 100ms
- No performance degradation with 500+ logged periods

### 3.5 Security & Privacy Requirements
- All data encrypted in transit (HTTPS only)
- Optional: encryption at rest in IndexedDB (using TweetNaCl or libsodium.js, or other recommendations)
- No user authentication or account creation needed
- Data never leaves user's browser unless explicitly exported
- Clear privacy policy explaining local-only storage

---

## 4. Technology Stack

### 4.1 Frontend
- Framework: React 18+
- Build tool: Vite (fast dev experience)
- State: React Context API or Zustand (minimal overhead)
- UI library: Tailwind CSS; no opinionated component libraries to reduce bundle

### 4.2 Backend
- Backend: None required for MVP (fully client-side)

### 4.3 Database
- Primary: IndexedDB (browser-native, supports complex queries)
- Backup: localStorage for lightweight app state (theme, UI preferences)
- Schema versioning: Include version field in stored data for future migrations

### 4.4 Hosting & Infrastructure
- Hosting: GitHub Pages or Vercel (free tier sufficient for static site). Make recommendations for others. Leaning towards Vercel because I already use that.
- CI/CD: GitHub Actions auto-deployment on main branch
- Environments: dev (localhost), staging (preview branch), prod (main branch)

### 4.5 Third-party Services
- Minimal external dependencies (favor browser APIs)
- Optional: date-fns for date manipulation, chart-js for cycle visualization
- Avoid: analytics, crash reporting, or tracking libraries

---

## 5. UI/UX Guidelines

### 5.1 Design System
- Color palette: Soft, calming colors (avoid bright primary colors; use warm neutrals + accent color)
- Typography: Readable sans-serif (Inter, Open Sans) at 16px base font size
- Spacing: 8px base unit; consistent padding/margin multiples
- Components: Composable, small, semantic (Button, Card, Modal, Form)

### 5.2 Accessibility Standards
- Target: WCAG 2.1 AA compliance
- Keyboard navigation: All interactive elements reachable via Tab; visible focus indicators
- Screen reader: Semantic HTML, ARIA labels for charts/calendar, alt text for icons

### 5.3 Device Support
- Mobile-first responsive design
- Breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop)
- Touch-friendly: buttons/inputs min 48x48px, adequate touch spacing
- No native app; responsive web app only for MVP

### 5.4 User Experience Principles
- Simplicity: Minimal steps to log/view data; no required fields beyond start date
- Clarity: Clear feedback on actions (toast notifications, loading states)
- Error handling: Graceful fallbacks if data corrupts; user can clear/re-import
- Privacy reassurance: Visible indicator that data stays local ("🔒 Your data is stored locally")

### 5.5 Navigation & Layout
- Layout: Header (title, settings) → Main (calendar view) → Modals (log period, view details)
- Pages: Home (calendar), Period detail, Settings, Import/Export
- Navigation: Tab-based or sidebar; simple, not nested
- Mobile: Hamburger menu or bottom navigation if needed

---

## 6. Coding Standards & Guidelines

### 6.1 Code Organization
- Structure: `src/ { components/, hooks/, utils/, stores/, assets/, index.js }`
- Naming: `Button.jsx`, `useLocalStorage.js`, `periodService.js`
- Feature folders: Group related components/logic together (e.g., `calendar/`, `period-form/`)
- Avoid deeply nested paths; max 3 levels deep

### 6.2 Language-Specific Standards
- Formatter: Prettier (2-space indents)
- Linter: ESLint with React/Vue plugin
- Imports: ES modules; absolute paths from `src/`
- Async: async/await over .then(); error handling on all calls

### 6.3 Testing Requirements
- Unit: Vitest for utilities, services (≥70% coverage on critical logic)
- Integration: React Testing Library for components (user interactions, not implementation)
- E2E: Manual testing for MVP (optional: Playwright/Cypress for critical flows)
- No need to test UI snapshots; focus on behavior

### 6.4 Documentation Standards
- Comments: Only for "why", not "what"; code should be self-documenting
- README: Setup instructions, feature list, privacy statement, contributing guide. Intended for human audience.
- Code: JSDoc for exported functions; type hints (TypeScript comments or JSDoc)
- API docs: Inline comments for IndexedDB schema and data structures
- CLAUDE.md: Keep up to date with architecture, coding standards, and layout
- .claude/specs: keep specs thin sliced in this folder
- .claude/specs/overview.md: table of contents for spec files, reference names and general description of all other spec files. Keep check boxes for each spec file and make sure to tick off things as you go along. Meant to be a general overview of what claude still needs to do for MVP.

### 6.5 Version Control Conventions
- Commits: `feat: add calendar view`, `fix: correct cycle calculation`, `docs: update README`
- Branches: feature/*, bugfix/*, docs/*, chore/*
- PRs: Link to issues, self-review before requesting, squash before merge

---

## 7. Architecture & Design Patterns

### 7.1 Architectural Patterns
[MVC, MVVM, component-based, etc. and where applied]

**Examples:**
- Component-based (React): Reusable UI components, composable hierarchy
- Separation of concerns: UI components separate from business logic (hooks/composables)
- Stores/services: Centralized state and data access logic (IndexedDB, calculations)

### 7.2 Code Patterns & Conventions
- Hooks over HOCs (modern React pattern)
- Services/utils for data operations (e.g., `periodService.ts` handles IndexedDB operations)
- Error handling: Try/catch with user-facing messages; log errors to console in dev
- Custom hooks: `useLocalStorage`, `usePeriodPrediction`, `usePeriodData`

### 7.3 API Design
- No external API for MVP (client-side only)
- Internal: Service functions follow RESTful naming (e.g., `getPeriod(id)`, `createPeriod(data)`, `deletePeriod(id)`)
- Future: If backend added, use REST and version with `/api/v1/periods/`, `/api/v1/settings/` endpoints

### 7.4 State Management
- Server state: Period data in IndexedDB (single source of truth)
- Client state: UI state (modals open, selected period, form input) in React Context/store
- Caching: Periods loaded from IndexedDB once on app init; sync when user adds/modifies
- No complex middleware; direct function calls to services

---

## 8. Development Workflow

### 8.1 Environment Setup
- Node.js: 18+ LTS
- Package manager: npm
- Tools: Git, VS Code, ESLint, Prettier

### 8.2 Development Mode
- Run: `npm run dev` → Vite dev server on `http://localhost:5173`
- Hot reload: Automatic on file save (Vite HMR)
- Debugging: Browser DevTools (React DevTools plugin), console.log for quick debugging

### 8.3 Build & Compilation
- Build: `npm run build` → generates optimized `dist/` folder
- Tree-shaking: Remove unused code automatically
- Code splitting: Lazy-load route components if multi-page
- Bundle target: < 100KB gzipped for fast load

### 8.4 Error Handling & Logging
- Dev: All logs visible; verbose error messages
- Prod: Only errors logged; user-friendly error messages displayed
- No external error tracking (e.g., Sentry) for MVP
- Local error log: Optionally store last N errors in localStorage for user debugging

---

## 9. Testing Strategy

### 9.1 Unit Testing
- Framework: Vitest
- File naming: `utils/cyclePrediction.test.js` (colocated with source)
- Tests focus: Pure functions (date calculations, predictions, data transformations)
- Run: `npm run test` or `npm run test:watch`

### 9.2 Integration Testing
- Tool: React Testing Library (test components + IndexedDB interaction)
- Scope: Form submission (log period), calendar update, data persistence
- Mocking: Mock IndexedDB using `fake-indexeddb` package for isolated tests

### 9.3 E2E Testing
- MVP: Manual testing sufficient (no automated E2E required)
- Future: Consider Playwright for critical flows (log period → view on calendar → export)

### 9.4 Manual Testing
- Checklist: Log period (desktop/mobile), view calendar, import JSON, export JSON, clear data, refresh page (persistence check)
- Browsers: Chrome, Firefox, Safari (latest versions)
- Before deploy: Test on real mobile device if possible

---

## 10. Deployment & Infrastructure

### 10.1 Deployment Process
- Trigger: Merge to `main` branch auto-deploys to production
- Steps: Run tests → build → deploy to Vercel
- Staging: Optional preview deploy on pull requests

### 10.2 Environment Management
- Dev: `.env.local` file (not committed); contain API keys if ever needed
- Prod: No secrets needed for client-side only app; environment variables in Netlify/Vercel dashboard if needed
- Config: Version/API endpoint in `src/config.js` (switch between dev/prod)

### 10.3 Monitoring & Maintenance
- Monitoring: Vercel analytics (no external trackers)
- Uptime: Provide SLA or uptime target (e.g., 99.5%)
- Manual checks: Monthly load/performance test against production
- Maintenance: Update dependencies quarterly, monitor security advisories

### 10.4 Rollback Strategy
- Rollback: Revert commit and push to `main` (automatic re-deploy)
- Data safety: User data in IndexedDB unaffected; no server rollback needed
- Communication: Brief status message in case of outage (README or status page)

---

## 11. Critical Guardrails

### 11.1 Absolute Requirements
- All user data stays local; never transmitted to servers
- No login/authentication required
- Open-source; encourage transparency around privacy
- Support export so users never feel locked in

### 11.2 Known Constraints
- MVP constraint: No cloud sync; data tied to browser/device
- Browser support: Modern browsers only (ES2020+); no IE11
- Limitation: IndexedDB may clear if browser data is cleared; user import/export is safeguard
- No data migration path between devices without explicit export/import

### 11.3 Communication Protocol
[How Claude should ask clarifying questions, what decisions require human input]
- Ask for decisions on: UI/design choices (colors, wording), feature scope changes, architectural trade-offs
- Don't ask: Implementation details (variable names, refactoring decisions, test organization)
- Keep context tight: Provide link to relevant spec section when asking; avoid re-explaining
- If uncertain: Ask before implementing (e.g., "Should symptom tracking use checkboxes or free text?")

---

## Notes & Appendix

### Additional Context
- Reference: Period tracking UX patterns from common apps (Flo, Clue, Eve)
- Industry standard: Standard menstrual cycle is 21–35 days (average 28)
- Similar projects: Drip (open source), Periodix, Period Tracker Plus

### Glossary
[Domain-specific terminology used throughout specs]
- **Cycle:** Period from first day of menstruation to first day of next menstruation
- **Flow:** Amount of bleeding (light/medium/heavy)
- **Symptoms:** Physical or emotional experiences during period (cramps, mood, fatigue, etc.)
- **Prediction:** Algorithm-estimated next period start date based on historical cycle data
