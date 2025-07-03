# 📧 TASK: Implementazione ReceiveInvoice CF Function

**Assignee**: Andrea  
**Priority**: HIGH  
**Status**: 📋 TO DO  
**Endpoint**: `CF/ReceiveInvoice`  
**Created**: 2024-01-15  

---

## 🎯 OBIETTIVO

Implementare la calling function **ReceiveInvoice** che gestisce le richieste di fatture con filtro codice ordine. Se il codice ordine non viene fornito, deve restituire un link alla pagina con lista di tutte le fatture del cliente.

---

## 📋 SPECIFICHE FUNZIONALI

### **Comportamento della Funzione**

#### **1. CON Codice Ordine**
```json
// Input
{
  "orderCode": "ORD-2024-001",
  "workspaceId": "workspace-123", 
  "customerId": "customer-456"
}

// Output
{
  "success": true,
  "type": "direct_invoice",
  "invoice": {
    "orderCode": "ORD-2024-001",
    "invoiceNumber": "INV-2024-001", 
    "pdfUrl": "https://domain.com/invoices/INV-2024-001.pdf",
    "amount": "€45.50",
    "date": "2024-01-15",
    "downloadToken": "secure-token-download"
  },
  "message": "Ecco la fattura per l'ordine ORD-2024-001:"
}
```

#### **2. SENZA Codice Ordine**
```json
// Input
{
  "workspaceId": "workspace-123",
  "customerId": "customer-456"
}

// Output  
{
  "success": true,
  "type": "invoice_list",
  "message": "Ecco tutte le tue fatture:",
  "invoiceListUrl": "https://domain.com/customer/invoices?token=secure-access-token",
  "invoicesCount": 12,
  "secureToken": "secure-token-123"
}
```

---

## 🎨 SPECIFICHE UI - PAGINA LISTA FATTURE

### **Design Requirements**
- ✅ **Stessi colori** della form di registrazione
- ✅ **Layout simile** alla pagina di registrazione  
- ✅ **Responsive design** mobile-first
- ✅ **Branding coerente** con il resto del sistema

### **URL Structure**
```
https://domain.com/customer/invoices?token=secure-access-token
```

### **Componenti UI da Creare**

#### **1. Layout Container**
```tsx
// frontend/src/pages/InvoiceListPage.tsx
- Header con logo ShopMe
- Breadcrumb: Home > Le tue fatture
- Container principale con background pattern
- Footer minimale
```

#### **2. Tabella Fatture**
```tsx
// Colonne richieste:
- Numero Fattura (INV-2024-001)
- Numero Ordine (ORD-2024-001) 
- Data Ordine (15/01/2024)
- Importo (€45.50)
- Azione Download (PDF icon + link)

// Ordinamento: ORDER BY id DESC
// Paginazione: 10 fatture per pagina
```

#### **3. Color Scheme (dalla registrazione)**
```css
/* Usa gli stessi colori della registration form */
--primary-color: /* stesso della registrazione */
--secondary-color: /* stesso della registrazione */
--background-color: /* stesso della registrazione */
--border-color: /* stesso della registrazione */
--text-color: /* stesso della registrazione */
```

---

## 🏗️ IMPLEMENTAZIONE TECNICA

### **Backend Components**

#### **1. CF Function Implementation**
```typescript
// Path: backend/src/chatbot/calling-functions/CF/ReceiveInvoice.ts
export class ReceiveInvoiceFunction {
  async execute(params: {
    orderCode?: string;
    workspaceId: string;
    customerId: string;
  }) {
    // Implementazione logica
  }
}
```

#### **2. Database Schema Updates**
```sql
-- Verificare se esistono tabelle per fatture
-- Se non esistono, creare:

CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  order_code VARCHAR(50) NOT NULL,
  customer_id VARCHAR(255) NOT NULL,
  workspace_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  pdf_url TEXT,
  status VARCHAR(20) DEFAULT 'generated',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indici per performance
CREATE INDEX idx_invoices_customer_workspace ON invoices(customer_id, workspace_id);
CREATE INDEX idx_invoices_order_code ON invoices(order_code);
CREATE INDEX idx_invoices_created_desc ON invoices(created_at DESC);
```

#### **3. API Endpoints**
```typescript
// backend/src/routes/invoice.routes.ts
GET /customer/invoices?token=secure-token  // Lista fatture
GET /invoices/:invoiceId/download?token=secure-token  // Download PDF
POST /CF/ReceiveInvoice  // Calling function endpoint
```

#### **4. Services**
```typescript
// backend/src/services/invoice.service.ts
- getInvoiceByOrderCode()
- getCustomerInvoices() 
- generateSecureInvoiceListToken()
- validateInvoiceAccess()
- generateInvoicePDF()
```

### **Frontend Components**

#### **1. Pages**
```typescript
// frontend/src/pages/InvoiceListPage.tsx
- Pagina principale lista fatture
- Validazione token di accesso
- Gestione stati loading/error
- Design responsive
```

#### **2. Components**
```typescript
// frontend/src/components/invoices/
- InvoiceTable.tsx (tabella fatture)
- InvoiceRow.tsx (singola riga)
- DownloadButton.tsx (pulsante download)
- InvoiceListHeader.tsx (header pagina)
```

#### **3. Services**
```typescript
// frontend/src/services/invoiceApi.ts
- getCustomerInvoices(token)
- downloadInvoicePDF(invoiceId, token)
- validateInvoiceListToken(token)
```

---

## 🔐 SECURITY REQUIREMENTS

### **Token Management**
- ✅ **Secure token generation** per accesso lista fatture
- ✅ **Token expiration** (24h per lista fatture)
- ✅ **Download token** per ogni PDF (1h expiration)
- ✅ **Customer validation** prima dell'accesso
- ✅ **Workspace isolation** (fatture solo del workspace corretto)

### **Access Control**
- ✅ **Token-based authentication** (no login required)
- ✅ **Rate limiting** su download
- ✅ **CORS configuration** appropriata
- ✅ **SQL injection prevention**

---

## 📱 RESPONSIVE DESIGN

### **Mobile First**
```css
/* Mobile (320px-768px) */
- Tabella stackata verticalmente
- Card layout per ogni fattura
- Pulsanti download grandi
- Font size appropriato

/* Tablet (768px-1024px) */  
- Tabella compatta
- 2-3 colonne visibili
- Scroll orizzontale se necessario

/* Desktop (1024px+) */
- Tabella completa
- Tutte le colonne visibili
- Hover effects
- Action buttons inline
```

---

## ✅ ACCEPTANCE CRITERIA

### **Functional Testing**
- [ ] CF function risponde correttamente con codice ordine
- [ ] CF function risponde correttamente senza codice ordine  
- [ ] Pagina lista fatture si carica correttamente
- [ ] Download PDF funziona per ogni fattura
- [ ] Token security funziona correttamente
- [ ] Ordinamento DESC per ID funziona
- [ ] Paginazione funziona (se > 10 fatture)

### **UI/UX Testing**
- [ ] Design coerente con pagina registrazione
- [ ] Colori matching registration form
- [ ] Responsive su mobile/tablet/desktop
- [ ] Loading states appropriati
- [ ] Error handling UI
- [ ] Accessibility compliance

### **Security Testing**  
- [ ] Token validation funziona
- [ ] Non si accede a fatture di altri clienti
- [ ] Non si accede a fatture di altri workspace
- [ ] Rate limiting sui download
- [ ] XSS/CSRF protection

---

## 📦 DELIVERABLES

### **Backend**
1. ✅ CF function `ReceiveInvoice` implementata
2. ✅ Database schema per fatture
3. ✅ API endpoints per lista e download
4. ✅ Service layer completo
5. ✅ Security middleware

### **Frontend**  
1. ✅ Pagina lista fatture responsive
2. ✅ Componenti riutilizzabili
3. ✅ Design matching registration
4. ✅ Error handling completo
5. ✅ Loading states

### **Testing**
1. ✅ Unit tests per CF function
2. ✅ Integration tests per API
3. ✅ E2E tests per UI
4. ✅ Security tests per token

---

## 🚀 IMPLEMENTATION PLAN

### **Phase 1: Backend Core (2-3 giorni)**
1. Database schema setup
2. CF function implementation  
3. Basic API endpoints
4. Token service

### **Phase 2: Frontend UI (2-3 giorni)**
1. Invoice list page
2. Components development
3. API integration
4. Responsive design

### **Phase 3: Security & Testing (1-2 giorni)**
1. Security hardening
2. Comprehensive testing
3. Performance optimization
4. Documentation

### **Phase 4: Integration (1 giorno)**
1. N8N workflow integration
2. End-to-end testing
3. Production deployment
4. Monitoring setup

---

## 🔗 RELATED FILES

### **Reference Files**
- `frontend/src/pages/RegistrationPage.tsx` (per colori e design)
- `backend/src/services/session-token.service.ts` (per token logic)
- `docs/PRD.md` (specifiche aggiornate)
- `CF_functions_list.md` (documentazione CF)

### **Files to Create**
- `backend/src/chatbot/calling-functions/CF/ReceiveInvoice.ts`
- `frontend/src/pages/InvoiceListPage.tsx`
- `backend/src/services/invoice.service.ts`
- `frontend/src/components/invoices/InvoiceTable.tsx`

---

## 📝 NOTES

- ✅ **Priorità HIGH** - Necessario per completare sistema fatturazione
- ✅ **Design consistency** fondamentale per UX
- ✅ **Security first** approach per gestione token
- ✅ **Mobile responsive** obbligatorio  
- ✅ **Performance** - ottimizzare per grandi liste fatture

---

**🎯 SUCCESS METRIC**: Utenti possono accedere e scaricare le loro fatture tramite link sicuro WhatsApp con UX coerente al sistema esistente.

**Andrea, questo task è pronto per lo sviluppo! 🚀**