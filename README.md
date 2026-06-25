# FashionistaAI

FashionistaAI is a React + Vite web app with an Express upload API that transforms an outfit photo into four AI-styled looks using Cloudinary Generative Replace, Generative Background Replace, Generative Restore, Generative Recolor, signed server-side upload, and eager transformations.

## Use cases

- **Fashion retail and lookbooks** — Let shoppers upload a photo and preview the same outfit in business, sporty, streetwear, or formal contexts without a separate photo shoot for each style.
- **Personal styling and inspiration apps** — Give users four distinct wardrobe directions from one image, then let them recolor a top or bottom interactively before sharing or saving.
- **Cloudinary GenAI integration reference** — Study a minimal full-stack sample that chains multiple generative effects, handles HTTP 423 polling while derivatives generate, and pre-warms variants with eager transforms at upload time.

## Tech stack

- [React 19](https://react.dev/) — UI components and state
- [Vite 6](https://vite.dev/) — frontend dev server and production build
- [Express 4](https://expressjs.com/) — secure image upload API
- [TypeScript](https://www.typescriptlang.org/) — typed frontend and shared logic
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) — unit and component tests
- [@cloudinary/url-gen](https://cloudinary.com/documentation/sdks/js/url-gen) — transformation URL builder
- [@cloudinary/react](https://cloudinary.com/documentation/react_integration) — `AdvancedImage` delivery component
- [Cloudinary Node SDK](https://cloudinary.com/documentation/node_integration) — signed `upload_stream` on the server

## Cloudinary features used

- `upload_stream` — streams the uploaded file from Express to Cloudinary using your API key and secret (signed upload; no upload preset required in this app)
- `eager` — pre-generates all four styled variants as named transformations when the source image is uploaded
- `eager_async` — runs eager transformations asynchronously so the upload response returns immediately while derivatives are still processing
- `gen_replace` — swaps detected garments (shirt and pants) with style-specific prompts such as “suit jacket for upper body” or “sport shorts for lower body”
- `gen_background_replace` — replaces the scene background using a natural-language prompt per style (office, gym, street, gala)
- `gen_restore` — reduces noise and imperfections after generative edits
- `gen_recolor` — recolors a specific detected object (shirt or pants) via natural-language prompt without affecting the rest of the image
- `c_fill` — crops and scales delivered images to a fixed 500×500 square for the preview grid and source thumbnail

## Prerequisites

Before you begin, ensure you have the following:

- **Node.js 20 or newer** (22 LTS recommended — see `.nvmrc`)
- **npm 10 or newer**
- A **Cloudinary account** with access to Generative AI transformations (Gen Replace, Gen Background Replace, Gen Restore, Gen Recolor)

## Environment variables

Create a `.env` file at the project root. Start from the template:

```bash
cp .env.example .env
```

Then set these variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloud name used by the Express server for signed uploads |
| `CLOUDINARY_API_KEY` | Yes | API key for server-side upload authentication |
| `CLOUDINARY_API_SECRET` | Yes | API secret for server-side upload authentication — keep server-only, never expose to the browser |
| `VITE_CLOUDINARY_CLOUD_NAME` | Yes | Cloud name used by the React app when building transformation delivery URLs with `@cloudinary/url-gen` |
| `PORT` | No | Express API port (default: `8000`) |

Example `.env` contents:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
PORT=8000
```

**Notes:**

- `VITE_`-prefixed variables are embedded in the frontend bundle at build time. Set them before running `npm run build` for production.
- Server credentials (`CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) are read only by `server.js` and are never sent to the client.

## Running the app

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in all required Cloudinary values listed above.

### 3. Start both servers (recommended)

```bash
npm run dev:all
```

This runs:

- **Vite frontend** at [http://localhost:3000](http://localhost:3000) — proxies `/api` requests to the backend
- **Express backend** at [http://localhost:8000](http://localhost:8000) — handles `POST /api/generate` uploads

### 4. Open the app

In your browser, go to **http://localhost:3000**.

### 5. Try the core flow

1. Click **Choose File** and select a photo of a person wearing a shirt and pants.
2. Wait for the upload spinner to finish — four style tiles appear labeled *business casual*, *sporty*, *streetwear*, and *elegant*.
3. Click any generated look to open the recolor dialog.
4. Choose **Top** or **Bottom**, pick a color, and click **Change Item Color** to apply `gen_recolor`.

### Run frontend and backend separately

```bash
npm run dev    # terminal 1 — Vite on port 3000
npm start      # terminal 2 — Express on port 8000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:all` | Start Vite and Express concurrently |
| `npm run dev` | Start Vite frontend only |
| `npm start` | Start Express backend with nodemon |
| `npm run build` | Type-check and build production frontend to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:ci` | Run all tests once with coverage |
| `npm run lint` | Run ESLint |

## Production checklist

| Step | Action |
|------|--------|
| Build | Run `npm run build` with production `VITE_CLOUDINARY_CLOUD_NAME` set |
| Host frontend | Deploy the `dist/` folder to your static host; ensure `/api` routes proxy to your Express server |
| Host backend | Deploy `server.js` with `CLOUDINARY_*` secrets configured in your host's environment |
| Health check | Confirm `GET /api/health` returns `{"status":"ok"}` |
| Smoke test | Upload an outfit image and verify four styled tiles load (may take several seconds while GenAI derivatives finish; the app retries on HTTP 423) |

## Verification

See [VERIFICATION.md](./VERIFICATION.md) for the full build, test, and Cloudinary functionality checklist.

## Additional documentation

- [UPGRADE.md](./UPGRADE.md) — dependency upgrade log and architecture notes
- [GITHUB_METADATA.md](./GITHUB_METADATA.md) — GitHub About description and topic tags for this repository

## Cloudinary Community

Connect with other developers on [Twitter](https://twitter.com/cloudinary), [Discord](https://discord.gg/cloudinary), or the [Community Forums](https://community.cloudinary.com/).

Learn more about Cloudinary GenAI at [ai.cloudinary.com](https://ai.cloudinary.com/).
