# Backend Cleanup Analysis

## ⚠️ ROUTES & CONTROLLERS DA RIMUOVERE (non usati dal FE)

### 1. OpenAI Test Routes
- **File**: `backend/src/interfaces/http/routes/openai.routes.ts`
- **Route**: `GET /api/openai/test`
- **Controller**: `backend/src/interfaces/http/controllers/openai.controller.ts`
- **Motivo**: Solo endpoint di test, non usato in produzione

### 2. Push Messaging Routes (non implementato nel FE)
- **File**: `backend/src/interfaces/http/routes/push-messaging.router.ts`
- **File**: `backend/src/interfaces/http/routes/push-testing.router.ts`
- **Controller**: `backend/src/interfaces/http/controllers/push-messaging.controller.ts`
- **Motivo**: Feature non utilizzata dal frontend

### 3. Monitoring Routes (troppo specifico per WhatsApp flow)
- **File**: `backend/src/interfaces/http/routes/monitoring.routes.ts`
- **Controller**: `backend/src/interfaces/http/controllers/monitoring.controller.ts`
- **Motivo**: Endpoints Prometheus e WhatsApp flow metrics non usati dal FE
- **NOTA**: Mantenere solo health check base

### 4. Billing Routes (logica spostata in message.repository)
- **File**: `backend/src/interfaces/http/routes/billing.routes.ts`
- **Controller**: `backend/src/controllers/usage.controller.ts` (alcuni metodi)
- **Motivo**: Billing ora gestito direttamente in message.repository.ts saveMessage()
- **NOTA**: Usage dashboard endpoint ancora usato, mantenere solo quello

### 5. Operator Controller
- **File**: `backend/src/interfaces/http/controllers/operator.controller.ts`
- **Motivo**: Non referenziato da nessuna route

### 6. Example DDD Controller
- **File**: `backend/src/interfaces/http/controllers/example-ddd.controller.ts`
- **Motivo**: File di esempio per architettura

### 7. Short URL Test Controller
- **File**: `backend/src/interfaces/http/controllers/short-url-test.controller.ts`
- **Route**: `GET /api/test/short-urls`
- **Motivo**: Endpoint di test

## 📁 FILE DUPLICATI

### Orders (2 implementazioni)
1. **`backend/src/interfaces/http/routes/orders.routes.ts`** 
   - JWT auth, per accesso publico ordini
   - Usato da: InvoicePage.tsx
   
2. **`backend/src/interfaces/http/routes/order.routes.ts`**
   - Auth middleware, per dashboard admin
   - Usato da: OrdersPage.tsx

**DECISIONE**: Mantenere entrambi, hanno scopi diversi

### Documents (2 implementazioni)
1. **`backend/src/interfaces/http/routes/documentRoutes.ts`** (lowercase)
2. **`backend/src/interfaces/http/controllers/documentController.ts`** (lowercase)
3. **`backend/src/interfaces/http/controllers/document.controller.ts`** (kebab-case)

**DECISIONE**: Unificare a kebab-case (document.controller.ts)

### Categories vs Category
1. **`backend/src/interfaces/http/controllers/categories.controller.ts`**
2. **`backend/src/interfaces/http/controllers/category.controller.ts`**

**DECISIONE**: Verificare quale è usato e rimuovere l'altro

## 🔧 SERVIZI CON PATTERN INCONSISTENTI

### 1. CallingFunctionsService
- **File**: `backend/src/services/calling-functions.service.ts`
- **Issue**: Troppi console.log, logica mista con link generation
- **Azione**: Pulire logging, verificare se link-generator.service copre tutto

### 2. LLMService
- **File**: `backend/src/services/llm.service.ts`
- **Issue**: Verificare se duplica logica di MessageRepository

### 3. BillingService
- **File**: Rimosso? O ancora presente?
- **Issue**: Logica billing ora in message.repository, verificare file residui

## 🗑️ CODICE DA PULIRE

### Console.log eccessivi
- `backend/src/repositories/message.repository.ts` - Centinaia di console.log di debug
- `backend/src/services/calling-functions.service.ts` - Console.log con emoji
- `backend/src/application/services/function-handler.service.ts` - Debug logging
- `backend/src/interfaces/http/routes/` - Molti file con console.log

### Import non utilizzati
- Da verificare con TypeScript compiler

### Codice commentato
- `backend/src/routes/index.ts` - Commenti su "BillingService removed"
- Vari file con vecchie implementazioni commentate

## 📊 ROUTES NON USATE DAL FRONTEND

Confrontando con FRONTEND_ENDPOINTS_MAP.md:

### Sicuramente NON usati:
- `POST /api/workspaces/:workspaceId/customers/:id/block` (duplicato in app.ts)
- `GET /api/openai/test`
- Tutti `/api/push-*`
- Tutti `/api/monitoring/*` (tranne forse health)
- `GET /api/billing/:workspaceId/*` (sostituito da usage)
- Short URL test endpoints

### Da Verificare:
- Offers routes - Frontend ha OffersPage ma da verificare implementazione completa
- Sales routes - Sembra usato da SalesPage
- Prompts routes - Da verificare se usato in agent config
- Checkout routes - Da verificare se usato nel flow checkout

## 🎯 PRIORITY CLEANUP ORDER

1. **ALTA PRIORITÀ** - Rimuovere subito (sicuro):
   - OpenAI test routes
   - Push messaging routes
   - Monitoring routes (tranne health)
   - Operator controller
   - Example DDD controller
   - Short URL test controller

2. **MEDIA PRIORITÀ** - Consolidare:
   - Document controllers (unificare)
   - Category vs Categories controllers
   - Console.log di debug (ridurre drasticamente)

3. **BASSA PRIORITÀ** - Verificare uso:
   - Billing routes vs Usage routes
   - Prompts routes
   - Alcuni endpoint checkout

## ✅ DA MANTENERE (critici)

- Auth routes (/auth/login, /auth/me, /auth/logout)
- Workspace routes
- Products, Categories, Services routes
- Orders routes (entrambe le implementazioni)
- Customers routes
- Sales routes
- FAQs routes
- Documents routes (RAG)
- Agent routes
- Chat routes
- Cart & Checkout routes
- Analytics routes
- Settings routes
- Languages routes
- Public orders routes (token-based)
- Registration routes
- Short URL redirect (non test)
