# Repository Guidelines

## Project Structure & Module Organization
- Vite + React app keeps runtime code at the repository root; `index.tsx` bootstraps Supabase, drag-and-drop, and the schedule UI.
- Styling sits in `index.css`; `index.html` exposes the mount node; `metadata.json` and `README.md` describe the AI Studio packaging.
- Add reusable UI under a `components/` directory and pure helpers under `utils/` (create as needed) so `index.tsx` stays orchestration-only.
- Prefer the `@/*` TypeScript alias from `tsconfig.json` over deep relative imports.

## Build, Test, and Development Commands
- `npm install` — install dependencies defined in `package.json`.
- `npm run dev` — start Vite with hot reload at `http://localhost:5173`; confirms Supabase calls against the configured project.
- `npm run build` — emit optimized assets in `dist/`; run before deployment hand-offs.
- `npm run preview` — serve the production bundle locally for smoke testing.

## Coding Style & Naming Conventions
- Author TypeScript function components with React hooks; pull complex logic into helpers instead of JSX.
- Indent with two spaces and prefer single quotes; use `PascalCase` for types/components, `camelCase` for values/functions, and reserve `UPPER_SNAKE_CASE` for stable constants.
- Adopt Prettier or ESLint configs if formatting drifts, but keep them project-wide rather than file-local tweaks.

## Testing Guidelines
- No automated test runner ships yet; exercise drag-and-drop flows and Supabase reads/writes manually before merging.
- When adding coverage, start with `vitest` + `@testing-library/react`; co-locate specs as `*.test.tsx` beside the modules they verify and mock Supabase calls.
- Record manual validation steps (browsers, devices, data states) in the pull request until CI is in place.

## Commit & Pull Request Guidelines
- Follow conventional commits (`feat:`, `fix:`, `chore:`) as seen in `git log`; keep summaries under ~60 characters and explain context in the body if required.
- Pull requests should include a change summary, testing notes, and screenshots or GIFs for UI updates; link issues or Supabase migrations that drive the change.
- Request review before merging and wait on future CI/lint checks once introduced.

## Environment & Security Notes
- Store Supabase keys and other secrets in `.env.local`; rely on `import.meta.env` instead of hardcoding credentials.
- Rotate keys in the Supabase dashboard if exposure occurs and refresh `.env.local` before sharing preview links.
