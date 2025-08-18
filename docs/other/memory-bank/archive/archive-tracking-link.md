# Archive – Tracking Link (GetShipmentTrackingLink)

- Task ID: tracking-link
- Title: DHL Tracking link via CF (N8N + Backend)
- Status: Done
- Owner: AI Assistant
- Date: 2025-08-11

## Summary
Implemented and validated shipment tracking retrieval. Seed guarantees a PROCESSING order with tracking for a real test customer, backend exposes `/api/internal/orders/tracking-link`, and N8N tool `GetShipmentTrackingLink()` is connected to the AI Agent.

## Artifacts
- Code:
  - `backend/prisma/seed.ts`: creates `TRACKING-TEST-001` (PROCESSING) for `testCustomer.id` with `trackingNumber = DHL1234567890` and logs IDs for testing
  - `backend/src/application/services/order.service.ts`: `getLatestProcessingTracking()` builds DHL link
  - `backend/src/interfaces/http/routes/internal-api.routes.ts`: `/internal/orders/tracking-link` route
  - `backend/src/interfaces/http/controllers/internal-api.controller.ts`: `getShipmentTrackingLink`
  - `backend/src/chatbot/calling-functions/GetShipmentTrackingLink.ts`
  - `n8n/workflows/shopme-whatsapp-workflow.json`: tool node and AI Agent connection

## Tests
- cURL backend: success with trackingNumber + trackingUrl
- N8N webhook: success path validated

## Impact
- Deterministic E2E for tracking. Reduces debugging time and aligns with workspace isolation and no-static-fallbacks policy.

## Next
- Clear Cart State After Order
- Past Orders CF (history & reorder)
