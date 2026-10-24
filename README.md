# Uplyst

**Your next step starts here.** Uplyst helps college students, self-learners, and job seekers turn a learning goal into a clear, achievable path. Create a roadmap for a college subject, career skill, company-preparation goal, or certification. Each roadmap contains three phases and six actionable learning tasks with objectives, time estimates, suggested resources, exercises, and checkpoints. Completing a new task awards 20 XP once and unlocks the First Step achievement. Optional skill quizzes preserve the existing interactive feedback flow. Prototype progress is stored in browser localStorage; MongoDB is intentionally deferred.

The frontend is the existing React app with a Dashboard, My Roadmaps, Achievements, and AI Guide navigation. The Express API provides roadmap generation and quiz-quest completion. Roadmaps are generated with Gemini when configured and valid; otherwise the API returns a curated roadmap and labels it as curated. The API key is only read by the Node server. Category-specific learning plans and their progress are stored locally; company preparation is framed as suggestions, and certification plans direct learners to the current official exam guide.

## Run locally

Use Node.js 20.6 or newer.

1. Install dependencies: `npm install`
2. Optionally copy `.env.example` to `.env` and set `GEMINI_API_KEY` to a server-side Gemini API key.
3. In one terminal run `npm run server` to start Express on port 3001.
4. In another terminal run `npm run dev` to start Vite. Its `/api` proxy forwards requests to Express.

Without a key, the app works with the curated paths. The frontend also uses its existing local curated data if the API cannot be reached.

## API

- `GET /api/health` — readiness check.
- `GET /api/roadmaps/` — curated roadmap catalog.
- `POST /api/roadmaps/generate` — accepts a skill, level, goal, session ID, and optional category context; for example `{ "skill": "react", "level": "beginner", "goal": "Prepare for a frontend role", "category": "career", "context": { "role": "Frontend developer", "experience": "some-practice", "dailyMinutes": 30 }, "sessionId": "<uuid>" }`. Returns `{ roadmap, source, message? }`, where `source` is `gemini` or `curated`.
- `POST /api/quests/:questId/complete` — accepts `{ "sessionId": "<uuid>", "answer": 0 }`; validates the answer and awards 20 XP once per session and quest.

The API limits request-body size, validates inputs, constrains Gemini output, times out upstream generation, and returns generic errors. Local task rewards are protected against repeat completion in the browser's persisted progress. Quiz reward records and generated-roadmap registrations are in memory for this prototype and reset when the API process restarts. Add a durable store and authenticated learner identity before relying on server-side rewards across deployments.

## Test and build

```sh
npm test
npm run build
```

## Vercel deployment

Import the repository into Vercel. The root Vite app builds to `dist`, and `api/[...path].js` exposes the Express API. Set `GEMINI_API_KEY` in the Vercel project's Environment Variables; do not add it to any frontend environment file or public build setting. Redeploy after setting the variable. Vercel's in-memory function state is temporary, so MongoDB or another durable store is required for durable server-side reward protection.

## Future Angular frontend

The working React frontend has not been replaced. To migrate without risking it, scaffold Angular in a separate `frontend-angular/` directory, port the existing skill selection, roadmap, quiz, and progress screens, and configure Angular's development proxy to forward `/api` to the Express server. Keep both apps available until the Angular build passes the same API and journey checks; then point Vercel's frontend output to Angular's production build while retaining the Express function routes.
