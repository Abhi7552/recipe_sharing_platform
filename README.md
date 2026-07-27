# The Shared Table — Recipe Sharing Platform

A full-stack recipe sharing app: browse recipes, search by ingredient, upload your own recipes with photos, rate and review, and manage your personal "kitchen" of published recipes.

**Stack:** React (Vite) + Tailwind CSS on the frontend, Node.js + Express + MongoDB (Mongoose) on the backend, JWT auth, Multer for image uploads.

## Project structure

```
recipe-platform/
├── backend/          Express API + MongoDB models
│   ├── models/        User.js, Recipe.js
│   ├── routes/         auth.js, recipes.js
│   ├── middleware/     auth.js (JWT), upload.js (Multer)
│   ├── uploads/         recipe images are stored here
│   └── server.js
└── frontend/         React app (Vite)
    └── src/
        ├── pages/       Home, RecipeDetail, CreateRecipe, Login, Register, Profile
        ├── components/  Navbar, RecipeCard, RatingStars, SearchBar, ProtectedRoute
        └── context/     AuthContext (JWT session handling)
```

## 1. Prerequisites

- Node.js 18+
- A MongoDB database — either:
  - Install MongoDB Community locally (https://www.mongodb.com/try/download/community), or
  - Use a free MongoDB Atlas cluster (https://www.mongodb.com/cloud/atlas) and copy its connection string

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGODB_URI` — your local or Atlas connection string
- `JWT_SECRET` — replace with a long random string (e.g. `openssl rand -hex 32`)

Run it:
```bash
npm run dev      # with nodemon, auto-restarts on changes
# or
npm start
```

The API runs on `http://localhost:5000`. Uploaded recipe photos are served from `/uploads`.

## 3. Frontend setup

In a second terminal:
```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173` and proxies `/api` and `/uploads` requests to the backend automatically (see `vite.config.js`), so no extra env config is needed in development.

## 4. Build for production

```bash
cd frontend
npm run build     # outputs static files to frontend/dist
```

Serve `frontend/dist` with any static host (Vercel, Netlify, Nginx, etc.), and deploy `backend/` to a Node host (Render, Railway, Fly.io, a VM, etc.). In production, set:
- Backend `.env`: `CLIENT_URL` to your deployed frontend origin (for CORS)
- Frontend: point API calls at your deployed backend URL — e.g. by setting `VITE_API_URL` and updating `src/api/client.js`'s `baseURL`, or by hosting both behind the same domain/reverse proxy so the existing relative `/api` calls keep working.

## Features implemented

- **Auth** — register/login with hashed passwords (bcrypt) and JWT sessions
- **Recipe CRUD** — create, edit, delete (author-only) recipes with title, description, cuisine, difficulty, times, servings, ingredients, steps, and tags
- **Image upload** — recipe photos via Multer, served statically
- **Search & discovery** — full-text search, search by ingredient, filter by tag, sort by newest/top-rated/quickest, pagination
- **Ratings & reviews** — 1–5 star ratings with comments; one review per user per recipe, editable
- **Personal kitchen (profile)** — a user's own published recipes and stats
- **Responsive, distinctive UI** — a warm "recipe index card" visual language (Fraunces display serif, Public Sans body, IBM Plex Mono for data/ingredient quantities), interactive serving-size scaler, step checklist, and ingredient/tag pill chips — built mobile-first with Tailwind.

## Production hardening in this version

Bugs fixed / gaps closed since the initial build:

- **Security**: fixed a regex-injection / ReDoS bug where the `ingredient` and `cuisine` search filters passed raw user input straight into a MongoDB `$regex` — now escaped. Added `express-mongo-sanitize` to strip `$`/`.` operator-injection attempts from request bodies and query params. Added `helmet` for standard security headers.
- **Auth abuse protection**: added rate limiting — a strict limiter on `/api/auth/*` (20 req / 15 min) to slow down brute-force/credential-stuffing, and a looser one across the rest of the API.
- **Upload validation**: file filter now checks both MIME type *and* file extension (MIME type alone can be spoofed), and Multer errors (oversized file, wrong field) now return clear, specific messages instead of a generic one.
- **Fail-fast config**: server now validates `MONGODB_URI` and `JWT_SECRET` are set at startup and exits with a clear message rather than crash-looping under nodemon with a cryptic DNS error.
- **Graceful shutdown**: `SIGINT`/`SIGTERM` now close the HTTP server and MongoDB connection cleanly — needed for zero-downtime deploys and container orchestration.
- **Error handling**: centralized error handler no longer risks leaking internal error details for unexpected failures; only known, safe client errors (bad JSON, oversized upload, disallowed file type) return their message, everything else logs server-side and returns a generic 500.
- **CORS**: `CLIENT_URL` now supports a comma-separated list (useful for staging + prod frontends), instead of a single hardcoded origin.
- **Cross-origin images**: relaxed `helmet`'s default same-origin resource policy on `/uploads` so recipe photos still load when the frontend is deployed on a different domain than the API — and the frontend now resolves image URLs against the configured API origin (`VITE_API_URL`) instead of assuming same-origin, which would otherwise 404 in a real production deployment.
- **Frontend API URL**: no longer hardcoded to a relative `/api` path (which only worked via the Vite dev proxy) — configurable via `VITE_API_URL` for production.
- **Session expiry handling**: expired/invalid JWTs are now caught by an axios response interceptor that clears the stale token and redirects to sign-in, instead of the app silently failing requests.
- **Crash resilience**: added a React error boundary so an unexpected render error shows a recoverable screen instead of a blank white page.
- **Performance**: added missing MongoDB indexes (`author`, `tags`, `averageRating`) for the query patterns this API actually uses; added `compression` middleware; static uploads now cache for 7 days.
- **Observability**: added `morgan` request logging (dev-friendly format locally, combined/production format when deployed).

## Deploying with Docker

Each service has a `Dockerfile`, and `docker-compose.yml` at the project root wires them together with MongoDB for a production-like local run:

```bash
# from the project root, create a .env with at least JWT_SECRET=<a long random string>
docker compose up --build
```
- Frontend: http://localhost:8080
- Backend: http://localhost:5000
- MongoDB: persisted in a named Docker volume

For a real deployment, typically the frontend (static files) goes on a static host/CDN (Vercel, Netlify, S3+CloudFront) and the backend goes on a Node host (Render, Railway, Fly.io) with MongoDB Atlas — update `VITE_API_URL` and `CLIENT_URL` accordingly rather than relying on the compose file's `localhost` values.

## Notes for going further

- Add password reset / email verification
- Add saved/bookmarked recipes (the `User.savedRecipes` field is already scaffolded)
- Move image storage to S3/Cloudinary — local disk storage doesn't survive redeploys or scale across multiple server instances
- Add automated tests (Jest/Supertest for the API, React Testing Library for the frontend)
- Add structured logging (e.g. pino) and error monitoring (e.g. Sentry) for real production visibility
