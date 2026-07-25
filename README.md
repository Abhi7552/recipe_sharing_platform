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

## Notes for going further

- Add password reset / email verification
- Add saved/bookmarked recipes (the `User.savedRecipes` field is already scaffolded)
- Move image storage to S3/Cloudinary for production durability
- Add rate limiting to auth routes
