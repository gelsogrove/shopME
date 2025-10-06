# 🧪 TEST MANUALE - Servizi nel Checkout

## Setup Test Environment

### Prerequisiti

1. Database con servizi attivi
2. Cliente di test con workspace configurato
3. Token di accesso valido al carrello

---

## Test Case 1: Carrello Misto (Prodotti + Servizi)

### Obiettivo

Verificare che un ordine con prodotti e servizi venga creato correttamente.

### Steps

1. **Svuota il carrello**

   ```bash
   DELETE /api/cart/:token/items (per ogni item)
   ```

2. **Aggiungi 2 prodotti**

   ```bash
   POST /api/cart/:token/items
   Body: {
     "productId": "prod_1",
     "itemType": "PRODUCT",
     "quantity": 2
   }

   POST /api/cart/:token/items
   Body: {
     "productId": "prod_2",
     "itemType": "PRODUCT",
     "quantity": 1
   }
   ```

3. **Aggiungi 1 servizio**

   ```bash
   POST /api/cart/:token/items
   Body: {
     "serviceId": "service_1",
     "itemType": "SERVICE",
     "quantity": 1,
     "notes": "Test service booking"
   }
   ```

4. **Verifica carrello**

   ```bash
   GET /api/cart/:token
   ```

   **Aspettative:**

   - `items.length === 3`
   - 2 items con `itemType: "PRODUCT"`
   - 1 item con `itemType: "SERVICE"`
   - `totalAmount` = (prod1.price \* 2) + prod2.price + service1.price

5. **Checkout**

   ```bash
   POST /api/cart/:token/checkout
   Body: {
     "shippingAddress": {...},
     "paymentMethod": "CASH"
   }
   ```

   **Aspettative:**

   - Response: `success: true`
   - `order.itemCount === 3`
   - Order creato con status PENDING

6. **Verifica ordine nel database**

   ```sql
   SELECT * FROM order_items WHERE orderId = 'order_id';
   ```

   **Aspettative:**

   - 3 righe totali
   - 2 righe con `itemType = 'PRODUCT'` e `productId` valorizzato
   - 1 riga con `itemType = 'SERVICE'` e `serviceId` valorizzato
   - Service item ha `unitPrice` corretto
   - Service item ha `totalPrice` corretto

### ✅ Risultato Atteso

Ordine creato con 2 PRODUCT items + 1 SERVICE item, tutti con prezzi corretti.

---

## Test Case 2: Solo Servizi

### Obiettivo

Verificare che un ordine con solo servizi funzioni correttamente.

### Steps

1. **Svuota il carrello**

2. **Aggiungi 2 servizi**

   ```bash
   POST /api/cart/:token/items
   Body: {
     "serviceId": "service_haircut",
     "itemType": "SERVICE",
     "quantity": 1,
     "notes": "Taglio + barba"
   }

   POST /api/cart/:token/items
   Body: {
     "serviceId": "service_massage",
     "itemType": "SERVICE",
     "quantity": 1
   }
   ```

3. **Checkout**

   ```bash
   POST /api/cart/:token/checkout
   ```

4. **Verifica ordine**

   **Aspettative:**

   - 2 OrderItems con `itemType = 'SERVICE'`
   - Nessun `productId` valorizzato
   - `serviceId` correttamente salvato
   - Prezzi corretti

### ✅ Risultato Atteso

Ordine con solo servizi creato correttamente.

---

## Test Case 3: Sconto Cliente su Servizi

### Obiettivo

Verificare che lo sconto cliente venga applicato anche ai servizi.

### Prerequisiti

- Cliente con `discount: 10` (10%)

### Steps

1. **Aggiungi servizio €100**

   ```bash
   POST /api/cart/:token/items
   Body: {
     "serviceId": "service_expensive",  // price: 100
     "itemType": "SERVICE",
     "quantity": 1
   }
   ```

2. **Verifica prezzi nel carrello**

   ```bash
   GET /api/cart/:token
   ```

   **Aspettative:**

   - Service item con:
     - `prezzoOriginale: 100`
     - `prezzo: 90` (sconto 10%)
     - `scontoApplicato: 10`
     - `fonteSconto: "customer"`

3. **Checkout e verifica OrderItem**

   **Aspettative:**

   - `unitPrice: 90`
   - `totalPrice: 90`

### ✅ Risultato Atteso

Sconto cliente applicato correttamente al servizio.

---

## Test Case 4: Checkout Form (Frontend)

### Obiettivo

Verificare il flusso completo dal frontend.

### Steps

1. **Apri CheckoutPage con token valido**

   ```
   http://localhost:3000/checkout?token=YOUR_TOKEN
   ```

2. **Aggiungi servizi tramite UI**

   - Click "Aggiungi Servizi"
   - Seleziona 1 servizio
   - Verifica badge "🎯 SERVIZIO"
   - Verifica durata mostrata

3. **Aggiungi prodotti tramite UI**

   - Click "Aggiungi Prodotti"
   - Seleziona 2 prodotti

4. **Verifica riepilogo**

   - Prodotti mostrati con icone corrette
   - Servizi mostrati con badge SERVICE
   - Totale calcolato correttamente

5. **Compila indirizzi e checkout**

   - Compila shipping address
   - Submit order

6. **Verifica ordine creato**
   - Vai a Orders page
   - Trova ordine appena creato
   - Verifica items visualizzati correttamente
   - Servizi hanno badge "Service"
   - Durata servizio mostrata

### ✅ Risultato Atteso

Flusso frontend completo funzionante con servizi.

---

## Test Case 5: API Endpoint /checkout/validate-token

### Obiettivo

Verificare che la validazione token restituisca servizi correttamente.

### Steps

1. **Crea carrello con prodotti + servizi**

2. **Valida token**

   ```bash
   GET /api/checkout/validate-token?token=YOUR_TOKEN
   ```

3. **Verifica response**

   **Aspettative:**

   ```json
   {
     "valid": true,
     "customer": {...},
     "prodotti": [
       {
         "itemType": "PRODUCT",
         "productId": "...",
         "codice": "...",
         "descrizione": "...",
         "prezzo": 100,
         "qty": 2
       },
       {
         "itemType": "SERVICE",
         "serviceId": "...",
         "codice": "SRV001",
         "descrizione": "Haircut",
         "duration": 60,
         "notes": "...",
         "prezzo": 50,
         "qty": 1
       }
     ],
     "totalAmount": 250
   }
   ```

### ✅ Risultato Atteso

Array `prodotti` contiene sia PRODUCT che SERVICE items con tutti i campi corretti.

---

## Test Case 6: Submit Order da Frontend Checkout Form

### Obiettivo

Testare `POST /api/checkout/submit` con servizi.

### Steps

1. **Valida token e ottieni prodotti**

   ```bash
   GET /api/checkout/validate-token?token=TOKEN
   ```

2. **Submit order con array misto**

   ```bash
   POST /api/checkout/submit
   Body: {
     "token": "TOKEN",
     "prodotti": [
       {
         "itemType": "PRODUCT",
         "productId": "prod1",
         "codice": "PROD001",
         "descrizione": "Product Name",
         "prezzo": 100,
         "qty": 1
       },
       {
         "itemType": "SERVICE",
         "serviceId": "srv1",
         "codice": "SRV001",
         "descrizione": "Service Name",
         "duration": 60,
         "notes": "Test notes",
         "prezzo": 50,
         "qty": 1
       }
     ],
     "shippingAddress": {...},
     "billingAddress": {...}
   }
   ```

3. **Verifica response**

   **Aspettative:**

   - `success: true`
   - `orderId` presente
   - `orderCode` generato (5 lettere)

4. **Verifica database**

   ```sql
   SELECT * FROM order_items
   WHERE orderId = 'order_id';
   ```

   **Aspettative:**

   - 1 riga PRODUCT con `productId`
   - 1 riga SERVICE con `serviceId`
   - `productVariant` contiene `duration` e `notes` per service

### ✅ Risultato Atteso

Order creato correttamente da checkout form con servizi.

---

## Checklist Generale

### Backend

- [ ] `cart.controller.ts` include `service: true`
- [ ] Calcolo totali gestisce PRODUCT + SERVICE
- [ ] OrderItems creati con `itemType` corretto
- [ ] `serviceId` salvato per SERVICE items
- [ ] Prezzi calcolati correttamente
- [ ] Sconti cliente applicati a servizi

### Frontend

- [ ] CheckoutPage mostra bottone "Aggiungi Servizi"
- [ ] Modal servizi funzionante
- [ ] Badge "🎯 SERVIZIO" visibile
- [ ] Durata servizio mostrata
- [ ] Totali calcolati correttamente
- [ ] OrdersPage mostra servizi negli ordini
- [ ] Icone servizi corrette

### Database

- [ ] OrderItems contiene righe con `itemType='SERVICE'`
- [ ] `serviceId` valorizzato
- [ ] `unitPrice` e `totalPrice` corretti
- [ ] `productVariant` contiene metadata servizio

---

## 🐛 Troubleshooting

### Issue: "Service not found" error

**Causa:** `serviceId` non esiste nel workspace  
**Fix:** Verifica che il servizio sia attivo e nel workspace corretto

### Issue: Prezzo servizio = 0

**Causa:** Service relation non inclusa nella query  
**Fix:** Verificare che `include: { service: true }` sia presente

### Issue: itemType sempre "PRODUCT"

**Causa:** Logica di creazione OrderItems non aggiornata  
**Fix:** Verificare che il codice usi `item.itemType` per discriminare

### Issue: Service metadata persa

**Causa:** `productVariant` non include `duration` e `notes`  
**Fix:** Verificare mapping in `submitOrder()` e `checkoutByToken()`

---

**Test Completo: ✅ READY**  
**Deployment: ✅ GO AHEAD**
