# Architecture Specification & Action Plan: BYOK vs. Built-in Pro AI Architect

**Document ID:** ARCH-2026-008  
**Status:** In Progress (Active Implementation)  
**Date:** 2026-10-13  
**Domain:** AI Architecture, Decision Engine, Hybrid Zero-Trust & Managed Cloud  
**Target Applications:** `artifacts/pattern-masterclass`, `artifacts/api-server`, `lib/db`

---

## 1. Conceptual Foundation: The Dual-Engine AI Philosophy

### 1.1 What is "BYOK" (Bring Your Own Key)?
**BYOK** stands for **Bring Your Own Key**. In this architecture:
- **Who uses it:** Visitors, privacy-first engineers, users who already possess developer API keys (Google Gemini, OpenAI, Groq) or run local offline models (Ollama on `http://localhost:11434`).
- **Where keys are stored:** Strictly in **browser volatile RAM** (React state). The key is **never** written to `localStorage`, `IndexedDB`, session cookies, or backend server databases.
- **Network Path:** The browser communicates directly with the AI provider's API (e.g. `generativelanguage.googleapis.com` or local Ollama).
- **Advantages:**
  - 100% Zero-Trust privacy: The platform backend never sees the user's prompt or API key.
  - Zero platform inference costs.
  - Freedom to choose custom models (e.g. Llama 3.3 70B via Groq, GPT-4o, Gemini 2.5 Flash).
- **Friction / Pain Points:**
  - High barrier to entry: Non-technical users or students must create a Google Cloud or OpenAI account, set up billing, configure rate cards, and copy 40-character secret keys.

---

### 1.2 What is "Built-in Pro AI Architect (No Key Required)"?
**Built-in Pro AI Architect** is the platform's **hosted, zero-configuration cloud AI service**:
- **Who uses it:** Authenticated Members, Pro Subscribers, students, and busy engineers who want instant, expert GoF architectural consultations without dealing with API keys, cloud billing, or configuration.
- **Where keys are stored:** On the secure backend server (`artifacts/api-server/.env` as `GEMINI_API_KEY` or `OPENAI_API_KEY`). Client browsers **never** handle or see the server secrets.
- **Network Path:** Frontend client sends `{ problemStatement, turns }` via `POST /api/ai/architect-consult`. The backend validates the user's session cookie via Better Auth, verifies permissions, invokes Google Gemini / OpenAI server-to-server, and logs the resulting architectural decision to PostgreSQL `decisionLedgerTable`.
- **Advantages:**
  - ⚡ **Zero Setup Friction:** 1-click consultation. No keys, no billing setup, no copy-pasting.
  - 🏛️ **Synchronized Decision Ledger:** Consultations are automatically saved to the user's cloud account and accessible across devices.
  - 🛡️ **Guaranteed High Performance & Fallbacks:** The backend can manage retries, model fallbacks, and rate limit quotas seamlessly.
  - 💎 **Clear Subscription Value:** Forms a core pillar of the Pro/Premium membership.

---

### 1.3 The Hybrid Decision Matrix

| Feature | 🔑 BYOK (Bring Your Own Key) | ⭐ Built-in Pro AI (Managed) | 📐 Deterministic Heuristic |
| :--- | :--- | :--- | :--- |
| **Target User** | Power users, local LLM developers | Pro Members, Students, Engineers | Offline users, quick sanity checks |
| **Key Required?** | **Yes** (User's personal key) | **No Key Required** (Zero setup) | **No** (Pure TypeScript rules) |
| **Key Location** | Ephemeral Browser RAM | Server Environment Variable | N/A (Rule matrix) |
| **Supported Providers** | Gemini, OpenAI, Groq, Ollama | Google Gemini (Managed Cloud) | Static classification rules |
| **Network Path** | Browser -> AI Provider / Localhost | Browser -> `api-server` -> AI Provider | 100% In-Browser (No network) |
| **Cloud Ledger Sync** | Manual save to DB (if logged in) | Automatic DB persistence | Manual save to DB (if logged in) |
| **Tier Requirement** | Guest & All Tiers (Free) | Member / Pro Tier | Guest & All Tiers (Free) |

---

## 2. Technical Architecture & Data Flow

```text
                                  ┌───────────────────────────────┐
                                  │      Decision Engine UI       │
                                  │   (AIArchitectBar / Modal)    │
                                  └───────────────┬───────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 │ User Selects Engine Mode                                        │
                 ▼                                                                 ▼
   [ Mode: Built-in Pro AI ]                                         [ Mode: BYOK (Custom Key) ]
                 │                                                                 │
                 ▼                                                                 ▼
      POST /api/ai/architect-consult                                Direct Client-Side Fetch
      Cookie: better-auth.session_token                              Header: Bearer {RAM_KEY}
                 │                                                                 │
                 ▼                                                                 ▼
  ┌─────────────────────────────┐                                   ┌─────────────────────────────┐
  │   api-server (Node/Express) │                                   │ Google / OpenAI / Ollama    │
  ├─────────────────────────────┤                                   └─────────────────────────────┘
  │ 1. Validate Session         │
  │ 2. Check Daily Quota        │
  │ 3. Call Server Gemini API   │
  │ 4. Persist to Postgres      │
  │    (decisionLedgerTable)    │
  └──────────────┬──────────────┘
                 │
                 ▼
      Returns GoF Verdict JSON
                 │
                 ▼
  ┌─────────────────────────────┐
  │ Render Verdict & Trade-offs │
  └─────────────────────────────┘
```

---

## 3. Phased Implementation Action Plan & Status Checkboxes

### Phase A: Architecture & Specification
- [x] **Task A.1**: Define BYOK vs. Built-in Pro AI conceptual differences and hybrid flow.
- [x] **Task A.2**: Create action plan tracker in `docs/decision-engine/01-byok-and-managed-pro-ai-architecture.md`.
- [x] **Task A.3**: Update `docs/architecture/04-execution-action-plan.md` and `docs/README.md` to reference this spec.

### Phase B: Backend Managed AI Route (`artifacts/api-server`)
- [x] **Task B.1**: Create `POST /api/ai/architect-consult` route in `artifacts/api-server/src/routes/ai.ts`.
- [x] **Task B.2**: Protect route with Better Auth session check (`requireAuth`).
- [x] **Task B.3**: Implement server-side Gemini 2.5 Flash / Pro model invocation with structured JSON response schema.
- [x] **Task B.4**: Save verdict to PostgreSQL `decisionLedgerTable` linked to `session.user.id`.
- [x] **Task B.5**: Mount `/api/ai` in `artifacts/api-server/src/routes/index.ts`.
- [x] **Task B.6**: Verify typecheck on `@workspace/api-server`. (PASSED - Exit code 0)

### Phase C: Frontend AI Service & State Engine (`artifacts/pattern-masterclass`)
- [x] **Task C.1**: Update `AIProvider` in `ai-service.ts` to include `'managed'` mode.
- [x] **Task C.2**: In `analyzeProblemWithAI()`, branch on `config.provider === 'managed'` to call `POST /api/ai/architect-consult`.
- [x] **Task C.3**: Handle streaming / retry error notifications gracefully.

### Phase D: Frontend UI Components (`AIArchitectBar.tsx` & `BYOKModal.tsx`)
- [x] **Task D.1**: Update `AIArchitectBar.tsx` to detect session:
  - [x] If user is logged in, default to **Built-in Pro AI Architect (Ready · No Key Required)**.
  - [x] Provide a toggle button between Built-in Pro AI and BYOK.
- [x] **Task D.2**: Enhance `BYOKModal.tsx` with a dual-tab selector:
  - [x] Tab 1: **Built-in Pro AI** (Explaining zero-key instant access for members).
  - [x] Tab 2: **Bring Your Own Key (BYOK)** (For custom Gemini / OpenAI / Groq / Ollama keys in RAM).
- [x] **Task D.3**: Update Topbar in `artifacts/pattern-masterclass/src/App.tsx` with `<UserProfileDropdown />` and `[Sign In]` modal launcher.

### Phase E: Verification & Quality Gate
- [x] **Task E.1**: Run monorepo typecheck: `pnpm run typecheck`. (PASSED - Exit code 0 across all 9 packages)
- [x] **Task E.2**: Verify clean execution and zero lint/type regressions.
- [x] **Task E.3**: Check all action plan checkboxes upon completion.
