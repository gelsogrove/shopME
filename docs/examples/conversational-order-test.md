# Test Conversational Order Flow

## Scenario di Test: Ordine di Abbigliamento

### 1. **Conversazione Cliente**

```
Cliente: "Ciao! Sto cercando una maglietta"
Bot: "Ciao! Che tipo di maglietta stai cercando? Abbiamo diverse opzioni disponibili."

Cliente: "Vorrei una maglietta rossa, taglia M"
Bot: "✅ Perfetto! Maglietta rossa taglia M aggiunta alla tua selezione."

Cliente: "E anche un paio di jeans blu, taglia 32"  
Bot: "✅ Ottimo! Jeans blu taglia 32 aggiunti alla tua selezione."

Cliente: "Quanto verrebbe tutto?"
Bot: "Il totale provvisorio è €105:
     • Maglietta rossa M: €25.00
     • Jeans blu 32: €80.00"

Cliente: "Perfetto, procediamo con l'ordine"
Bot: **[TRIGGER]** → Chiama confirmOrderFromConversation()
```

### 2. **Chiamata Funzione LangChain**

```json
{
  "function_name": "confirmOrderFromConversation",
  "parameters": {
    "conversationContext": "Cliente vuole maglietta rossa M e jeans blu 32, ha confermato ordine",
    "prodottiSelezionati": [
      {
        "nome": "maglietta rossa",
        "quantita": 1,
        "descrizione": "taglia M"
      },
      {
        "nome": "jeans blu", 
        "quantita": 1,
        "descrizione": "taglia 32"
      }
    ]
  }
}
```

### 3. **Elaborazione Backend**

La funzione `confirmOrderFromConversation()`:

1. ✅ **Valida parametri** (customerId, workspaceId, prodotti)
2. ✅ **Cerca prodotti nel DB**:
   ```sql
   SELECT * FROM products WHERE 
   workspaceId = ? AND (
     name ILIKE '%maglietta rossa%' OR 
     description ILIKE '%maglietta rossa%' OR
     name ILIKE '%jeans blu%' OR
     description ILIKE '%jeans blu%'
   ) AND isActive = true
   ```
3. ✅ **Calcola prezzi** con eventuali sconti
4. ✅ **Genera token sicuro** (SHA256, validità 1 ora)
5. ✅ **Salva in secure_tokens** con payload completo
6. ✅ **Crea URL checkout**

### 4. **Risposta Bot**

```
🛒 **Riepilogo Ordine**

• Maglietta Basic Rossa (SHIRT001)
  Quantità: 1 x €25.00 = €25.00

• Jeans Denim Blu (JEANS003)  
  Quantità: 1 x €80.00 = €80.00

💰 **Totale: €105.00**

🔗 **Finalizza il tuo ordine:**
https://shopme.com/checkout/a1b2c3d4e5f6g7h8

⏰ Link valido per 1 ora
🔐 Checkout sicuro

📝 Nel checkout potrai:
• Verificare i prodotti selezionati
• Inserire l'indirizzo di spedizione  
• Scegliere il metodo di pagamento
• Confermare definitivamente l'ordine
```

### 5. **Completamento Web**

Cliente clicca il link → Reindirizzato a:
- ✅ **Checkout Page** con prodotti precompilati
- ✅ **Form indirizzi** (spedizione + fatturazione)
- ✅ **Selezione pagamento** (carta, PayPal, etc.)
- ✅ **Conferma finale** → Ordine creato nel database

## Vantaggi vs Flussi Esistenti

| Aspetto | Cart Traditional | Checkout Link Diretto | **Conversational Flow** |
|---------|------------------|----------------------|-------------------------|
| **UX** | Multi-step (add_to_cart) | Prodotti già noti | **Chat naturale** |
| **Memoria** | Database cart | Parameter espliciti | **LLM context** |
| **Flessibilità** | Rigida | Media | **Massima** |
| **Completamento** | WhatsApp | Web form | **Chat → Web** |
| **Sicurezza** | Session-based | Token 1h | **Token 1h** |

## Test Cases

### ✅ Success Case
- Prodotti esistenti nel catalogo
- Quantità valide
- Cliente e workspace validi
- Token generato correttamente

### ❌ Error Cases
- Prodotto non trovato: "Non riesco a trovare..."
- Quantità non specificata: "Puoi specificare la quantità?"
- Parametri mancanti: "Si è verificato un errore..."
- Token scaduto: Gestito dal checkout controller

## Compatibilità Checkout

Il token generato è **100% compatibile** con il checkout controller esistente perché:

```typescript
// Token payload format (identico)
{
  customerId: "...",
  prodotti: [
    {codice: "SHIRT001", descrizione: "Maglietta", qty: 1, prezzo: 25.00},
    {codice: "JEANS003", descrizione: "Jeans", qty: 1, prezzo: 80.00}
  ],
  type: "conversational_order_checkout" // Nuovo tipo per tracking
}
```

Il checkout controller usa `prodotti` array che è identico in tutti i flussi!