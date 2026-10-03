---
sidebar_position: 3
---

# Architecture

Epistimology is a structured argument-analysis app: reporting articles are read side by side with a typed audit of the same claims. This page describes the layers, the data flow, and where each responsibility lives.

## Layers at a glance

```text
┌─────────────────────────────┐
│  app/ (Next.js App Router)  │  pages, components, hooks
├─────────────────────────────┤
│  app/api/* (route handlers) │  REST endpoints
├─────────────────────────────┤
│  app/server/repositories/*  │  all MongoDB queries
├─────────────────────────────┤
│  lib/*                      │  shared, pure helpers (filters, sort, strings)
├─────────────── ─────────────┤
│  infra: MongoDB, IPFS,      │  external services
│  Anvil (EVM), LLM provider  │
└─────────────────────────────┘
```

The rule enforced throughout:

- No database query is written inside a route handler. All MongoDB access
  lives in `app/server/repositories/*`.
- No server-only module is imported from client components. `lib/config.ts`
  reads `process.env` once; everything else imports from it.
- Content strings and the canonical audit tabs live in `db/content.ts` so the
  UI is never hardwired to text scattered through components.

## Request flow: page content

```text
Browser
  │  GET /api/content
  ▼
Route handler (app/api/content/route.ts)
  │  getContentFromDb() (lib/content-db.ts)
  ▼
MongoDB  ──►  project docs into the Dossiers shape
  │  { argument, reportingCard, auditCard }
  ▼
Components   ──►  RoytisingAuditSection / ArticleList / CollapseList
```

`lib/content-db.ts` reads the storeddocuments and rebuilds the
`{ argument | reportingCard | auditCard }` view model. Because
`getContentFromDb()` throws when the collections are missing, `app/page.tsx`
catches and renders the static fallback defined in `db/content.ts`, so the app
degrades to a readable copy instead of a blank page.

## Request flow: search

```text
POST /api/search  { query }
        │
        ▼
lib/embeddings.ts  ──►  MiniLM (CPU, 384-dim) ──► query vector
        │
        ▼
MongoDB Atlas Vector Search  ──►  nearest article embeddings
        │
        ▼
LLM provider  ──►  answer + sources
        │
        ▼
Search modal in the navbar
```

## Read path: ordering and filtering

```text
GET /api/content
        │
        ▼
lib/content-filter.ts   type / label / date filters (?type=&labels=&sort=)
        │
        ▼
lib/audit-sort.ts       chart ordering on each audit card
        │
        ▼
React render
```

## Contract: one contract, two ledgers

```text
AttestationRegistry.sol  (Ownable)
        │
        ├── attest(itemId)            one per wallet per item
        ├── attestationCount(itemId)  read
        ├── hasAttested(id, acct)     read
        └── recordSignature(itemId, contentHash, signature, ipfsCid)
                  one per wallet per item
```

Item IDs are the app's UUIDs packed into `bytes16`. Every state-changing call
emits an event (`Attested`, `ItemProvenance`); the frontend read layer
(`app/hooks/use-attestation.ts`) counts events and `app/hooks/use-provenance.ts`
flat maps them into the per-wallet timeline on `/debate/provenance`.

## Where things live

| Area | Location |
| ---- | -------- |
| Pages, layouts | `app/**/page.tsx*`, `app/layout.tsx` |
| UI components | `components/*.tsx` |
| Client hooks | `app/hooks/use-*.ts` |
| Route handlers | `app/api/**/route.ts*` |
| MongoDB queries | `app/server/repositories/*.ts` |
| Pure helpers | `lib/*.ts` |
| Audit contract | `contracts/src/AttestationRegistry.sol` |
| Seed / migration | `db/seed.ts`, `db/migration.ts` |
| Content constants | `db/content.ts` |
| Docs site | `docs/` |

## The dossier panels

```text
┌──────────────────┬──────────────────┐
│  Reporting       │  Audit           │
│  ┌────────────┐  │  ┌────────────┐  │
│  │ Article 1  │  │  │ Contraarg  │  │
│  │  - expand  │  │  │ Fallacies  │  │
│  │  - byline  │  │  │ Evidences │  │
│  │  - views   │  │  │ Sources    │  │
│  │  - attest  │  │  │ Interpreta │  │
│  └────────────┘  │  └────────────┘  │
└──────────────────┴──────────────────┘
```

Each article shows its relative date, a per-article view count, and its
attestation count; expanding a card counts as an open. Audit cards share the
same attested/created-at semantics.
