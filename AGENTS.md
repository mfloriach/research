# Repository Guidelines

## Project Structure

This repository is a Next.js App Router site built with React and TypeScript. Route pages, the root layout, and global styles live in `app/` (`app/page.tsx`, `app/layout.tsx`, and `app/globals.css`). Reusable UI components are in `components/`; shared content helpers and data belong in `lib/`. Static files served directly are in `public/`. There is currently no dedicated test directory.

## Build, Test, and Development

Use npm, with dependencies recorded in `package-lock.json`:

- `npm run dev` starts the local development server at `http://localhost:3000`.
- `npm run build` creates the production build and checks Next.js compilation.
- `npm run start` serves the production build (run `npm run build` first).
- `npm run lint` runs ESLint across the project.

There is no test script configured yet. For changes, run the linter and production build as appropriate; add tests when introducing behavior that needs repeatable coverage.

## Coding Style & Naming

Follow the existing TypeScript and React patterns. Use two spaces for indentation, semicolons, and double quotes in TS/TSX, matching the current files. Use PascalCase for React component names and filenames where already established; existing component files use kebab-case (for example, `components/tabbed-card.tsx`). Keep reusable components in `components/`, and keep route-specific composition in `app/`. Prefer typed props and small, focused components. ESLint configuration is in `eslint.config.mjs`; run `npm run lint` before submitting.

## Testing Guidelines

No automated test framework or coverage threshold is configured. Validate UI changes in the local development server, and run `npm run build` to catch production compilation issues. If adding a test framework, document its command and place tests next to the feature or in a clearly named `tests/` directory.

## Commit & Pull Request Guidelines

The available Git history contains only the initial Create Next App commit, so no established commit convention is visible. Use concise, imperative commit subjects that describe one change (for example, `Add article card component`). Pull requests should explain the user-visible change, note relevant implementation details, link related issues when available, and include screenshots for visual changes. Mention the lint/build checks performed.

## Configuration

Keep credentials and machine-specific values out of committed files. Add required configuration through environment variables and document any new variables and safe local setup steps in the README.
