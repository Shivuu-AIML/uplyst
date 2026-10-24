# FirstStep

FirstStep is a small, offline-friendly learning journey: choose a skill, follow a curated roadmap, finish an interactive first quest, and keep your progress and rewards across refreshes. Roadmaps are curated locally; the app does not claim to use live AI or require a server, account, or API key.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To create a production build, run `npm run build`; preview it locally with `npm run preview`.

## Deploy

Build the project with `npm run build` and deploy the generated `dist/` directory to any static host, such as GitHub Pages, Netlify, or Vercel. The app uses browser localStorage and makes no backend requests.

## Roadmap data

The four skill catalogs and their structured, level-aware quest content live in `src/roadmaps.js`. The exported validation helper checks generated-roadmap shape before it can be used. A future live generator can be added behind a server-side endpoint; never put provider credentials in frontend code. The curated catalogs remain the immediate fallback if a generator is unavailable.
