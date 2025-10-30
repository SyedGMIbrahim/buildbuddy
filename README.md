# BuildBuddy

An AI-assisted project scaffolding platform (similar to Lovable) that lets you describe what you want to build and generates a working app skeleton with components, pages, and data plumbing. Create projects, chat about changes, preview results, and iterate fast.

## Features
- Create Project flow with smart suggestions and keyboard submit (⌘/Ctrl + Enter)
- AI conversation thread per project (messages) with live updates
- Typed, cache-friendly data fetching with tRPC + TanStack Query + SuperJSON hydration
- Auth with Clerk and a compact, themed navbar
- Modern, accessible UI components (Radix-based)

## Tech Stack
- Framework: Next.js 15 (App Router) + React 19 + TypeScript
- Styling: Tailwind CSS v4, Radix UI primitives, custom UI kit
- Data: Prisma ORM (+ PostgreSQL), Zod validation
- API/Data Layer: tRPC v11, TanStack Query v5, SuperJSON
- Auth: Clerk (Sign-in/Sign-up modals, UserButton)
- Background/Agents: Inngest, @e2b/code-interpreter (optional integrations)
- Utilities: date-fns, lucide-react icons, sonner toasts, react-hook-form

## ER Diagram
Below is the current data model overview:

![ER Diagram](prisma/ERD.svg)

## Project Structure
- `src/app/` — App Router routes, layouts, API routes
   - `/` home, `/projects/[projectId]`, `/api/trpc/[trpc]`, `/api/inngest`
- `src/modules/` — Feature modules
  - `projects/` UI + server procedures
  - `messages/` UI + server procedures
- `src/trpc/` — tRPC server, router, query client, hydration helpers
- `src/components/` — Navbar, themed provider, UI components
- `src/lib/` — Prisma client, utilities
- `prisma/` — Prisma schema, migrations, ERD

## Getting Started
1) Install dependencies

```bash
npm ci
```

2) Configure environment variables in `.env`

Required (examples):

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/buildbuddy

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

3) Apply Prisma migrations and generate client

```bash
npx prisma migrate dev
npx prisma generate
```

4) Run the dev server

```bash
npm run dev
```

Open http://localhost:3000.

## Scripts
- `npm run dev` — Start Next.js dev server (Turbopack)
- `npm run build` — Production build (includes typecheck + lint)
- `npm start` — Start production server
- `npm run lint` — Lint the codebase

## Notes
- tRPC + TanStack Query hydration is wired via `src/trpc/server.tsx` and `getQueryClient()`.
- Some integrations (Inngest, E2B) are optional; provide credentials only if you use them.
- UI components are Radix-based and follow accessible patterns.
