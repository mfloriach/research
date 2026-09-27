This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## MongoDB content store

Page content (see `lib/content.ts` for types) lives in MongoDB. Start it with Docker Compose:

```bash
docker compose up -d
cp .env.example .env.local
```

Required environment variables (`MONGODB_URI`, `MONGODB_DB`):

| Variable      | Default                                                              |
| ------------- | -------------------------------------------------------------------- |
| `MONGODB_URI` | `mongodb://admin:admin123@localhost:27017/epistimology?authSource=admin` |
| `MONGODB_DB`  | `epistimology`                                                       |

Create collections/indexes and load the seed data:

```bash
npm run db:migrate
npm run db:seed     # runs the migration, then seeds from lib/content.ts
# or: npm run db:setup
```

`app/page.tsx` reads `site`, `heading`, `reportingCard` and `auditCard` from the
database on each request (`lib/content-db.ts`) and falls back to the static
content in `lib/content.ts` when the database is unreachable or unseeded.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
