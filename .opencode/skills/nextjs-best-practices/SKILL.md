---
name: nextjs-best-practices
description: Use when building production Next.js apps with App Router, Server Components, streaming, or metadata optimization.
---

# Next.js Best Practices

## When to Use This Skill
- Building layouts with nested routes and shared UI
- Choosing between Server Components and Client Components
- Implementing streaming with Suspense and loading states
- Optimizing metadata with the Metadata API
- Using parallel routes for complex layouts

## Workflow
1. Use App Router: `app/` directory with `page.tsx`, `layout.tsx`, `loading.tsx`
2. Default to Server Components — add `"use client"` only when needed
3. Stream data with `Suspense` boundaries and `loading.tsx` files
4. Add metadata: `export const metadata = { title: '...', description: '...' }`
5. Use parallel routes: `@analytics` slots for independent views
6. Optimize images: `next/image` with priority for above-the-fold
7. Cache with `revalidate` options or `unstable_cache`
8. Build and deploy: `next build && next start`

## Rules
- Keep Server Components as the default — minimize client-side JavaScript
- Use `loading.tsx` for every route segment with slow data fetching
- Don't fetch data in client components unless it requires browser APIs
- Use `next/image` for all images — never raw `<img>` tags
- Prefetch routes with `Link` for instant navigation
- Test with `next dev` and `next build` — they have different behaviors
