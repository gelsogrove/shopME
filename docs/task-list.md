## Phase 1 — Minimal Task List

Reference: this is the concise checklist for Phase 1 delivery. For the full, continuously updated list (including completed, active, bugs, and Phase 2), see `docs/other/task-list.md`.

- [ ] PRD Audit and Update
  - Ensure `docs/PRD.md` matches implementation; English only; align with tests and code.

- [ ] Testing Gap Analysis and Coverage
  - Identify critical areas (cart flow, CFs, N8N payload mapping, workspace isolation, auth, rate limits) and add missing unit/integration tests.

- [ ] Enforce workspaceId Everywhere (+ Tests)
  - Validate and filter all reads/writes by `workspaceId` across APIs/CFs; add tests to detect gaps.

- [ ] PromptAgent Cart Coherence (Live Updates)
  - Ensure chat cart and CreateOrder `items` are consistent; use DB-driven config only.

- [ ] Clear Cart State After Order (Hidden System Message)
  - In N8N, post-success hidden system message (delay ~5s) to clear cart memory; invisible to end user.

- [ ] Automate N8N Seed Login and Workspace Activation
  - Make authentication & activation automatic during seed/start; persist session; no hardcoded IDs; idempotent.

- [ ] Scripts Hygiene and Cleanup
  - Keep only scripts actually used; remove obsolete temp/debug scripts under `/scripts/`.

- [ ] Calling Functions for Past Orders (History & Reorder)
  - CFs to list past orders and reorder; integrate with N8N; update Swagger; respect workspace isolation.

- [ ] Model Configuration Audit and Dynamic Selection
  - Verify current model; enable dynamic selection via DB (agent config) through N8N; avoid static defaults.

- [ ] FE/BE Dead Code Cleanup
  - Remove unused files/exports without changing layout/UX; keep style and lint rules consistent.

- [ ] Shipment Tracking Spike (DHL Demo)
  - Explore DHL demo and propose minimal tracking UX (e.g., default `trackingCode` in seed and link reply).

Notes
- Status for all above: Not Started, unless already in progress elsewhere.
- For complete details and future items, consult `docs/other/task-list.md`.