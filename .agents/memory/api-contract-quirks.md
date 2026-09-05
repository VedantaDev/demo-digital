---
name: API contract generator quirks
description: Non-obvious compatibility constraints between the workspace OpenAPI generator and its Zod runtime.
---

When adding optional email fields to OpenAPI contracts in this workspace, prefer a length constraint plus explicit server validation unless the generated Zod runtime has been upgraded to support `z.email()`.

**Why:** The current Orval output targets Zod 3, while an OpenAPI `format: email` field can generate a `z.email()` call that fails the library typecheck.

**How to apply:** After changing `lib/api-spec/openapi.yaml`, run the API codegen command and the library typecheck before relying on generated client or server types.