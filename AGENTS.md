# AGENTS.md — VerdeScan Coding Agent Rules & Guidelines

## 🛑 The Constitution (Non-Negotiable Rules)
1. **Server-Side AI Only**: AI model calls MUST go through the server-side `diagnose` Cloud Function except in the explicitly marked prototype path. API keys and prompts NEVER ship in the client bundle.
2. **App Check Enforcement**: Every Firebase AI Logic call MUST be protected by Firebase App Check. Enforcement becomes mandatory from 2 November 2026.
3. **Dynamic Models**: Model IDs MUST be read from Remote Config, never hard-coded. Google retires Gemini model versions on a regular schedule.
4. **Offline-First**: The app MUST remain usable offline for browsing guides and viewing history.
5. **KB-Backed Advice**: Pesticide and chemical advice MUST be organic-first and MUST NOT output dosing from model memory; chemical guidance only comes from reviewed knowledge-base entries referencing product labels.
6. **Privacy by Default**: User photos MUST have EXIF location data removed before upload (via canvas re-encoding).
7. **Safety First**: Every diagnosis response MUST carry a `confidence` value (0..1) and a `safetyNotes` array, even when empty.

---

## 🏗️ Repository Layout
```
verdescan/
├── apps/
│   └── web/                 # PWA UI (Next.js App Router), camera capture, offline cache, i18n
│       ├── src/
│       │   ├── app/         # Next.js App Router routes
│       │   ├── components/  # UI components
│       │   ├── features/    # diagnose, garden, guides, auth, settings
│       │   ├── lib/         # Firebase client, i18n, offline db (Dexie), analytics
│       │   └── sw/          # Service worker source (Workbox)
│       └── public/          # manifest.webmanifest, icons, static assets
├── functions/               # Cloud Functions 2nd gen (Node 20, TypeScript)
│   └── src/
│       ├── diagnose/        # Orchestrator, prompts, schema, safety, calibration
│       ├── kb/              # Retrieval and indexing (vector search)
│       ├── moderation/      # Input/photo validation and safety checks
│       ├── notifications/   # Reminders and advisories (FCM)
│       └── index.ts         # Callable function exports
├── packages/
│   ├── shared/              # Zod schemas and TypeScript types (Single Source of Truth)
│   │   └── src/             # models.ts, api.ts, errors.ts, constants.ts
│   ├── kb/                  # Knowledge Base source (Markdown + YAML frontmatter) & scripts
│   │   ├── content/         # crops/, problems/, treatments/, guides/, i18n/
│   │   └── scripts/         # validate, seed, translate
│   └── eval/                # Golden-set accuracy runner & evaluation reports
│       ├── golden/          # Labelled images + labels.json
│       └── src/             # runner, metrics, gates
├── docs/                    # Architecture, versions, and decision logs
├── firebase.json            # Emulators, hosting, firestore, storage configs
├── firestore.rules          # Security rules for Cloud Firestore
├── storage.rules            # Security rules for Cloud Storage
└── remoteconfig.template.json # Template for Remote Config parameters
```

---

## 📜 Source of Truth: Schemas
**CRITICAL**: All Zod validation schemas and TypeScript types live EXCLUSIVELY in `packages/shared` (`@verdescan/shared`).
- NEVER redefine schemas or types in `apps/web` or `functions`.
- Always import them directly from `@verdescan/shared`.
- All TypeScript is strict mode (`noImplicitAny: true`, no `any`; use `unknown` and narrow).

---

## 🏷️ Task IDs & Commits
Every change, commit message, and PR MUST explicitly reference the backlog task ID (e.g. `// T-001: Bootstrap monorepo`).

---

## ⚙️ Standard Commands
Keep these commands in sync across documentation and scripts:
```bash
pnpm install            # Install dependencies across all workspaces
pnpm dev                # Start web development app with Firebase emulators / AI mock
pnpm emulators          # Auth, Firestore, Storage, Functions emulators only
pnpm lint               # ESLint across all workspaces
pnpm typecheck          # TypeScript check with project references
pnpm test               # Run unit and component tests (Vitest)
pnpm test:rules         # Firestore and Storage rules tests on emulators
pnpm test:functions     # Cloud Function integration tests on emulators
pnpm test:e2e           # Playwright end-to-end test suite
pnpm kb:validate        # Validate knowledge-base Markdown frontmatter and links
pnpm kb:seed --env <env> # Seed validated KB content to Firestore
pnpm eval               # Run golden-set evaluation against target models
pnpm build              # Build web app and functions
pnpm deploy:<env>       # Deploy to dev, staging, or prod (CI only for staging/prod)
```
