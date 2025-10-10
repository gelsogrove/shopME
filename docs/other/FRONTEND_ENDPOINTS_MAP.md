# Frontend Endpoints Mapping
Lista completa degli endpoint API chiamati dal frontend

## Auth
- `POST /api/auth/login` - Login utente
- `POST /api/auth/logout` - Logout utente
- `GET /api/auth/me` - Dati utente corrente

## Users
- `PUT /api/users/profile` - Aggiorna profilo
- `POST /api/users/change-password` - Cambia password

## Workspaces
- `GET /api/workspaces` - Lista workspace
- `GET /api/workspaces/current` - Workspace corrente
- `GET /api/workspaces/:id` - Dettaglio workspace
- `POST /api/workspaces` - Crea workspace
- `PUT /api/workspaces/:id` - Aggiorna workspace
- `DELETE /api/workspaces/:id` - Elimina workspace

## Languages
- `GET /api/languages` - Lista lingue

## Products
- `GET /api/workspaces/:workspaceId/products` - Lista prodotti
- `GET /api/workspaces/:workspaceId/products/:id` - Dettaglio prodotto
- `POST /api/workspaces/:workspaceId/products` - Crea prodotto
- `PUT /api/workspaces/:workspaceId/products/:id` - Aggiorna prodotto
- `DELETE /api/workspaces/:workspaceId/products/:id` - Elimina prodotto

## Categories
- `GET /api/workspaces/:workspaceId/categories` - Lista categorie
- `GET /api/workspaces/:workspaceId/categories/:id` - Dettaglio categoria
- `GET /api/workspaces/:workspaceId/categories/:id/products` - Prodotti categoria
- `POST /api/workspaces/:workspaceId/categories` - Crea categoria
- `PUT /api/workspaces/:workspaceId/categories/:id` - Aggiorna categoria
- `DELETE /api/workspaces/:workspaceId/categories/:id` - Elimina categoria

## Services
- `GET /api/workspaces/:workspaceId/services` - Lista servizi
- `GET /api/workspaces/:workspaceId/services/:id` - Dettaglio servizio
- `POST /api/workspaces/:workspaceId/services` - Crea servizio
- `PUT /api/workspaces/:workspaceId/services/:id` - Aggiorna servizio
- `DELETE /api/workspaces/:workspaceId/services/:id` - Elimina servizio

## Orders
- `GET /api/workspaces/:workspaceId/orders` - Lista ordini
- `GET /api/orders/:id` - Dettaglio ordine (by ID)
- `GET /api/orders/code/:code` - Dettaglio ordine (by code)
- `GET /api/orders/customer/:customerId` - Ordini di un cliente
- `GET /api/orders/analytics/:workspaceId` - Analytics ordini
- `GET /api/orders/date-range/:workspaceId` - Ordini per date range
- `POST /api/workspaces/:workspaceId/orders` - Crea ordine
- `PUT /api/orders/:id` - Aggiorna ordine
- `DELETE /api/orders/:id` - Elimina ordine
- `PATCH /api/orders/:id/status` - Aggiorna stato ordine

## Public Orders (con token)
- `GET /api/internal/orders/:token` - Accesso ordini via token
- `GET /api/internal/invoices/:token` - Accesso fatture via token
- `GET /api/internal/shipments/:token` - Accesso spedizioni via token
- `POST /api/internal/validate-secure-token` - Valida secure token

## Customers
- `GET /api/customers` - Lista clienti
- `GET /api/customers/:id` - Dettaglio cliente
- `POST /api/customers` - Crea cliente
- `PUT /api/customers/:id` - Aggiorna cliente
- `DELETE /api/customers/:id` - Elimina cliente
- `POST /api/customers/block/:id` - Blocca cliente

## Sales
- `GET /api/workspaces/:workspaceId/sales` - Lista vendite
- `GET /api/workspaces/:workspaceId/sales/:id` - Dettaglio vendita
- `GET /api/workspaces/:workspaceId/sales/customer/:customerId` - Vendite cliente
- `POST /api/workspaceId/sales` - Crea vendita
- `PUT /api/workspaces/:workspaceId/sales/:id` - Aggiorna vendita
- `DELETE /api/workspaces/:workspaceId/sales/:id` - Elimina vendita

## FAQs
- `GET /api/workspaces/:workspaceId/faqs` - Lista FAQ
- `GET /api/workspaces/:workspaceId/faqs/:id` - Dettaglio FAQ
- `POST /api/workspaces/:workspaceId/faqs` - Crea FAQ
- `PUT /api/workspaces/:workspaceId/faqs/:id` - Aggiorna FAQ
- `DELETE /api/workspaces/:workspaceId/faqs/:id` - Elimina FAQ

## Documents (RAG)
- `GET /api/workspaces/:workspaceId/documents` - Lista documenti
- `POST /api/workspaces/:workspaceId/documents/upload` - Upload documento
- `POST /api/workspaces/:workspaceId/documents/search` - Ricerca semantica
- `DELETE /api/workspaces/:workspaceId/documents/:id` - Elimina documento

## Agent Configuration
- `GET /api/workspaces/:workspaceId/agent` - Lista agenti
- `GET /api/workspaces/:workspaceId/agent/:id` - Dettaglio agente
- `POST /api/workspaces/:workspaceId/agent` - Crea agente
- `PUT /api/workspaces/:workspaceId/agent/:id` - Aggiorna agente
- `DELETE /api/workspaces/:workspaceId/agent/:id` - Elimina agente

## Chat
- `GET /api/chat/recent` - Chat recenti
- `GET /api/chat/:customerId/history` - Storico chat
- `POST /api/chat/send` - Invia messaggio
- `POST /api/whatsapp/webhook` - Webhook WhatsApp (senza auth)

## Cart & Checkout
- `POST /api/cart-tokens` - Genera token carrello
- `GET /api/cart-tokens/:token/validate` - Valida token carrello
- `POST /api/cart/generate-token` - Genera token carrello
- `POST /api/cart/add` - Aggiungi al carrello
- `PUT /api/cart/item` - Aggiorna item carrello
- `DELETE /api/cart/item/:id` - Rimuovi item carrello
- `DELETE /api/cart/clear` - Svuota carrello
- `GET /api/cart/summary` - Riepilogo carrello
- `POST /api/cart/checkout` - Checkout carrello

## Analytics
- `GET /api/analytics/:workspaceId/dashboard` - Dashboard analytics
- `GET /api/analytics/:workspaceId/detailed` - Metriche dettagliate
- `GET /api/analytics/:workspaceId/monthly-top-customers` - Top clienti mensili

## Settings
- `GET /api/settings/gdpr` - Impostazioni GDPR
- `PUT /api/settings/gdpr` - Aggiorna GDPR
- `GET /api/gdpr/default` - Contenuto GDPR default

## Registration
- `POST /api/registration/register` - Registrazione nuovo utente

## Offers (se implementato)
- Endpoint per offerte (da verificare se effettivamente usato)

## Health
- `GET /api/health` - Health check

## NON usati dal frontend (da rimuovere):
- Tutti gli endpoint `/api/messages/*` (deprecated)
- Endpoint `/api/whatsapp/*` tranne webhook
- Endpoint `/api/openai/test` (solo test)
- Route duplicate o di test
