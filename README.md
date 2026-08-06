# IG Follower Compare

Compare your Instagram followers and following lists. Upload two exported data files and instantly see **mutuals**, **not following back**, **only followers**, and **only following** — each with clickable links straight to the profiles.

## Features

- Upload `followers` and `following` files via drag & drop or file picker
- Parses Instagram data export CSVs (handles the standard `Username\nName` format)
- Four result sections, each color-coded:
  - **Mutuals** (green) — you follow them and they follow you
  - **Not Following Back** (orange) — you follow them, they don't follow you
  - **Only Followers** (blue) — they follow you, you don't follow them
  - **Only Following** (purple) — you follow them (not mutual)
- Every username links out to `https://instagram.com/<username>`
- Responsive UI built with Tailwind CSS

## Tech Stack

| Layer | Tech |
| ----- | ---- |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, TanStack Table, Axios |
| Backend (local dev) | Python 3.12, FastAPI, Pydantic, Uvicorn |
| Backend (Vercel) | Node.js serverless function (`api/index.ts`) |
| Deploy | Vercel Static (frontend) + Vercel Function (API) |

## Project Structure

```
IG-follower-compare/
├── api/
│   └── index.ts            # Vercel serverless API (compare + compare-files)
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.tsx         # Upload form + results grid
│   │   ├── api.ts          # Axios client
│   │   ├── env.ts          # API base URL (VITE_API_URL or "/")
│   │   └── components/
│   │       └── ResultsDisplay.tsx
│   └── package.json
├── server/                 # FastAPI backend (local dev only)
│   ├── main.py             # FastAPI app
│   ├── utils.py            # Parsing + comparison logic (Python)
│   ├── models.py           # Pydantic models
│   └── requirements.txt
├── vercel.json             # Vercel build & routing config
└── package.json            # Root workspace
```

## Getting the Instagram Data (Step by Step)

Follow these steps once to get your `followers` and `following` files, then upload them to the tool.

### Step 1 — Request the data download

1. Open Instagram on **mobile or desktop** and log in.
2. Go to your profile → **Settings** → **Accounts Center**.
3. Tap **Your information and permissions** → **Export your information** → **Create Export** → **Export to Device**.
4. Select your profile, then tick **Customize Information** → under **Connections**, tick ☑ **Followers and following**.
5. Set **Format** to *JSON* or *HTML* (this tool accepts both — JSON is recommended), and **MOST IMPORTANTLY**: set **Range** to **All time** so no data is missed.
6. Turn on **Email notification** so Instagram emails you when the download is ready, then tap **Submit request / Create files**.

> ⚠️ **Make sure Range is set to All time!** If you choose a limited date range, the export will only contain accounts from that period and the comparison results will be inaccurate.

### Step 2 — Wait for the email

- Instagram typically takes **from a few minutes up to a few days** to prepare the files.
- You'll get an email when it's ready, with a **Download** button/link.
- For large accounts the file can be several hundred MB, so it may take a while to download.

### Step 3 — Download the ZIP

1. Open the email and tap **Download your information**.
2. Instagram emails you a secure link (valid for ~4 days). Open it and download the ZIP archive.
3. Do **not** rename the ZIP or change the folder structure after unzipping.

### Step 4 — Unzip the archive

- **Windows:** right-click the ZIP → **Extract All...**
- **macOS:** double-click the ZIP (it auto-extracts).
- **Linux:** `unzip instagram-yourusername-*.zip`

After extracting you'll get a folder like `instagram-yourusername-YYYY-MM-DD_.../`. Inside it, find:

```
instagram-yourusername-.../
└── connections/
    └── followers_and_following/
        ├── followers_1.json     ← list of your followers
        └── following.json       ← list of accounts you follow
```

> The exact filenames can vary (e.g. `followers_1.json`, `following_1.json`, or `.html` versions). Pick the two files that contain **followers** and **following** respectively.

### Step 5 — Upload and compare

1. Open the tool and click (or drag & drop) the **followers** file into the **Followers** box.
2. Click (or drag & drop) the **following** file into the **Following** box.
3. Click **Compare Now**.
4. Browse the four sections — **Mutuals**, **Not Following Back**, **Only Followers**, **Only Following** — and click any username to open their Instagram profile.

### What files can the tool read?

The tool auto-detects the file type, so it accepts:

- **JSON** export — `followers_1.json` / `following.json` (recommended, standard download format)
- **HTML** export — `followers_1.html` / `following.html`
- **CSV** with a `Username` column
- Plain text copies of the follower/following tables

> 💡 You only need the two list files — no other part of the export is used. Don't upload photos, stories, or the entire ZIP.

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.12+
- npm (or pnpm/yarn)

### 1. Install dependencies

```bash
# Frontend + root workspace
npm install

# Backend
cd server
pip install -r requirements.txt
cd ..
```

### 2. Run the backend (FastAPI + Uvicorn)

```bash
npm run dev:backend
# or manually (from the project root):
python -m uvicorn server.main:app --reload --host 0.0.0.0 --port 8000
```

- API docs (Swagger UI): http://localhost:8000/docs
- Health check: http://localhost:8000/health

### 3. Run the frontend (Vite)

In a second terminal:

```bash
npm run dev:frontend
# or:
cd client
npm run dev
```

Open http://localhost:5173

### 4. Point the frontend at the local backend

**No setup needed** — the Vite dev server already proxies `/api/*` requests to the backend at `http://localhost:8000` (see `client/vite.config.ts`).

> Only if you run the backend on a different port, create `client/.env.local`:
>
> ```
> VITE_API_URL=http://localhost:8000
> ```
>
> If `VITE_API_URL` is not set, the frontend calls the API at the same origin (`/`), which is how it behaves in production on Vercel. Restart the Vite dev server after changing this file.

### Local build

```bash
npm run build            # builds client/ → client/dist
```

## Vercel Deployment

The project is configured for a single Vercel project: the React app is served as static files and `/api/*` requests are handled by the serverless function in `api/index.ts`.

### Option A — Deploy via CLI

1. Install the Vercel CLI:

```bash
npm install -g vercel
```

2. From the project root:

```bash
vercel            # preview deployment
vercel --prod     # production deployment
```

### Option B — Deploy via Git

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In the [Vercel Dashboard](https://vercel.com/new), click **Add New → Project**.
3. Import the repository.
4. Vercel auto-detects the config from `vercel.json`:
   - **Framework Preset:** Vite (or Other, since `vercel.json` controls the build)
   - **Build Command:** handled by `@vercel/static-build` (`npm run build` in `client/`)
   - **Output Directory:** `client/dist`
5. Click **Deploy**.

### Environment variables (optional)

| Variable | Where | Purpose |
| -------- | ----- | ------- |
| `VITE_API_URL` | Frontend (Vercel env) | Overrides the API base URL if the API is hosted elsewhere. Leave unset when deployed together (same origin `/`). |

### How routing works on Vercel

From `vercel.json`:

- `/api/*` → `api/index.ts` (serverless function)
- `/health` → `api/index.ts`
- Static assets (`*.js`, `*.css`, etc.) → `client/dist/`
- Everything else → `client/dist/index.html` (SPA fallback)

## API Endpoints

### `POST /api/compare-files`

Upload both files as multipart form-data:

```
followers:        (file)
following:        (file)
followerFileType: auto
followingFileType:auto
```

### `POST /api/compare`

Send the raw CSV/text content as form-data:

```
followers_content:  <text>
following_content:  <text>
followerFileType:  auto
followingFileType: auto
```

Both endpoints return:

```json
{
  "mutuals":       [{ "username": "bob",    "profile_url": "https://instagram.com/bob" }],
  "notFolback":    [{ "username": "charlie", "profile_url": "https://instagram.com/charlie" }],
  "onlyFollowers": [{ "username": "alice",   "profile_url": "https://instagram.com/alice" }],
  "onlyFollowing": [{ "username": "dave",    "profile_url": "https://instagram.com/dave" }]
}
```

## Notes

- All comparison happens server-side. Files are not stored anywhere.
- `api/index.ts` (Node) is used on Vercel; `server/` (FastAPI) is used for local development. The comparison logic is mirrored in both (`server/utils.py` and `api/index.ts`).
- Private Instagram accounts may not resolve when clicking through — this is normal.
