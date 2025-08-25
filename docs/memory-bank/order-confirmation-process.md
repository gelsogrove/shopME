# Order Confirmation Process - Complete Flow

## 🎯 **OVERVIEW**

Il processo di conferma ordine è un flusso completo che trasforma una conversazione WhatsApp in un ordine finale. Il sistema è **deterministico** e **consistente**.

## 🔄 **FLUSSO COMPLETO**

### **1. 📱 Conversazione WhatsApp**
```
👤 Cliente: "Metti 4 mozzarelle"
🤖 AI: "Ho aggiunto 4 Mozzarella di Bufala al tuo carrello! 🧀"
👤 Cliente: "Confermo"
```

### **2. 🔗 Calling Function Trigger**
- **Trigger**: Parole chiave ("Confermo", "Procedi", "Ok ordina")
- **Function**: `confirmOrderFromConversation()`
- **Input**: Ultimi 10 messaggi + prodotti identificati

### **3. 🧠 LLM Processing (Backend)**
- **Parsing**: Analisi conversazione con LLM interno
- **Extraction**: Prodotti, quantità, prezzi
- **Validation**: Controllo disponibilità stock
- **Calculation**: Totale ordine

### **4. 🔐 Token Generation**
- **Type**: `checkout`
- **Duration**: 1 ora
- **Payload**: Customer + Prodotti + Indirizzi
- **Security**: Token sicuro 32 caratteri

### **5. 🌐 URL Generation**
- **Format**: `http://localhost:3000/checkout-public?token=abc123...`
- **Domain**: Sempre `localhost:3000` (consistente)
- **Access**: Pubblico con token

### **6. 📋 Frontend Checkout**
- **Step 1**: Prodotti (modifica quantità, rimozione)
- **Step 2**: Indirizzi (spedizione + fatturazione)
- **Step 3**: Conferma finale

### **7. ✅ Order Submission**
- **API**: `POST /api/checkout/submit`
- **Validation**: Token + dati completi
- **Creation**: Ordine nel database
- **Notifications**: Email + WhatsApp

## 🏗️ **ARCHITETTURA TECNICA**

### **Backend Components**

#### **1. Calling Function**
```typescript
// File: confirmOrderFromConversation.ts
export async function confirmOrderFromConversation({
  customerId,
  workspaceId,
  conversationContext,
  prodottiSelezionati
})
```

#### **2. Token Service**
```typescript
// File: secure-token.service.ts
const token = await tokenService.createToken(
  "checkout",
  workspaceId,
  payload,
  "1h",
  customerId
)
```

#### **3. Checkout Controller**
```typescript
// File: checkout.controller.ts
async submitOrder(req: Request, res: Response)
async validateToken(req: Request, res: Response)
```

### **Frontend Components**

#### **1. Checkout Page**
```typescript
// File: CheckoutPage.tsx
const CheckoutPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [prodotti, setProdotti] = useState<Product[]>([])
  const [formData, setFormData] = useState<FormData>()
}
```

#### **2. Token Validation Hook**
```typescript
// File: useTokenValidation.ts
const { valid, loading, error, tokenData } = useCheckoutTokenValidation(token)
```

## 📊 **DATABASE SCHEMA**

### **SecureToken Table**
```sql
CREATE TABLE secure_token (
  id TEXT PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- 'checkout'
  workspaceId TEXT NOT NULL,
  customerId TEXT,
  payload JSONB,
  expiresAt TIMESTAMP,
  isActive BOOLEAN DEFAULT true,
  usedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### **Orders Table**
```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  orderCode TEXT UNIQUE NOT NULL, -- ORD-20241201-001
  customerId TEXT NOT NULL,
  workspaceId TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  totalAmount DECIMAL(10,2),
  shippingAddress JSONB,
  billingAddress JSONB,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

## 🔧 **API ENDPOINTS**

### **1. Confirm Order Conversation**
```http
POST /api/internal/confirm-order-conversation
Authorization: Basic admin:admin
Content-Type: application/json

{
  "customerId": "customer-123",
  "workspaceId": "workspace-456",
  "conversationContext": "Cliente: Metti 4 mozzarelle...",
  "prodottiSelezionati": [
    {
      "nome": "Mozzarella di Bufala",
      "quantita": 4,
      "codice": "MOZ001"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "checkoutToken": "abc123def456...",
  "checkoutUrl": "http://localhost:3000/checkout-public?token=abc123...",
  "totalAmount": 34.00,
  "expiresAt": "2024-12-01T12:00:00Z"
}
```

### **2. Validate Checkout Token**
```http
GET /api/checkout/validate?token=abc123...
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "customer": { "id": "customer-123", "name": "Maria Garcia" },
  "prodotti": [
    {
      "codice": "MOZ001",
      "descrizione": "Mozzarella di Bufala",
      "qty": 4,
      "prezzo": 8.50
    }
  ]
}
```

### **3. Submit Order**
```http
POST /api/checkout/submit
Content-Type: application/json

{
  "token": "abc123...",
  "prodotti": [...],
  "shippingAddress": { "name": "...", "street": "..." },
  "billingAddress": { "name": "...", "street": "..." },
  "notes": "Note aggiuntive"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order-789",
  "orderCode": "ORD-20241201-001"
}
```

## 🧪 **TESTING STRATEGY**

### **Integration Tests**

#### **1. Order Confirmation Backend**
```typescript
// File: 11_order-confirmation-backend.integration.spec.ts
test("4 mozzarelle conversation should generate valid token")
```

#### **2. Link Consistency**
```typescript
// File: 12_checkout-link-consistency.integration.spec.ts
test("Same conversation should always generate same token")
test("Different conversations should generate different tokens")
```

#### **3. Frontend Checkout**
```typescript
// File: checkout-page.integration.test.tsx
test("Checkout page should render with token data")
```

### **Test Scenarios**

#### **Scenario 1: Conferma Base**
- **Input**: "Metti 4 mozzarelle" + "Confermo"
- **Expected**: Token valido, URL localhost:3000, totale €34.00

#### **Scenario 2: Modifica Prodotti**
- **Input**: Prodotti nel checkout + modifica quantità
- **Expected**: Totale aggiornato, ordine con quantità corrette

#### **Scenario 3: Indirizzi Completi**
- **Input**: Indirizzo spedizione + fatturazione diverso
- **Expected**: Ordine con entrambi gli indirizzi

## 🔒 **SICUREZZA**

### **Token Security**
- **Generation**: Crypto.randomBytes + SHA256
- **Length**: 32 caratteri alfanumerici
- **Expiration**: 1 ora automatica
- **Usage**: One-time use (marked as used)

### **Workspace Isolation**
- **Filtering**: Tutte le query filtrano per workspaceId
- **Validation**: Token contiene workspaceId
- **Access**: Solo customer del workspace

### **Data Validation**
- **Input**: Validazione prodotti, quantità, prezzi
- **Address**: Validazione indirizzi completi
- **Token**: Verifica esistenza e validità

## 📈 **MONITORING**

### **Logs**
```typescript
logger.info("[CONFIRM_ORDER_CONVERSATION] Checkout link created: ${token}")
logger.info("[CHECKOUT] Order created: ${orderCode} for customer ${customerId}")
```

### **Metrics**
- Token generation success rate
- Checkout completion rate
- Order submission success rate
- Average checkout time

## 🚀 **DEPLOYMENT**

### **Environment Variables**
```bash
FRONTEND_URL=http://localhost:3000
OPENROUTER_API_KEY=your_key_here
```

### **Database Migrations**
- SecureToken table (esiste)
- Orders table (esiste)
- Indexes per performance

### **N8N Integration**
- Workflow aggiornato con calling function
- Credenziali configurate
- Test automatici

## ✅ **STATO ATTUALE**

### **✅ Completato**
- [x] Calling function `confirmOrderFromConversation`
- [x] Token generation e validation
- [x] Frontend CheckoutPage completa
- [x] API submit order
- [x] N8N workflow configurato
- [x] Integration tests
- [x] Swagger documentation

### **🔄 In Sviluppo**
- [ ] Test di consistenza link
- [ ] Validazione completa token
- [ ] Notifiche email/WhatsApp

### **📋 TODO**
- [ ] Aggiornamento PRD
- [ ] Aggiornamento Swagger
- [ ] Memory Bank sync
- [ ] Production testing

## 🎯 **SUCCESS CRITERIA**

1. **Deterministico**: Stesso input → Stesso output
2. **Consistente**: URL sempre localhost:3000
3. **Sicuro**: Token validi e isolati per workspace
4. **Completo**: Carrello + indirizzi nel token
5. **Funzionale**: End-to-end working flow

---

**Ultimo aggiornamento**: 2024-12-01
**Versione**: 1.0
**Stato**: ✅ Funzionante

---

## 🎯 **RIASSUNTO FLUSSO COMPLETO**

### **📱 FLUSSO END-TO-END**

```
1. 👤 Cliente WhatsApp: "Metti 4 mozzarelle"
2. 🤖 AI: "Ho aggiunto 4 Mozzarella di Bufala al carrello! 🧀"
3. 👤 Cliente: "Confermo"
4. 🔗 N8N: Chiama confirmOrderFromConversation()
5. 🧠 Backend: Parsing conversazione + generazione token
6. 🔐 Token: 32 caratteri, 1 ora, payload completo
7. 🌐 URL: http://localhost:3000/checkout-public?token=abc123...
8. 📋 Frontend: 3 step (prodotti → indirizzi → conferma)
9. ✅ Submit: Ordine creato + notifiche inviate
```

### **🔧 COMPONENTI TECNICI**

- **Calling Function**: `confirmOrderFromConversation()`
- **Token Service**: SecureTokenService con crypto
- **Frontend**: CheckoutPage con modifica prodotti
- **API**: 3 endpoint completi (confirm, validate, submit)
- **Database**: SecureToken + Orders tables
- **N8N**: Workflow aggiornato con calling function

### **🔒 SICUREZZA**

- **Workspace Isolation**: Tutte le query filtrano per workspaceId
- **Token Security**: 32 caratteri crypto, 1 ora scadenza
- **One-time Use**: Token marcato come usato dopo submit
- **localhost:3000**: URL consistente sempre

### **✅ CARATTERISTICHE CHIAVE**

- **Deterministico**: Stesso input → Stesso output
- **Consistente**: URL sempre localhost:3000
- **Sicuro**: Token validi e isolati per workspace
- **Completo**: Carrello + indirizzi nel token
- **Funzionale**: End-to-end working flow
