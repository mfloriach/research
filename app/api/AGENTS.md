# API Guidelines

## Tech Stack

- TypeScript, Next.js
- MongoDB
- Zod

## Conventions

- Follow REST API naming conventions
- Write test for all API request validation
- Capture exceptions on the @app/middleware.ts not on the controller
- Do not add database queries on the @app/api, added to the ../server.repositories
- All database queries must be in ../server/repositories
- All API must be documented using OpenAPI stardards, after update run build openapi file.
- Reuse errors from `../lib/errors.ts`, if it is not possible ask me to create a new one.

## Project Structure

- `/api`: enpoints
- `/server/repositories`: database queries
- `../middleware.ts`: error handler
- `../lib/errors.ts`: error definition

## Build, Test, and Development

## Coding Style & Naming

## Testing Guidelines

## Configuration

Keep credentials and machine-specific values out of committed files. Add required configuration through environment variables and document any new variables and safe local setup steps in the README.
