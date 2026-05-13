# Exchange Rate Frontend

React + TypeScript + Vite frontend for currency exchange rate analysis.
Client for [backend_exchange_jan](https://github.com/JanSeidel200/backend_exchange_jan).

**Live instance:** https://jan-exchange-fe.azurewebsites.net

---

## Table of contents

- [Features](#features)
- [Technology stack](#technology-stack)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Application structure](#application-structure)
- [API integration](#api-integration)
- [State persistence](#state-persistence)
- [Internationalization](#internationalization)
- [Testing](#testing)
- [Build and deploy](#build-and-deploy)
- [Project structure](#project-structure)

---

## Features

- **Login screen** with backend authentication (JWT Bearer token stored in localStorage).
- **Dashboard** with a form for choosing the base currency, watched currencies, and a date range.
- **Results table** showing the latest rate, average, minimum, maximum, and number of data points.
- **Interactive chart** of exchange-rate evolution (recharts line chart).
- **Logs panel** for the administrator — view of the latest server log entries.
- **Czech and English translation** with a language switcher (i18next, auto-detection).
- **Persistent settings** — selected currencies are saved on the server and restored after a new login (even from a different browser).
- **State survives view transitions** — switching between Analysis ↔ Logs does not discard the user's work.
- **Responsive design** suitable for desktop and smaller screens.
- **Test coverage** enforced at ≥ 80 % in CI.

---

## Technology stack

| Library | Version | Purpose |
|---|---|---|
| **React** | 19 | UI library |
| **TypeScript** | ~6.0 | Type checking |
| **Vite** | 8 | Build tool, dev server |
| **axios** | 1.x | HTTP client |
| **recharts** | 3.x | Charts |
| **i18next** | 26 | Internationalization |
| **react-i18next** | 17 | React binding for i18next |
| **Vitest** | 4 | Unit test runner |
| **Testing Library** | 16 | Component tests |

---

## Quick start

### Requirements
- Node.js 22+
- npm

### Run locally

```bash
# 1. Clone and enter directory
git clone https://github.com/JanSeidel200/frontend_exchange_jan.git
cd frontend_exchange_jan

# 2. Install dependencies
npm install

# 3. Configuration
cp .env.example .env
# Edit .env and set VITE_API_URL to the backend address

# 4. Dev server
npm run dev
```

The application runs at http://localhost:5173. The backend must be reachable at the URL configured in `VITE_API_URL` (default `http://localhost:8000/api`).

### Available npm scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Production build (`tsc -b && vite build`) |
| `npm run preview` | Preview of the production build |
| `npm run test` | Run tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | ESLint check |
| `npm start` | Serve the production build (port 8080) |

---

## Configuration

`.env` in the project root (or `.env.local` for a local override):

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000/api` | Backend API URL including the `/api` prefix |

Vite expands only variables prefixed with `VITE_` into the client bundle.

**Production example:**
```
VITE_API_URL=https://jan-exchange-api.azurewebsites.net/api
```

---

## Application structure

### Main screens

#### Login
Entry screen with fields for username (default `admin`) and password. On a failed attempt a translated error message is shown. The language switcher is also available before logging in.

#### Dashboard
After login the user sees:

- **Analysis form** on the left:
  - Dropdown for the base currency.
  - Checkbox grid for selecting watched currencies (restricted to the CNB list from the server).
  - Inputs for start and end date.
  - **Compute** button.

- **Results** on the right:
  - **Summary cards** showing the strongest and weakest currency.
  - **Detail table** with the latest rate, average, minimum, and maximum of every selected currency.
  - **Line chart** showing rate evolution over time.

#### Logs
Administrator view of the last 200 log entries from the server. Entries are color-coded by level (ERROR red, WARNING yellow, INFO grey).

---

## API integration

All communication with the backend is centralized in `src/api/client.ts`:

```ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
  withCredentials: true,
});

// Interceptor adds the Bearer token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("exchange_auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Exported functions

| Function | Endpoint | Purpose |
|---|---|---|
| `checkHealth()` | `GET /health` | Backend availability check |
| `login(username, password)` | `POST /auth/login` | Login, stores token in localStorage |
| `logout()` | `POST /auth/logout` | Logout, clears the token |
| `getCurrencies()` | `GET /currency/currencies` | List of supported currencies (CNB filter) |
| `analyzeRates(payload)` | `POST /currency/analyze` | Main analytical endpoint |
| `getLogs()` | `GET /logs` | Latest 200 log entries |
| `getSettings()` | `GET /settings` | Load saved preferences |
| `saveSettings(payload)` | `PUT /settings` | Save preferences |

### Authentication

The frontend stores the JWT token in `localStorage` under the key `exchange_auth_token`. The token is automatically added to the `Authorization: Bearer <token>` header on every request via an axios request interceptor.

---

## State persistence

### Server-side (survives application restart, shared across browsers)

The backend stores user settings (`base`, `symbols`) in `data/settings.json`. The frontend:

1. **After login** it calls `getSettings()` and pre-fills the form.
2. **On form change** it triggers a debounced (800 ms) `saveSettings()` to the server.
3. **On view switch** between Analysis ↔ Logs the form state survives because it is lifted up to the `App.tsx` component (lift state up).


### Client-side (survives page refresh)

- **JWT token** in `localStorage` — the user remains logged in until the token expires.
- **Chosen language** in `localStorage` (i18next-browser-languagedetector).

---

## Internationalization

### Configuration
`src/i18n/index.ts` configures i18next with automatic browser-language detection and a fallback to English.

### Translations
- `src/i18n/locales/cs.ts` — Czech
- `src/i18n/locales/en.ts` — English

The translation tree is hierarchical (`app.*`, `login.*`, `form.*`, `results.*`, `logs.*`, `language.*`).

### Usage in a component
```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t("app.title")}</h1>;
}
```

### Language switcher
The `LanguageSwitcher` component is available both on the login screen and in the dashboard header. The selected language is persisted in localStorage.

---

## Testing

### Run
```bash
npm run test                # One-off
npm run test:coverage       # With coverage report
```

After `test:coverage` the HTML report is available in `coverage/index.html`.

### Coverage threshold

In `vitest.config.ts`:
```ts
coverage: {
  provider: "v8",
  thresholds: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

### Test layout

| File | Covers |
|---|---|
| `src/api/client.test.ts` | HTTP client, token management, interceptor |
| `src/App.test.tsx` | Login flow, view switching, settings hydration, error handling |
| `src/components/LoginForm.test.tsx` | Render, successful / failed login, username change |
| `src/components/AnalysisForm.test.tsx` | Validation, submit, error states |
| `src/components/LanguageSwitcher.test.tsx` | Language switching |
| `src/components/LogsPanel.test.tsx` | Logs loading, error state, refresh |
| `src/components/ResultsTable.test.tsx` | Data render, placeholder, null values, empty stats |
| `src/components/ResultsChart.test.tsx` | Chart render, empty state |

### Testing tools

- **Vitest** with the jsdom environment.
- **Testing Library** for DOM queries and interactions.
- **@testing-library/jest-dom** for custom matchers (`toBeInTheDocument`, etc.).
- **vi.mock** for module mocking (e.g. `axios`, `../api/client`).

---

## Build and deploy

### Production build

```bash
npm run build
```

Output goes into `dist/`:
- Hashed JS bundles with code splitting.
- Minified CSS.
- Static assets from `public/`.

### CI/CD

#### Pipeline (`.github/workflows/ci.yml`)
On push / PR to `dev` or `main`:

1. **Checkout** the source.
2. **Set up Node 22** with npm cache.
3. **Install** dependencies (`npm ci`).
4. **Run tests** with coverage (`npm run test:coverage`).
5. **Upload** the coverage report as an artifact.
6. **Build** the production bundle.

#### Deploy (`.github/workflows/deploy.yml`)
On push to `main`, the bundle is deployed to an **Azure Web App** (Linux, Node 22 LTS).

### Azure Web App configuration

The live deployment uses an Azure Web App `jan-exchange-fe` (Linux, Node 22 LTS, B1 plan, Germany West Central). It serves the pre-built `dist/` directory through `serve`.

#### App settings (Environment variables)
```
VITE_API_URL=https://jan-exchange-api.azurewebsites.net/api
```

This must be set as a **build-time** variable in the CI workflow as well, because Vite bakes the value into the bundle at build time.

#### Startup command
In **Settings → Configuration → Stack settings → Startup Command**:
```
npx serve -s dist -l 8080
```

`-s` enables single-page-app mode (all routes fall back to `index.html`), `-l 8080` listens on the port Azure exposes.

---

## Project structure

```
frontend_exchange_jan/
├── src/
│   ├── main.tsx                     # Entry point, mounts React + i18n
│   ├── App.tsx                      # Root component, view routing, lifted state
│   ├── index.css                    # Global styles
│   ├── types.ts                     # Shared TypeScript types
│   ├── api/
│   │   ├── client.ts                # axios instance, API functions
│   │   └── client.test.ts
│   ├── components/
│   │   ├── LoginForm.tsx            # Login form
│   │   ├── AnalysisForm.tsx         # Analysis form (state lifted into App.tsx)
│   │   ├── ResultsTable.tsx         # Summary + statistics table
│   │   ├── ResultsChart.tsx         # Line chart (recharts)
│   │   ├── LogsPanel.tsx            # Logs view
│   │   ├── LanguageSwitcher.tsx     # CZ/EN switcher
│   │   └── *.test.tsx               # Tests for every component
│   ├── i18n/
│   │   ├── index.ts                 # i18next setup
│   │   └── locales/
│   │       ├── cs.ts                # Czech translations
│   │       └── en.ts                # English translations
│   ├── assets/                      # Static assets (logos, images)
│   └── test/
│       └── setup.ts                 # Vitest setup (jest-dom matchers)
├── public/                          # Public static files
├── .github/workflows/
│   ├── ci.yml                       # Test + build pipeline
│   └── deploy.yml                   # Azure deploy
├── .env.example                     # Template for environment variables
├── eslint.config.js                 # ESLint config
├── tsconfig.json                    # TypeScript config (root)
├── tsconfig.app.json                # TypeScript config (app code)
├── tsconfig.node.json               # TypeScript config (build tooling)
├── vite.config.ts                   # Vite config
├── vitest.config.ts                 # Vitest config + coverage thresholds
├── package.json
└── README.md
```