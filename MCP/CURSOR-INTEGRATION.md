# ShopMe MCP - Integrazione con Cursor

## 🎯 **INTEGRAZIONE COMPLETATA**

Il server MCP ShopMe è ora **completamente integrato** con Cursor AI!

## ✅ **STATO ATTUALE:**

- **✅ Server MCP attivo** - PID 27863
- **✅ Configurazione Cursor** aggiornata in `~/.cursor/mcp.json`
- **✅ 4 tool disponibili** per test e debug
- **✅ Backup configurazione** creato automaticamente

## 🛠️ **TOOL MCP DISPONIBILI IN CURSOR:**

### 1. **`mcp_shopme_test_chat`**
Testa il chatbot WhatsApp con utente e messaggio specifici.

**Parametri:**
- `user`: Nome utente (es. "Mario Rossi", "John Smith")
- `message`: Messaggio da inviare
- `log`: Abilita logging dettagliato (default: true)
- `exitFirstMessage`: Esce dopo prima risposta (default: true)

**Esempio in Cursor:**
```
mcp_shopme_test_chat("Mario Rossi", "aggiungi una mozzarella al carrello")
```

### 2. **`mcp_shopme_seed_database`**
Popola il database con dati iniziali.

**Esempio in Cursor:**
```
mcp_shopme_seed_database()
```

### 3. **`mcp_shopme_check_health`**
Verifica lo stato del backend ShopMe.

**Esempio in Cursor:**
```
mcp_shopme_check_health()
```

### 4. **`mcp_shopme_debug_function`**
Debug di funzioni specifiche del chatbot.

**Parametri:**
- `functionName`: Nome funzione (es. "ragSearch", "add_to_cart")
- `testData`: Dati di test (opzionale)

**Esempio in Cursor:**
```
mcp_shopme_debug_function("ragSearch", {"query": "delivery times"})
```

## 🚀 **COME USARE IN CURSOR:**

### **Passo 1: Riavvia Cursor**
Chiudi completamente Cursor e riaprilo per caricare la nuova configurazione MCP.

### **Passo 2: Usa i Tool**
Nel chat di Cursor, puoi ora usare direttamente i tool ShopMe:

```
# Test del chatbot
mcp_shopme_test_chat("Mario Rossi", "aggiungi una mozzarella al carrello")

# Test del seed
mcp_shopme_seed_database()

# Controllo salute
mcp_shopme_check_health()

# Debug funzione
mcp_shopme_debug_function("add_to_cart", {"product_name": "mozzarella"})
```

### **Passo 3: Automazione**
Cursor può ora:
- **Testare automaticamente** il chatbot
- **Debugare funzioni** specifiche
- **Verificare lo stato** del sistema
- **Popolare il database** quando necessario

## 🔧 **GESTIONE SERVER:**

### **Avvio Automatico:**
```bash
cd /Users/gelso/workspace/AI/shop/MCP
./start-shopme-mcp-for-cursor.sh
```

### **Verifica Stato:**
```bash
ps aux | grep "mcp-server.js" | grep -v grep
```

### **Fermata Server:**
```bash
pkill -f "mcp-server.js"
```

## 📁 **FILE DI CONFIGURAZIONE:**

- **Configurazione Cursor**: `~/.cursor/mcp.json`
- **Backup configurazione**: `~/.cursor/mcp.json.backup.*`
- **Server MCP**: `/Users/gelso/workspace/AI/shop/MCP/mcp-server.js`
- **Script avvio**: `/Users/gelso/workspace/AI/shop/MCP/start-shopme-mcp-for-cursor.sh`

## 🎯 **ESEMPI PRATICI:**

### **Test Completo del Flusso:**
```
# 1. Aggiungi mozzarella
mcp_shopme_test_chat("Mario Rossi", "aggiungi una mozzarella al carrello")

# 2. Aggiungi prosecco
mcp_shopme_test_chat("Mario Rossi", "aggiungi un prosecco")

# 3. Conferma ordine
mcp_shopme_test_chat("Mario Rossi", "CONFERMA")
```

### **Debug Funzioni:**
```
# Debug ragSearch
mcp_shopme_debug_function("ragSearch", {"query": "delivery times"})

# Debug add_to_cart
mcp_shopme_debug_function("add_to_cart", {"product_name": "mozzarella"})

# Debug confirmOrderFromConversation
mcp_shopme_debug_function("confirmOrderFromConversation", {})
```

## 🚨 **RISOLUZIONE PROBLEMI:**

### **Server non si avvia:**
```bash
cd /Users/gelso/workspace/AI/shop/MCP
npm install
node mcp-server.js
```

### **Cursor non rileva i tool:**
1. Verifica che il server MCP sia attivo
2. Riavvia Cursor completamente
3. Controlla `~/.cursor/mcp.json`

### **Tool non funzionano:**
1. Verifica che il backend ShopMe sia attivo (porta 3001)
2. Controlla i logs del server MCP
3. Usa `mcp_shopme_check_health()` per verificare

## 🎉 **VANTAGGI OTTENUTI:**

- **✅ Integrazione nativa** con Cursor AI
- **✅ Test automatici** del chatbot
- **✅ Debug efficiente** delle funzioni
- **✅ Automazione** dei test ricorrenti
- **✅ Standardizzazione** dei test
- **✅ Accesso diretto** ai tool dal chat di Cursor

**Il server MCP ShopMe è ora completamente integrato con Cursor!** 🎉

