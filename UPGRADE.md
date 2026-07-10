# FashionistaAI Upgrade Log

## Target stack

| Layer | Version |
|-------|---------|
| Node.js | 22 LTS (minimum 20) |
| React | 19.x |
| Vite | 6.x |
| TypeScript | 5.9.x |
| Express | 4.22.x |
| Cloudinary Node SDK | 2.10+ |
| @cloudinary/url-gen | 1.22+ |
| @cloudinary/react | 1.14+ |

## Phase 1 — Audit & baseline

- Removed unused dependencies: `openai`, `react-markdown`, `react-player`, `node-fetch`, `fs`, `path`, `url`
- Added Vitest, Testing Library, MSW, and coverage tooling
- Added `.env.example`, `.nvmrc`, and `engines.node >= 20`
- Security fixes via dependency upgrades (axios, cloudinary, express, vite)

## Phase 2 — Application changes

### Extracted modules

- `shared/styles.js` — single source of truth for outfit styles and server eager transforms
- `src/lib/buildStyleLook.ts` — GenAI URL chain builder
- `src/lib/buildRecolorLook.ts` — recolor with explicit `shirt` / `pants` prompts
- `src/lib/preloadImage.ts` — HTTP 423 retry logic with max retries
- `src/lib/cloudinaryClient.ts` — env-driven Cloudinary client

### UI

- Split into `UploadForm`, `SourcePreview`, `StyleGrid`, `RecolorModal`
- Responsive 2×2 grid with style labels
- Accessible modal (`role="dialog"`, Escape to close)
- Consistent 500×500 image dimensions

### Server

- Upload validation (MIME type, 5 MB limit)
- Sanitized API response (`public_id`, `secure_url` only)
- Eager async transformations for all four styles at upload time
- `/api/health` endpoint

## Test coverage

```bash
npm run test:ci   # unit + component + server helper tests
npm run build
npm run lint
```

## Environment variables

Copy `.env.example` to `.env` and set:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `VITE_CLOUDINARY_CLOUD_NAME` (frontend delivery URL cloud name)

## Development

```bash
npm i
npm run dev:all   # Vite (:3000) + Express (:8000)
```

Or run separately:

```bash
npm run dev
npm start
```

## Rollback notes

- React 19: downgrade `react`, `react-dom`, and `@types/react*` if `@cloudinary/react` peer issues appear
- Vite 6: downgrade to Vite 5 if plugin incompatibility occurs
- Eager transforms: remove `eager` / `eager_async` from `server.js` upload options to restore client-only generation
