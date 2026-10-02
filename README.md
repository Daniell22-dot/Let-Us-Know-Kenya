# LUK Kenya

**Let Us Know Kenya** - a platform for discovering Kenyan human and natural
resources: startups, research projects, podcasts, blog posts and resources.

Two-part application:

| Part | Stack | Location |
| --- | --- | --- |
| Frontend | React 18, Vite 7, React Router 6, Tailwind CSS 3 | `src/` |
| Backend | Node.js, Express 5, Sequelize 6, PostgreSQL | `server/` |

---

## Table of contents

- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Creating the admin account](#creating-the-admin-account)
- [Project structure](#project-structure)
- [API reference](#api-reference)
- [Authentication model](#authentication-model)
- [Database](#database)
- [Content categories](#content-categories)
- [Market data (NSE)](#market-data-nse)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Known issues and planned work](#known-issues-and-planned-work)

---

## Quick start

### Prerequisites

- **Node.js 18+** (developed against 22.x). `npm run dev` in `server/` uses the
  built-in `node --watch`, so no global tools are needed.
- **PostgreSQL 13+** running locally.

### 1. Install dependencies

```bash
# frontend
npm install

# backend
cd server && npm install
```

### 2. Configure environment files

```bash
cp .env.example .env
cp server/.env.example server/.env
```

Then edit `server/.env` and set at minimum:

```ini
DB_NAME=luk_kenya
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# 48+ random bytes. Generate one with:
#   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
JWT_SECRET=

# Used by `npm run create-admin`
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=choose-a-strong-password
```

Create the database if it does not exist yet:

```bash
psql -U postgres -c "CREATE DATABASE luk_kenya;"
```

### 3. Start both servers

Two terminals:

```bash
# Terminal 1 - API on http://localhost:5000
cd server && npm run dev
```

```bash
# Terminal 2 - frontend on http://localhost:3000
npm run dev
```

Open <http://localhost:3000>.

The Vite dev server runs on port **3000** (see `vite.config.js`) and proxies
`/api` and `/uploads` to `http://localhost:5000`, so the browser only ever makes
same-origin requests in development.

### 4. Create the admin account

```bash
cd server && npm run create-admin
```

This reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `server/.env`, creates the
account if needed, or promotes and password-resets it if it already exists. The
password is hashed by the `User` model hooks, so the plaintext is never stored.

Then visit <http://localhost:3000/admin> and sign in.

> **There are no built-in credentials.** Admin authorisation is enforced by the
> API, not the browser. Do not add admin passwords to any `VITE_*` variable -
> Vite inlines those into the public JavaScript bundle.

---

## Environment variables

### Frontend - `.env` (see `.env.example`)

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | No | API base URL. Leave empty for same-origin requests (recommended). Set only if the API lives on a different host, e.g. `https://api.example.com`. |

Any variable prefixed `VITE_` is embedded in the client bundle and is
therefore **public**. Never store a secret in one.

### Backend - `server/.env` (see `server/.env.example`)

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | HTTP port. Default `5000`. |
| `DB_NAME` | **Yes** | PostgreSQL database name. |
| `DB_USER` | **Yes** | PostgreSQL user. |
| `DB_PASSWORD` | **Yes** | PostgreSQL password. |
| `DB_HOST` | **Yes** | Database host. |
| `DB_PORT` | No | Database port. Default `5432`. |
| `JWT_SECRET` | **Yes** | Signing key for JWTs. The server exits immediately if unset. |
| `ADMIN_EMAIL` | For admin | Admin account created by `npm run create-admin`. |
| `ADMIN_PASSWORD` | For admin | Admin password. Minimum 8 characters. |
| `SERVER_URL` | For OAuth | Absolute origin of the API, e.g. `https://api.example.com`. Used to build the Google callback URL. |
| `FRONTEND_URL` | For OAuth | Absolute origin of the frontend. Used for post-login redirects. Defaults to `http://localhost:3000`. |
| `GOOGLE_CLIENT_ID` | No | Enables Google sign-in. Both this and the secret are required. |
| `GOOGLE_CLIENT_SECRET` | No | Enables Google sign-in. |

Google sign-in is **optional**. When these are blank the API starts normally and
logs a warning; the `/auth/google` routes return 404.

To enable it, register this exact redirect URI in the Google Cloud console:

```
{SERVER_URL}/api/v1/auth/google/callback
```

---

## Project structure

```text
.
|-- index.html                 Vite entry HTML
|-- vite.config.js             Dev server (port 3000) + /api proxy
|-- tailwind.config.js
|-- postcss.config.js
|-- .env.example
|
|-- public/                    Static assets copied verbatim into dist/
|   |-- Kenyan_logo.jpeg
|   `-- research-assets/       R analysis scripts, figures, PDFs
|
|-- src/                       Frontend
|   |-- index.jsx              React root
|   |-- App.jsx                Router + admin route guard
|   |-- styles/globals.css
|   |
|   |-- admin/                 /admin panel
|   |   |-- AdminLogin.jsx     Real server-backed sign-in
|   |   |-- AdminApp.jsx       Admin shell
|   |   |-- components/
|   |   `-- pages/             Dashboard, blog, podcasts, resources,
|   |                          startups, research, analytics
|   |
|   |-- public/                Visitor-facing site
|   |   |-- PublicApp.jsx      Routes + providers
|   |   |-- AuthContext.jsx    Visitor session (token in localStorage)
|   |   |-- HomePage.jsx, AboutPage.jsx, BlogPage.jsx, PodcastPage.jsx,
|   |   |   ResourcesPage.jsx, StartupPage.jsx, ResearchPage.jsx,
|   |   |   WatchlistPage.jsx, SearchResultsPage.jsx, LoginSuccess.jsx
|   |   |-- MarketPage.jsx       NSE dashboard (lazy-loaded, Recharts)
|   |   `-- components/       Header, Footer, cards, modals, review section
|   |
|   `-- shared/
|       |-- data/constants.js   Canonical category + sector taxonomies
|       |-- services/api.js    Single fetch wrapper + endpoint map
|       `-- utils/auth.js      Admin session helpers
|
`-- server/                    Backend (CommonJS)
    |-- index.js               Express app, middleware, routes, shutdown
    |-- create-admin.js        Seed/promote the admin account
    |-- drop_tables.js         Destructive schema reset (guarded)
    |-- .env.example
    |-- config/
    |   |-- db.config.js       Sequelize instance
    |   `-- passport.config.js Google OAuth strategy (optional)
    |-- models/                Sequelize models
    |   `-- MarketIssuer.js, MarketSnapshot.js
    |-- controllers/           Request handlers
    |-- routes/                Express routers
    |-- services/
    |   `-- nse.service.js     NSE ticker client, cache, normalisation
    |-- data/
    |   `-- nse-issuers.js     Seed names and sectors for NSE codes
    `-- middleware/
        |-- authJwt.js         verifyToken, isAdmin
        `-- upload.js          Multer with an extension/type allowlist
```

---

## API reference

Base path: `/api/v1`. The router is also mounted at `/api` for backwards
compatibility, but `/api/v1` is canonical.

Authentication is sent as a header:

```text
x-access-token: <jwt>
```

`Authorization: Bearer <jwt>` is also accepted.

### Public - no authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Create a visitor account. |
| `POST` | `/auth/login` | Sign in. Returns a JWT and the user record. |
| `GET` | `/auth/google` | Begin Google OAuth (404 if not configured). |
| `GET` | `/auth/google/callback` | OAuth callback. |
| `GET` | `/blogs` | List blogs. |
| `GET` | `/podcasts` | List podcasts. |
| `GET` | `/resources` | List resources. |
| `GET` | `/projects` | List research projects. |
| `GET` | `/projects/:id` | One research project. |
| `GET` | `/startups` | List startups. |
| `GET` | `/jobs` | List jobs. |
| `GET` | `/reviews?entityType=&entityId=` | List reviews. |
| `GET` | `/search?q=` | Search blogs, podcasts, resources and projects. |
| `POST` | `/startups` | Submit a startup for review. Always stored as `pending`. |
| `POST` | `/newsletter/subscribe` | Subscribe to the newsletter. |
| `POST` | `/activity` | Record a page-view event. |
| `GET` | `/market/overview` | Live NSE quotes, breadth, sector performance and movers. |
| `GET` | `/market/history?days=&ticker=` | Stored market history. Omit `ticker` for the composite series. |
| `GET` | `/api/health` | Health and database-connection check. |

### Visitor - requires a valid token

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/auth/profile` | Current user. Password excluded. |
| `POST` | `/blogs/:id/vote` | Upvote or downvote a blog. |
| `POST` | `/reviews` | Create a review. |
| `GET` | `/watchlist` | Current user's watchlist. |
| `POST` | `/watchlist` | Add `{ entityType, entityId }`. |
| `DELETE` | `/watchlist/:entityType/:entityId` | Remove an item. |

### Admin - requires a token whose user has the `admin` role

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/blogs` | Create a blog. |
| `PUT` | `/blogs/:id` | Update a blog. |
| `DELETE` | `/blogs/:id` | Delete a blog. |
| `POST` | `/podcasts` | Create a podcast. |
| `PUT` | `/podcasts/:id` | Update a podcast. |
| `DELETE` | `/podcasts/:id` | Delete a podcast. |
| `POST` | `/resources` | Create a resource. |
| `PUT` | `/resources/:id` | Update a resource. |
| `DELETE` | `/resources/:id` | Delete a resource. |
| `POST` | `/projects` | Create a research project. |
| `PUT` | `/projects/:id` | Update a research project. |
| `DELETE` | `/projects/:id` | Delete a research project. |
| `POST` | `/jobs` | Create a job. |
| `PUT` | `/jobs/:id` | Update a job. |
| `DELETE` | `/jobs/:id` | Delete a job. |
| `PUT` | `/startups/:id` | Update a startup. |
| `PUT` | `/startups/:id/approve` | Set status to `approved`. |
| `PUT` | `/startups/:id/reject` | Set status to `rejected`. |
| `DELETE` | `/startups/:id` | Delete a startup. |
| `DELETE` | `/reviews/:id` | Delete a review. |
| `POST` | `/auth/upload` | Upload an image, audio file or PDF (10 MB max). |
| `POST` | `/market/sync` | Fetch the live feed and record a daily snapshot per counter. |

---

## Content categories

Every category list lives in one place: `src/shared/data/constants.js`.

| Export | Used by |
| --- | --- |
| `CONTENT_CATEGORIES` | Blogs, podcasts |
| `RESOURCE_CATEGORIES.natural` / `.human` | Resources, by tab |
| `JOB_CATEGORIES` | Jobs |
| `PROJECT_CATEGORIES` | Research projects |
| `MARKET_SECTORS`, `SECTOR_COLORS` | Market sector grouping and chart colours |

`buildCategoryOptions(observed, canonical)` produces the filter list. It keeps
the canonical order, **drops canonical values that no record actually uses** so
filters do not offer empty results, and appends any legacy value that is not in
the canonical list rather than silently hiding existing content. This is why
the "Categories" counters on the blog, podcast and resource pages are now
accurate — they count real data instead of a hardcoded array length.

Adding a category means adding it to the canonical list. The database columns
are free-text strings, so no migration is needed.

---

## Market data (NSE)

The `/market` dashboard is backed by the official Nairobi Securities Exchange
ticker service, not a third-party aggregator.

**Source.** `POST https://nsenairobi.nse.co.ke/nseticker/api/v1/ticker` with the
body `{ "nopage": "true", "isinno": "<NSE_TICKER_ISINNO>" }`. This is the same
endpoint behind NSE's own embedded ticker on `nse.co.ke`. No API key and no
commercial subscription are required.

**Why the fetch is server-side.** NSE rejects requests that do not carry an
`Origin: https://www.nse.co.ke` header (other headers are irrelevant). Browsers
forbid JavaScript from setting `Origin`, so this call can only ever be made from
the API server. The frontend therefore never talks to NSE directly, which also
keeps the upstream host out of CORS and hides the call from ad blockers.

**What the feed provides.** Per counter: `price`, `prev_price`, `today_open`,
`today_high`, `today_low`, `today_close`, `volume`, `turnover`, `change`, plus a
market status and timestamp. Roughly 70 counters with a price come back.

**Normalisation the service applies.**

- Rows with no price are dropped.
- Several instruments share an issuer code (KPLC ordinary and preference lines,
  bonds, some duplicated rows). The most heavily traded instrument per code is
  kept so breadth and turnover are not double counted.
- NSE sometimes reports an `open` or `high` inconsistent with the traded range.
  Values are passed through unchanged, and the dashboard clamps the *drawn*
  range rather than silently rewriting the source numbers.

**Limitations, stated plainly.**

- There is **no free index data**. NSE sells official NSE 20 and NSE 25 levels
  through its paid Data Services subscription. The dashboard shows a
  **LUK Market Composite**, which is our own price-weighted average of every
  counter rebased to 100, and labels it as such. It is not the official index.
- The feed is a **live snapshot, not a history**. `POST /api/v1/market/sync`
  (admin only) records one row per counter per trading day, so trend charts
  start empty and fill in as the market is synced. Each day's row is
  overwritten by later syncs and converges to the official close.
- Sector and company names are not in the feed. Seed values live in
  `server/data/nse-issuers.js`, and codes missing from it are classified
  `Other` rather than guessed. The database is authoritative once a row exists:
  sync only fills a gap, so a sector you correct in `MarketIssuers` is never
  overwritten. Roughly half the counters are still unclassified, which is why
  the sector chart drops `Other` unless it is a large share of the market.
- This endpoint is undocumented and carries no stability guarantee. Treat a
  break as an expected maintenance task, and do not build other features on it.
- Prices are indicative and informational. Not investment advice.

**Keeping history current.** Call the sync from a scheduler, for example daily
after the close:

```
curl -X POST http://localhost:5000/api/v1/market/sync \
  -H "x-access-token: $ADMIN_TOKEN"
```

---

## Authentication model

Two independent sessions share one API:

- **Visitor session** - keys `luk_token` / `luk_user` in `localStorage`.
  Managed by `AuthContext` in `src/public/`.
- **Admin session** - keys `luk_admin_token` / `luk_admin_user` in
  `localStorage`. Managed by `src/shared/utils/auth.js`.

`src/shared/services/api.js` attaches whichever token it finds to every request,
so callers never handle headers manually.

Tokens are signed with `JWT_SECRET` and expire after 24 hours. The role is read
from the `role` claim that the server itself signed.

**The role is never taken from client input.** The admin guard in `src/App.jsx`
calls `verifySession()`, which asks `GET /auth/profile` and checks the role on
the record the server returns. A hand-edited `localStorage` value grants
nothing, and every admin API route independently re-checks the token.

### Google sign-in

The API mints a JWT and redirects to:

```text
{FRONTEND_URL}/login-success#token=<jwt>
```

The token sits in the URL **fragment**, which browsers never send to the server
and which therefore never appears in access logs or `Referer` headers.
`LoginSuccess.jsx` then validates it against `GET /auth/profile` and takes the
identity from the response - it never trusts any identity data supplied in the
URL.

### Security middleware

Applied in `server/index.js`:

| Middleware | Purpose |
| --- | --- |
| `helmet()` | Standard security response headers. |
| Rate limit - 500 req / 15 min | Global, mounted on `/api/`. |
| Rate limit - 50 req / 15 min | Authentication routes. |
| `cors()` | Cross-origin headers. |
| Body parsers | JSON and URL-encoded, capped at 10 KB each. |
| `trust proxy` | Set to `1` so `req.ip` is the real client behind a proxy. |

Uploads are stored under `server/uploads/` (git-ignored) with randomised UUID
filenames and served with `X-Content-Type-Options: nosniff` and
`Content-Disposition: attachment`.

---

## Database

PostgreSQL via Sequelize. Tables: `Users`, `Blogs`, `Podcasts`, `Resources`,
`Projects`, `Startups`, `Jobs`, `Reviews`, `WatchlistItems`, `Subscribers`,
`ActivityLogs`.

Startup moderation status is an enum with the values:

```text
published | draft | pending | approved | rejected
```

Public submissions via `POST /startups` are always stored as `pending`; the
`status` column is set by the server and cannot be supplied by the caller. An
admin promotes them to `approved` or `rejected`.

### Schema management

The schema is currently created by `sequelize.sync({ alter: true })` at server
startup. **`alter: true` performs introspective `ALTER TABLE` on every boot and
is not safe for production or for concurrent instances.** There are no
migrations yet - see [Known issues](#known-issues-and-planned-work).

To wipe the schema and start over (development only):

```bash
cd server
NODE_ENV=development npm run drop-tables -- --force
```

This is destructive and irreversible. It refuses to run when
`NODE_ENV=production`, requires `--force`, and asks you to type the database
name to confirm.

---

## Scripts

### Root (frontend)

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server with HMR on port 3000. |
| `npm run build` | Production build into `dist/`. |
| `npm run preview` | Serve the production build locally. |

### `server/` (backend)

| Command | Description |
| --- | --- |
| `npm start` | Run the API. |
| `npm run dev` | Run with `node --watch` (auto-restart). |
| `npm run create-admin` | Create or promote the admin account. |
| `npm run drop-tables` | Destructive schema reset. Requires `-- --force`. |

---

## Deployment

### Frontend

```bash
npm run build      # emits dist/
```

`dist/` is a static bundle. Serve it from any static host or CDN.

Because the API client defaults to same-origin `/api/v1`, either:

- Serve `dist/` and the API on the same origin (recommended), or
- Set `VITE_API_URL=https://api.example.com` at build time and add an origin
  allowlist to the API's CORS configuration.

The app uses HTML5 history routing, so the static host needs a rewrite of
unmatched paths to `/index.html` (Netlify `_redirects`, Vercel rewrites,
nginx `try_files $uri /index.html`).

### Backend

```bash
cd server
NODE_ENV=production npm start
```

Before deploying:

- Set a strong, unique `JWT_SECRET`.
- Set `SERVER_URL` and `FRONTEND_URL` to real HTTPS origins if using Google
  sign-in.
- Run behind a TLS-terminating reverse proxy. `trust proxy` is already set to
  `1` so rate limiting and activity logs see the real client IP.
- Do **not** rely on `sync({ alter: true })` in production. Add migrations
  first.

The process handles `SIGTERM`/`SIGINT`, stops accepting connections, drains the
pool and exits. It exits non-zero if the database cannot be reached at startup.
`GET /api/health` reports database connectivity for load-balancer checks.

---

## Known issues and planned work

A security and correctness review identified a number of issues beyond the
critical ones already fixed. These are **not yet addressed**.

### High priority

- **No pagination.** `GET /blogs`, `/projects`, `/startups` and `/jobs` return
  the entire table with no `limit`, ordering or pagination. A single request can
  exhaust API memory as the data grows.
- **Mass assignment on most controllers.** Blog, podcast, resource, project and
  job creation still pass `req.body` straight to Sequelize, so a client can set
  columns such as `status`, `views`, `likes` and `plays`.
  `startup.controller.js` has been fixed with an explicit allowlist; the others
  have not.
- **`GET /activity` leaks user activity.** It returns the most recent 100
  activity rows to any authenticated user, with no ownership filter and no admin
  check.
- **Activity tracking captures form input.** `useActivityTracker` posts input
  *values* to `/api/activity`, which can include anything typed into the login
  and submission forms. This is stored indefinitely and is a privacy problem.
  Consider removing value capture and adding a retention policy.
- **Review entity enum is missing `project`.** `Review.entityType` is
  `('blog', 'podcast')` but `ResearchPage` requests `project`, so research-page
  reviews return 500. Add `'project'` to the enum in `models/Review.js`.
- **Startup field names are mismatched.** The public submission form sends
  `industry`, `fundingStage` and `websiteUrl` while the model columns are
  `sector`, `stage` and `website`. The create endpoint maps them, but
  `StartupPage.jsx` still filters on `s.industry`, which means industry search
  never matches anything. Rename the columns or fix the reads.
- **Broken defence-in-depth middleware.** `xss()` and `hpp()` are registered
  *before* `express.json()`, so `req.body` is still `undefined` when they run
  and they sanitise nothing. `xss-clean` is also unmaintained since 2019. Either
  move them after the body parsers or remove them and sanitise at the controller
  and render layers.
- **`dangerouslySetInnerHTML` in `ResearchPage`.** Values are currently
  hardcoded literals so it is not exploitable, but the pattern is dangerous if
  that content ever comes from the API.
- **CORS allows every origin.** `cors()` is called with no allowlist.
- **Error handlers leak internals.**
  `res.status(500).json({ message: err.message })` appears in all controllers and
  can return SQL fragments and file paths.

### Maintenance

- **Replace `sync({ alter: true })` with migrations** (Sequelize CLI or Umzug).
- **No indexes** on any filtered or sorted column, and no foreign keys.
  `WatchlistItem` has no unique constraint on `(userId, entityType, entityId)`,
  so concurrent saves can create duplicates.
- **No soft deletes.** Every `destroy` is permanent.
- **No tests, linter or formatter.** There is no ESLint or Prettier
  configuration and no CI workflow.
- **No code splitting.** All route components are statically imported, so the
  admin panel ships to every visitor. Add `React.lazy` + `Suspense`.
- **8.45 MB of duplicated research assets.** `public/research-assets/` and
  `src/public/Reserch/Project/` are byte-identical (34/34 files match) and both
  are tracked in git. Delete one.
- **Broken images on the About page.** Team photos point at
  `/api/placeholder/96/96`, which does not exist.
- **`ResearchPage.jsx` references an undefined `api` import**, so dynamic
  research projects silently never load - the `ReferenceError` is swallowed by
  a surrounding `try/catch`.
- **Contradictory figure caption.** `ResearchPage`'s abstract states
  *Junonia oenone* was the most abundant species while its Figure 1 caption and
  data table both say *Papilio demodocus*. The abstract appears to be wrong.
- **Oversized uncompressed images** with no `loading="lazy"`, no explicit
  dimensions and no responsive variants.
- **A DevTools blocker in `index.html`.** It disables right-click, `F12` and
  `Ctrl+S`. This is not a security control - it is trivially bypassed - and
  blocking text selection harms accessibility and usability. Remove it.
- **Accessibility gaps.** Icon-only buttons lack accessible names, modals have
  no `role="dialog"` / focus trap / `Escape` handling, and some interactive
  `<div>`s are not keyboard reachable.
- **Unused code.** `models/index.js` exports every model twice
  (`db.models.Blog` and `db.blogs`) and consumers are inconsistent. The
  `mockDB.js` / `sampleData.js` localStorage layer and the `Jobs` API have no
  frontend consumer.
- **Dead dependency keys.** `server/.env` still carries SendGrid, Cloudinary,
  AWS and SMTP credentials for services no code reads and whose packages are not
  installed. Remove unused credentials.

### Dependency vulnerabilities

`npm audit` currently reports **24 advisories (13 high, 8 moderate, 3 low)**,
all with published fixes. Highest-impact direct dependencies to bump:

| Package | Where | Note |
| --- | --- | --- |
| `multer` | server | `>= 2.2.0` - 4 DoS advisories. |
| `express-rate-limit` | server | `>= 8.2.2` - IPv4-mapped IPv6 bypass. |
| `sequelize` | server | Multiple advisories. |
| `vite` | root | `> 7.3.4` - path traversal / file read in the dev server. |
| `postcss` | root | `>= 8.5.23` - source map disclosure, XSS. |
| `react-router-dom` | root | Upgrade past `6.30.5` - open redirect to XSS. |

Also consider removing the deprecated `xss-clean` and `hpp` packages, and
aligning `@vitejs/plugin-react` with Vite 7 (it currently declares a peer range
that excludes Vite 7).

---

## License

ISC
