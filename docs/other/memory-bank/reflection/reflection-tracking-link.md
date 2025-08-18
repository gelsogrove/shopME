# Reflection – Tracking Link (GetShipmentTrackingLink)

- Task: Implement reliable DHL tracking link retrieval via CF and ensure it works end-to-end (seed → backend → N8N)
- Owner: AI Assistant
- Date: 2025-08-11

## What changed
- Added a guaranteed PROCESSING order with trackingNumber in `backend/prisma/seed.ts` tied to an existing test customer (Mario Rossi) to ensure deterministic test data.
- Enhanced seed logging to print `customerId` and `workspaceId` for quick cURL testing.
- Confirmed backend endpoint `/api/internal/orders/tracking-link` wired to `GetShipmentTrackingLink` CF and `OrderService.getLatestProcessingTracking`.
- Verified N8N workflow contains `GetShipmentTrackingLink()` tool connected to AI Agent.

## Why
- N8N/LLM tests failed when no matching order existed. Deterministic seed data removes the flakiness and accelerates validation.

## Key decisions
- Use `testCustomer.id` from seed for the PROCESSING order to avoid hardcoded, non-existing IDs.
- Keep the response shape stable: `{ success, orderId, orderCode, status, trackingNumber, trackingUrl }`.

## Risks
- Multiple seed runs accumulate additional sample orders; mitigated by using a fixed test order code `TRACKING-TEST-001` for the PROCESSING case.

## QA evidence
- Direct backend cURL:
  - Request: `POST /api/internal/orders/tracking-link` with `{ workspaceId: cm9hjgq9v00014qk8fsdy4ujv, customerId: 53fe76de-26b1-4467-a51f-ae0bb41d2142 }`
  - Result: success=true, orderCode=TRACKING-TEST-001, trackingNumber=DHL1234567890, trackingUrl=https://www.dhl.com/...tracking-id=DHL1234567890
- N8N webhook end-to-end: message "where is my order?" returns same tracking payload when LLM triggers the tool.

## Acceptance
- CF returns trackingNumber and clickable DHL link for the latest PROCESSING order of the test customer.
- Works via direct API and via N8N webhook.

## Follow-ups
- Implement "Clear Cart State After Order" hidden system message in N8N (post-success, ~5s delay).
- Add Past Orders CF (history & reorder) and document in PRD.
