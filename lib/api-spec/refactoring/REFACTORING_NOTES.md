# Refactoring Notes: `@workspace/api-spec`

**Project Type**: OpenAPI 3.1 Specification & Orval Code Generation  
**Location**: `lib/api-spec` (with downstream targets `lib/api-zod` and `lib/api-client-react`)  
**Primary Files**: [openapi.yaml](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/api-spec/openapi.yaml), [orval.config.ts](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/api-spec/orval.config.ts)

---

## 1. Current State & Gaps

1. **Minimal Contract**: [openapi.yaml](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/api-spec/openapi.yaml) only specifies `GET /healthz`. As a result, the generated [lib/api-zod/](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/api-zod) package has only one schema (`HealthCheckResponse`).
2. **Missing Spec Linting**: There is no OpenAPI linter (e.g. Spectral). Syntax errors or broken schema references are only caught when Orval fails to compile.
3. **No Standardized Error Response Model**: Components lack a reusable 4xx/5xx `ErrorResponse` definition.

---

## 2. Refactoring Actions

### Action 1: Define Standardized Error Components
Add reusable error schemas in [openapi.yaml](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/api-spec/openapi.yaml):

```yaml
components:
  schemas:
    ErrorDetail:
      type: object
      required: [message, code]
      properties:
        message:
          type: string
        code:
          type: string
        field:
          type: string
    ErrorResponse:
      type: object
      required: [error]
      properties:
        error:
          $ref: "#/components/schemas/ErrorDetail"
```

---

### Action 2: Add Real Domain Endpoints to OpenAPI Spec
Expand [openapi.yaml](file:///h:/System%20design/design-pattern/replet/design-patterns/lib/api-spec/openapi.yaml) to model user progress and pattern bookmarks:

```yaml
paths:
  /progress:
    get:
      operationId: getUserProgress
      tags: [progress]
      summary: Get all progress records
      responses:
        "200":
          description: List of progress records
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/ProgressRecord"
    post:
      operationId: upsertProgress
      tags: [progress]
      summary: Save pattern progress
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/SaveProgressPayload"
      responses:
        "200":
          description: Updated progress
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ProgressRecord"
        "400":
          description: Validation error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
```

---

### Action 3: Automate Codegen on Workspace Build
In root [package.json](file:///h:/System%20design/design-pattern/replet/design-patterns/package.json), ensure `codegen` runs automatically before typechecks:

```json
{
  "scripts": {
    "codegen": "pnpm --filter @workspace/api-spec run codegen",
    "typecheck": "pnpm run codegen && npx -y pnpm@10 run typecheck:libs && ..."
  }
}
```
This guarantees that whenever developers edit `openapi.yaml`, the generated Zod schemas and React Query hooks are immediately up to date without manual sync steps.
