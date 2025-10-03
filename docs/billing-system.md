# Sistema di Fatturazione - Documentazione Tecnica

## 📋 Overview

Il sistema di fatturazione traccia automaticamente tutti i costi secondo la pricing list ufficiale con integrazione completa in tutti i controller.

## 💰 Pricing List Implementata

| Servizio         | Costo | Descrizione                           |
| ---------------- | ----- | ------------------------------------- |
| **Human Response** | €0.05 | 5 centesimi per risposta operatore   |
| **LLM Response** | €0.15 | 15 centesimi per risposta chatbot     |
| **New Customer** | €1.50 | 1.50 euro per nuovo cliente registrato   |
| **New Order**    | €1.50 | 1.50 euro per ordine completo     |
| **Push Message** | €0.50 | 50 centesimi per notifiche standalone |

## 🏗️ Architettura

### Core Services

#### `usageService.trackUsage()`

- **File**: `backend/src/services/usage.service.ts`
- **Scopo**: Single point of truth per tracking costi
- **Parametri**: `workspaceId`, `clientId`, `price`

#### `pushMessagingService`

- **File**: `backend/src/services/push-messaging.service.ts`
- **Scopo**: Gestione push notifications con billing integrato
- **Logica**: Traccia €0.5 solo per push NON-ORDER (evita double billing)

### Controller Integration

#### 1. Order Controllers

**File**: `cart.controller.ts`, `checkout.controller.ts`, `order.controller.ts`

```typescript
// Track complete order cost (€1.50: order + push notification)
await prisma.usage.create({
  data: {
    workspaceId: workspaceId,
    clientId: customerId,
    price: 1.5,
  },
})
```

#### 2. Customer Controller

**File**: `customers.controller.ts`

```typescript
// Tracks €0.5 for chatbot reactivation push
await this.pushMessagingService.sendChatbotReactivated(...)
```

#### 3. Push Message Controller

**File**: `push-messaging.service.ts`

```typescript
// Skip billing for order confirmations (already billed in order)
if (data.type !== PushMessageType.ORDER_CONFIRMED) {
  await this.trackPushCost(data.workspaceId, data.customerId)
}
```

## 🔧 Configurazione

### Config File

**File**: `backend/src/config.ts`

```typescript
export const config: Config = {
  llm: {
    defaultPrice: 0.15, // €0.15 per LLM response
  },
  pushMessaging: {
    price: 0.5, // €0.5 per push message
  },
}
```

### Environment Variables

```env
DEFAULT_LLM_PRICE=0.15
PUSH_MESSAGE_PRICE=0.50
```

## 📊 Database Schema

### Usage Table

```sql
CREATE TABLE usage (
  id UUID PRIMARY KEY,
  workspaceId UUID NOT NULL,
  clientId UUID NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Flow Completo

### Nuovo Ordine

1. **Cart/Checkout Controller**: Crea ordine
2. **Usage Tracking**: Traccia €1.50 (ordine + push)
3. **Push Service**: Invia conferma (senza billing aggiuntivo)
4. **Database**: Record usage con €1.50

### Push Standalone

1. **Customer Controller**: Attiva chatbot
2. **Push Service**: Invia notifica + traccia €0.5
3. **Database**: Record usage con €0.5

### LLM Response

1. **Message Repository**: Salva risposta AI
2. **Usage Service**: Traccia €0.15
3. **Database**: Record usage con €0.15

## ✅ Vantaggi Sistema

- **Single Point of Truth**: Tutti i costi passano per `usageService`
- **No Double Billing**: Push ordini non vengono fatturati separatamente
- **Atomic Operations**: Ogni transazione è completa e consistente
- **Configurable**: Prezzi modificabili via environment variables
- **Comprehensive**: Copre tutti i punti di fatturazione del sistema

## 🔍 Testing

Per testare il sistema:

1. **Ordine**: Deve aggiungere €1.50
2. **Push Chatbot**: Deve aggiungere €0.5
3. **LLM Response**: Deve aggiungere €0.15
4. **Totali**: Verificare somme corrette nel dashboard

## 📝 Note Implementative

- **Error Handling**: Errori di billing non bloccano operazioni principali
- **Logging**: Tutti i tracking sono loggati per debugging
- **Performance**: Operazioni async per non impattare UX
- **Scalability**: Pronto per volumi elevati di transazioni
