# Implementation Action Plan: Full-Stack Database, Auth & Storage Architecture

**Document ID:** ARCH-2026-007  
**Status:** In Progress (Active Implementation)  
**Date:** 2026-10-13  
**Domain:** Full-Stack Implementation & Delivery Tracking  
**Author:** Antigravity Engineering Agent  

---

## 1. Project Overview & Progress Tracker

This document tracks the sequential implementation of the GoF Design Patterns Masterclass full-stack transition:
1. **RDBMS Database Foundation** (PostgreSQL + Drizzle ORM)
2. **Identity & Session Management** (Better Auth + Google/GitHub OAuth + RBAC)
3. **Switchable Object Storage** (Cloudflare R2 & Backblaze B2 S3 SDK Adapter)
4. **Contract-First APIs & Codegen** (OpenAPI 3.1 + Orval + Zod + TanStack Query)
5. **Frontend Client UI & Persistence** (AuthDialog, Dynamic Header, ApiNoteRepository, 1-Click Migration)
6. **Containerization & Deployment Verification** (Docker, Zero-Downtime Rolling Updates, Custom Domain)

---

## 2. Phased Action Plan & Status Checkboxes

### Phase 1: Database Foundation & Drizzle ORM Schemas (`lib/db`)
- [x] **Task 1.1**: Create Auth Schemas (`lib/db/src/schema/auth.ts`)
  - [x] `usersTable` (id, name, email, role, persona, banned, timestamps)
  - [x] `sessionsTable` (id, userId, token, expiresAt, ipAddress, userAgent, timestamps)
  - [x] `accountsTable` (id, userId, accountId, providerId, password hash, tokens)
  - [x] `verificationsTable` (id, identifier, value, expiresAt)
- [x] **Task 1.2**: Create Subscription Schema (`lib/db/src/schema/subscriptions.ts`)
  - [x] `subscriptionsTable` (id, userId, stripeCustomerId, tier: 'free'|'premium', status, period timestamps)
- [x] **Task 1.3**: Create Learning Progress & Bookmarks Schemas (`lib/db/src/schema/progress.ts`, `bookmarks.ts`)
  - [x] `userProgressTable` (id, userId, patternId, box 1–5, attempts, correct, note, timestamps)
  - [x] `userBookmarksTable` (id, userId, patternId, createdAt)
- [x] **Task 1.4**: Create Per-Pattern Rich Notes Schema (`lib/db/src/schema/notes.ts`)
  - [x] `patternNotesTable` (id, userId, patternId, blocks JSONB, version, timestamps)
- [x] **Task 1.5**: Create Object Storage Media Metadata Schema (`lib/db/src/schema/media.ts`)
  - [x] `mediaAssetsTable` (id, userId, patternId, s3Key, mimeType, fileSizeBytes, publicUrl, timestamps)
- [x] **Task 1.6**: Create Decision Engine Session Ledger Schema (`lib/db/src/schema/decision-ledger.ts`)
  - [x] `decisionLedgerTable` (id, userId, problemStatement, primaryPattern, confidence, tradeOffs, timestamps)
- [x] **Task 1.7**: Export all tables in `lib/db/src/schema/index.ts` and configure pool options in `lib/db/src/index.ts`.
- [x] **Task 1.8**: Run typecheck verification on `@workspace/db`. (PASSED - Exit code 0)
- [x] **Task 1.9**: Connect to local Docker PostgreSQL container (`curiokraft-postgres`), provision `design_patterns` database, and push all 10 Drizzle tables via `drizzle-kit push`. (PASSED - 10 tables live)

---

### Phase 2: Switchable S3 Object Storage Service (`artifacts/api-server`)
- [x] **Task 2.1**: Install S3 SDK dependencies (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`) in `artifacts/api-server`.
- [x] **Task 2.2**: Implement `S3StorageService` in `artifacts/api-server/src/services/storage.service.ts` supporting both Cloudflare R2 and Backblaze B2 via `.env` configuration.
- [x] **Task 2.3**: Implement presigned upload route `POST /api/media/presign-upload` and confirmation endpoint in `artifacts/api-server/src/routes/media.ts`.
- [x] **Task 2.4**: Connect S3 service to local Docker MinIO container (`http://localhost:9000`) and initialize `gof-notes-media` bucket. (PASSED - Verified)

---

### Phase 3: Better Auth & RBAC Backend Engine (`artifacts/api-server`)
- [x] **Task 3.1**: Install `better-auth` and `@better-auth/drizzle-adapter` in `artifacts/api-server`.
- [x] **Task 3.2**: Configure Better Auth instance in `artifacts/api-server/src/lib/auth.ts` with Drizzle adapter, credentials provider, Google/GitHub OAuth, and admin plugin.
- [x] **Task 3.3**: Create declarative permissions in `artifacts/api-server/src/lib/permissions.ts` (`guest`, `member`, `admin`).
- [x] **Task 3.4**: Mount `/api/auth/*` route in `artifacts/api-server/src/app.ts`.
- [x] **Task 3.5**: Implement auth guards: `requireAuth()`, `requireRole()`, and `requireTier()` in `artifacts/api-server/src/middlewares/auth.ts`.


---

### Phase 4: Contract-First API & Codegen (`lib/api-spec`)
- [ ] **Task 4.1**: Update `lib/api-spec/openapi.yaml` with `/progress`, `/bookmarks`, and `/media/presign-upload` endpoints.
- [ ] **Task 4.2**: Run Orval code generation: `pnpm --filter @workspace/api-spec run codegen`.
- [ ] **Task 4.3**: Verify compilation in `@workspace/api-zod` and `@workspace/api-client-react`.

---

---

### Phase 5: Frontend Auth UI & Dynamic Header (`artifacts/pattern-masterclass`)
- [x] **Task 5.1**: Install `better-auth/client` in `artifacts/pattern-masterclass` and create `src/lib/auth-client.ts`.
- [x] **Task 5.2**: Build `<AuthDialog />` modal (Sign In / Create Account tabs, Google/GitHub OAuth buttons, Email/Password inputs, Persona selector chips).
- [x] **Task 5.3**: Build `<UserProfileDropdown />` in the top navigation header with user avatar, name, email, persona badge, and cloud sync status.
- [x] **Task 5.4**: Wire session state and replace static avatar button in `artifacts/pattern-masterclass/src/App.tsx`.

---

### Phase 6: Hybrid Decision Engine: BYOK & Built-in Pro AI Architect
- [x] **Task 6.1**: Document BYOK vs. Built-in Pro AI Architect specification and action plan (`docs/decision-engine/01-byok-and-managed-pro-ai-architecture.md`).
- [x] **Task 6.2**: Implement `POST /api/ai/architect-consult` server proxy endpoint in `artifacts/api-server/src/routes/ai.ts` with session authentication and PostgreSQL ledger saving.
- [x] **Task 6.3**: Update `ai-service.ts` in `artifacts/pattern-masterclass` to support `'managed'` mode calling `/api/ai/architect-consult`.
- [x] **Task 6.4**: Upgrade `AIArchitectBar.tsx` and `BYOKModal.tsx` with seamless dual-mode toggle (Built-in Pro AI with no key required vs. BYOK).

---

### Phase 7: Full-Stack Cloud Persistence & Migration (`artifacts/pattern-masterclass`)
- [x] **Task 7.1**: Implement `ApiNoteRepository.ts` in `src/lib/notes/` satisfying the `NoteRepository` interface.
- [x] **Task 7.2**: Wire `NoteRepositoryContext` to dynamically toggle between `LocalStorageNoteRepository` (for guests) and `ApiNoteRepository` (for authenticated members).

---

### Phase 8: Verification & Quality Gate
- [x] **Task 8.1**: Run monorepo typecheck: `pnpm run typecheck`. (PASSED - Exit code 0 across monorepo)
- [x] **Task 8.2**: Verify production build: `pnpm run build`.
- [x] **Task 8.3**: Update documentation index in `docs/README.md`.


