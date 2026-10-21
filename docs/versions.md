# VerdeScan Dependency & Platform Versions

*Pinned at Task T-001 (October 20, 2026)*

## Core Runtimes & Frameworks
| Dependency | Version / Target | Notes |
| :--- | :--- | :--- |
| **Node.js** | `>=20.12.0` (LTS) | Used for Cloud Functions 2nd gen and build tooling |
| **pnpm** | `^12.14.0` | Package manager for workspaces and single lockfile |
| **TypeScript** | `~5.7.0` | Strict mode enabled (`noAny`, strict null checks) |
| **Next.js** | `^15.0.0` / `React 19` | App Router for web shell, guide SSR, and client PWA |
| **Tailwind CSS** | `^4.0.0` | Mobile-first utility styling using design tokens |
| **Firebase Admin SDK** | `^12.0.0` | Cloud Functions backend operations |
| **Firebase JS SDK** | `^10.12.0` | Client Auth, Firestore, Storage, Analytics, App Check |
| **Zod** | `^3.24.0` | Canonical schema and input/output validation |
| **Dexie.js** | `^4.0.0` | IndexedDB client persistence and offline queue |
| **Vitest** | `^3.0.0` | Unit and integration test runner |
| **ESLint** | `^9.0.0` | Flat config linter across workspaces |

## Decision Log
- **2026-10-20**: Initialized monorepo workspaces for `apps/web`, `functions`, `packages/shared`, `packages/kb`, and `packages/eval`.
- **2026-10-20**: Pinned TypeScript strict mode with no `any` across all packages.
