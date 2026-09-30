# Repository Guidelines

## Tech Stack

- Next.js 16 with App route
- TypeScript
- Tailwind CSS with DaisyUI
- MongoDB
- Zod and react-hook-form

## Conventions

- Use functional components
- Follow REST API naming conventions
- Write test for all new components
- Capture exceptions on the @app/middleware.ts
- Do not add database queries on the @app/api
- All database queries must be in @app/server/repositories
- Do not add logic on the components use/create @app/hooks
- All API must be documented using OpenAPI stardards, after update run build openapi file.

## Project Structure

This repository is a Next.js App Router site built with React and TypeScript. Route pages, the root layout, and global styles live in `app/` (`app/page.tsx`, `app/layout.tsx`, and `app/globals.css`). Reusable UI components are in `components/`; shared content helpers and data belong in `lib/`. Static files served directly are in `public/`. There is currently no dedicated test directory.

## Build, Test, and Development

Use npm, with dependencies recorded in `package-lock.json`:

- `npm run dev` starts the local development server at `http://localhost:3000`.
- `npm run build` creates the production build and checks Next.js compilation.
- `npm run start` serves the production build (run `npm run build` first).
- `npm run lint` runs ESLint across the project.
- `npm test` runs the Jest unit suite (`--ci`); `npm run test:watch` reruns on change.

For changes, run the unit tests and linter as appropriate; add tests when introducing behavior that needs repeatable coverage.

## Coding Style & Naming

Follow the existing TypeScript and React patterns. Use two spaces for indentation, semicolons, and double quotes in TS/TSX, matching the current files. Use PascalCase for React component names and filenames where already established; existing component files use kebab-case (for example, `components/tabbed-card.tsx`). Keep reusable components in `components/`, and keep route-specific composition in `app/`. Prefer typed props and small, focused components. ESLint configuration is in `eslint.config.mjs`; run `npm run lint` before submitting.

## Testing Guidelines

Jest (`jest.config.mjs`, `next/jest` + jsdom) is the unit-test framework.
Colocate suites as `page.test.tsx` next to the page or component under test.
Wallet/sign/router/fetch dependencies are mocked per suite (see an existing
`app/debate/**/create/page.test.tsx` for the pattern); stub `@uiw/react-md-editor`
with a plain textarea. Run `npm test` for changes, and the linter plus
production build as appropriate. Validate UI changes in the local development
server. If adding coverage for backend behavior, prefer `forge test`
(`npm run contracts:test`) for contracts and repeatable scripts for API routes.

## Commit & Pull Request Guidelines

This repo follows [Conventional Commits](https://www.conventionalcommits.org/),
enforced locally by commitlint (husky `commit-msg` hook). Format:

```
<type>(<scope>): <subject>
```

- `type`: `feat` (new feature), `fix`, `docs`, `refactor`, `test`, `chore`
  (tooling/deps), `ci`, `style`, `perf`, `revert`.
- `scope`: the area touched — `api`, `web3`, `contracts`, `ui`, `db`,
  `hooks`, `deps`, `docs`, `ci`. Omit only when no scope fits.
- `subject`: concise, imperative, lowercase, no trailing period
  (for example, `feat(web3): add attest button to audit cards`).
- Breaking changes: append `!` after the scope and explain in the body,
  e.g. `feat(api)!: change debate response shape`, with a
  `BREAKING CHANGE:` footer describing the migration.

`release-please` builds `CHANGELOG.md`, bumps `package.json`, and tags
releases from these messages — so every user-facing change needs a `feat:`
or `fix:` commit, and anything that must not release uses `chore:`/`docs:`.

Pull requests should explain the user-visible change, note relevant implementation details, link related issues when available, and include screenshots for visual changes. Mention the lint/build checks performed.

## Configuration

Keep credentials and machine-specific values out of committed files. Add required configuration through environment variables and document any new variables and safe local setup steps in the README.
