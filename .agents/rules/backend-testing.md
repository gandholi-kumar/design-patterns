# Backend Testing Standards (Node.js, Express 5 & Clean Architecture)

This document establishes the mandatory unit, integration, and contract testing rules for Node.js and Express backend services in this workspace (specifically `@workspace/api-server`).

---

## 1. Framework Evaluation: Selecting the Best Test Framework for Node.js & Express

When selecting a testing framework for modern Node.js and Express 5 in TypeScript, three major options exist:

| Criterion | **Vitest** (Recommended) | **Jest** | **Node.js Test Runner (`node:test`)** |
| :--- | :--- | :--- | :--- |
| **Native ESM & TypeScript** | **Flawless**: Native ESM execution and TypeScript parsing with zero extra compiler plugins. | **Complex**: Requires `@swc/jest` or `ts-jest` with separate transpilation configs and module mapper gymnastics. | **Native**: Runs directly in Node.js 18+ with `--experimental-strip-types` or compiled JS. |
| **Speed & Watch Mode** | **Instant**: In-memory Vite module graph; intelligent test re-execution based on dependency tree. | **Moderate**: Slower initial cold boot and module resolution in large monorepos. | **Fast**: Extremely lightweight with minimal overhead. |
| **Mocking & Spying** | **Comprehensive**: Built-in `vi.mock`, `vi.spyOn`, `vi.fn`, module automocking, and fake timers. | **Comprehensive**: Original `jest.mock`, `jest.spyOn`, fake timers. | **Minimal**: Basic `mock.fn` and `mock.method`; lacks advanced module mocking and matcher ecosystems. |
| **Ecosystem & Matchers** | Built-in Chai / Jest matchers (`expect().toHaveProperty()`, `toThrow()`). | Rich `expect` matcher library. | Uses standard `node:assert` (strict, but lacks ergonomic assertion syntax). |
| **Monorepo Uniformity** | **Single toolchain**: Frontend and backend share the exact same assertion API and CLI runner. | Differs from modern frontend build tooling. | Differs from frontend test tooling. |

### Verdict & Standard:
* **Vitest is the recommended standard framework** for Node.js & Express 5 TypeScript backends in modern monorepos.
* Paired with **Supertest**, it enables lightning-fast HTTP testing without binding to live TCP sockets.
* If a team operates within legacy Webpack/Jest environments, the Clean Architecture testing rules and Supertest practices defined below remain identical.

---

## 2. Testing Across Clean Architecture Layers

Testing must be partitioned according to Clean Architecture layers to avoid fragile, tightly-coupled tests:

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. HTTP Endpoint & Integration Tests (Supertest)            │
│    - Status codes (200, 201, 400, 401, 404, 500)            │
│    - Zod boundary validation & error response shapes        │
│    - Route middleware & Auth session verification           │
├─────────────────────────────────────────────────────────────┤
│ 2. Controller & Middleware Unit Tests                        │
│    - Request / Response / Next function handling            │
│    - Centralized error propagation                           │
├─────────────────────────────────────────────────────────────┤
│ 3. Domain Services & Business Logic (Pure Unit Tests)       │
│    - Pure algorithmic decisions, trade-offs, rules          │
│    - Zero HTTP dependencies, zero database dependencies     │
├─────────────────────────────────────────────────────────────┤
│ 4. Data Access Layer (Repository / Drizzle ORM Tests)       │
│    - Query generation & schema integrity                    │
│    - Transaction rollback and idempotency                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Supertest & HTTP Endpoint Testing: Behavior Over Implementation

### Rule: Never Listen on Real TCP Ports in Tests
Do not call `app.listen(3000)` in test suites. Supertest accepts the raw Express `app` instance and sends mock HTTP requests in memory via Node's internal stream pipelines.

```typescript
import request from 'supertest';
import { describe, it, expect, vi } from 'vitest';
import { app } from '../app';

describe('GET /api/health', () => {
  it('returns status 200 with structured health metadata', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toEqual({
      status: 'healthy',
      timestamp: expect.any(String),
      uptime: expect.any(Number),
    });
  });
});
```

---

## 4. Boundary Validation Testing (Zod Schemas)

Every external entry point must be strictly validated. Write explicit test suites covering:
1. **Valid input**: Schema parses successfully with coerced defaults.
2. **Invalid field types**: Schema rejects strings where numbers are expected.
3. **Missing required fields**: Schema returns descriptive path errors.
4. **Malicious / extra fields**: Unknown fields are stripped (`strip`) or rejected (`strict`).

```typescript
describe('POST /api/v1/decision-ledger (Zod Boundary Validation)', () => {
  it('rejects payloads with missing required fields with 400 Bad Request', async () => {
    const invalidPayload = {
      // Missing primaryPattern and confidence
      problemStatement: 'Decoupling algorithms from host context.',
    };

    const res = await request(app)
      .post('/api/v1/decision-ledger')
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('Validation error');
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: expect.arrayContaining(['primaryPattern']) }),
      ])
    );
  });

  it('accepts valid schema payload and responds with 201 Created', async () => {
    const validPayload = {
      primaryPattern: 'Strategy',
      runnerUpPattern: 'State',
      confidence: 90,
      problemStatement: 'Decouple algorithmic families.',
      tradeOffs: ['Increases object count', 'Eliminates conditional branching'],
    };

    const res = await request(app)
      .post('/api/v1/decision-ledger')
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });
});
```

---

## 5. Comprehensive Mocking Strategies in Backend

### 1. Mocking Database Queries (Drizzle ORM)
Do not require a live PostgreSQL server to run unit tests. Mock Drizzle queries at the repository boundary:

```typescript
import { vi } from 'vitest';
import * as noteRepo from '../repositories/note.repository';

// Mock repository functions cleanly
vi.mock('../repositories/note.repository', () => ({
  findNoteByPatternId: vi.fn(),
  saveNote: vi.fn(),
}));

it('retrieves notes for a specific pattern', async () => {
  vi.mocked(noteRepo.findNoteByPatternId).mockResolvedValue({
    id: 'note-123',
    patternId: 'strategy',
    content: 'Always prefer composition over inheritance.',
    updatedAt: new Date(),
  });

  const res = await request(app).get('/api/v1/notes/strategy');

  expect(res.status).toBe(200);
  expect(res.body.patternId).toBe('strategy');
  expect(noteRepo.findNoteByPatternId).toHaveBeenCalledWith('strategy');
});
```

### 2. Mocking Authentication Middleware & User Sessions
Rather than running full OAuth handshakes in unit tests, test routes both with and without authenticated sessions:

```typescript
// Pattern: Mock the auth session resolver
vi.mock('../lib/auth', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    if (req.headers['authorization'] === 'Bearer test-token') {
      req.user = { id: 'usr-123', email: 'architect@example.com' };
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized' });
  },
}));

it('returns 401 when Authorization header is missing', async () => {
  const res = await request(app).get('/api/v1/user/profile');
  expect(res.status).toBe(401);
});

it('returns 200 when authenticated session is provided', async () => {
  const res = await request(app)
    .get('/api/v1/user/profile')
    .set('Authorization', 'Bearer test-token');
  expect(res.status).toBe(200);
  expect(res.body.email).toBe('architect@example.com');
});
```

### 3. Mocking External Third-Party APIs (OpenAI, AWS S3)
* Never make actual outbound internet calls in test suites.
* Mock SDK clients at the module level:

```typescript
vi.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: class {
      send = vi.fn().mockResolvedValue({ ETag: '"mock-etag"' });
    },
    PutObjectCommand: class {},
    GetObjectCommand: class {},
  };
});
```

### 4. Mocking Environment Variables (`process.env`)
Always restore environment variables after modifying them in tests:

```typescript
const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv, NODE_ENV: 'test', API_KEY: 'test-secret' };
});

afterAll(() => {
  process.env = originalEnv;
});
```

---

## 6. Centralized Error Middleware & Express 5 Async Handling

Express 5 natively handles rejected promises in route handlers without requiring `next(err)`. Your tests must verify that:
1. Operational errors (`NotFoundError`, `ValidationError`) return proper 4xx status codes and structured JSON messages.
2. Uncaught unexpected errors (`Error: Connection lost`) return 500 without leaking stack traces in production mode.

```typescript
// Test error middleware handling
describe('Error Handling Middleware', () => {
  it('catches asynchronous exceptions and formats structured 500 error', async () => {
    // Force a handler to throw
    vi.mocked(noteRepo.findNoteByPatternId).mockRejectedValue(
      new Error('Database disk I/O failure')
    );

    const res = await request(app).get('/api/v1/notes/strategy');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
    // Ensure sensitive stack traces are never leaked in client response
    expect(res.body.stack).toBeUndefined();
  });
});
```

---

## 7. Crucial Points Often Missed

1. **HTTP Status Code Precision**:
   * `200 OK`: Successful retrieval or update.
   * `201 Created`: Successful resource creation (MUST include `Location` header or created entity).
   * `204 No Content`: Successful deletion (response body MUST be empty).
   * `400 Bad Request`: Schema validation failure.
   * `401 Unauthorized`: Missing or invalid credentials.
   * `403 Forbidden`: Authenticated user lacks permission to access resource.
   * `404 Not Found`: Resource does not exist.
   * `409 Conflict`: Unique constraint violation (e.g. duplicate note ID).

2. **Security Headers Verification**:
   * Test that security middlewares (e.g., Helmet, CORS) attach expected headers:
   ```typescript
   const res = await request(app).get('/api/health');
   expect(res.headers['x-dns-prefetch-control']).toBe('off');
   expect(res.headers['x-content-type-options']).toBe('nosniff');
   ```

3. **Graceful Shutdown Testing**:
   * Verify that calling shutdown hooks closes database connection pools and HTTP listeners cleanly without hanging the test process.

---

## 8. Summary Checklist for Every New Backend Endpoint

* [ ] Pure domain logic is covered by unit tests (no DB / no HTTP).
* [ ] Request body, query params, and route params are validated using Zod.
* [ ] Valid payload returns `200` or `201` with proper JSON schema shape.
* [ ] Invalid payload returns `400` with clear validation error path.
* [ ] Unauthenticated request returns `401 Unauthorized`.
* [ ] Non-existent entity returns `404 Not Found`.
* [ ] Database query failures are caught and return structured `500` without stack traces.
* [ ] Third-party SDKs (OpenAI, AWS S3, etc.) are mocked with `vi.mock`.
