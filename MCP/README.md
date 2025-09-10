# ShopMe MCP Server

Server MCP (Model Context Protocol) per testare e debuggare il chatbot WhatsApp di ShopMe.

## 🚀 Avvio del Server

### Opzione 1: Script automatico
```bash
./start-mcp-server.sh
```

### Opzione 2: Manuale
```bash
node mcp-server.js &
```

## 🛠️ Tool Disponibili

### 1. `test_chat`
Testa il chatbot WhatsApp con utente e messaggio specifici.

**Parametri:**
- `user`: Nome utente (es. "Mario Rossi", "John Smith")
- `message`: Messaggio da inviare
- `log`: Abilita logging dettagliato (default: true)
- `exitFirstMessage`: Esce dopo prima risposta (default: true)

**Esempio:**
```json
{
  "user": "Mario Rossi",
  "message": "aggiungi una mozzarella al carrello",
  "log": true
}
```

### 2. `seed_database`
Popola il database con dati iniziali.

**Parametri:**
- `log`: Abilita logging dettagliato (default: true)

### 3. `check_health`
Verifica lo stato del backend ShopMe.

**Parametri:** Nessuno

### 4. `debug_function`
Debug di funzioni specifiche del chatbot.

**Parametri:**
- `functionName`: Nome funzione (es. "ragSearch", "add_to_cart")
- `testData`: Dati di test (opzionale)

## 🔧 Integrazione con Cursor

1. **Aggiungi al file di configurazione di Cursor:**
```json
{
  "mcpServers": {
    "shopme": {
      "command": "node",
      "args": ["/Users/gelso/workspace/AI/shop/MCP/mcp-server.js"]
    }
  }
}
```

2. **Riavvia Cursor** per caricare il server MCP

3. **Usa i tool** direttamente in Cursor:
   - `mcp_shopme_test_chat`
   - `mcp_shopme_seed_database`
   - `mcp_shopme_check_health`
   - `mcp_shopme_debug_function`

## 📋 Verifica Stato

```bash
# Controlla se il server è attivo
ps aux | grep "mcp-server.js" | grep -v grep

# Ferma il server
pkill -f "mcp-server.js"
```

## 🎯 Esempi di Utilizzo

### Test Chat Completo
```bash
# Aggiungi mozzarella
mcp_shopme_test_chat("Mario Rossi", "aggiungi una mozzarella al carrello")

# Aggiungi prosecco
mcp_shopme_test_chat("Mario Rossi", "aggiungi un prosecco")

# Conferma ordine
mcp_shopme_test_chat("Mario Rossi", "CONFERMA")
```

### Debug Funzioni
```bash
# Debug ragSearch
mcp_shopme_debug_function("ragSearch", {"query": "delivery times"})

# Debug add_to_cart
mcp_shopme_debug_function("add_to_cart", {"product_name": "mozzarella"})
```

## 🔍 Logs e Debug

Il server MCP fornisce logging dettagliato per:
- ✅ Chiamate ai tool
- ✅ Risposte del backend
- ✅ Errori e debug
- ✅ Performance e timing

## 📁 Struttura File

```
MCP/
├── mcp-server.js          # Server MCP principale
├── package.json           # Dipendenze
├── cursor-mcp-config.json # Configurazione Cursor
├── start-mcp-server.sh    # Script di avvio
├── test-mcp.js           # Test del server
└── README.md             # Questa documentazione
```

## 🚨 Note Importanti

- **Backend richiesto**: Il server MCP richiede che il backend ShopMe sia attivo su porta 3001
- **Database**: Assicurati che il database sia accessibile
- **Permessi**: Lo script di avvio deve essere eseguibile (`chmod +x`)
- **Porte**: Il server MCP usa stdio, non porte TCP

## 🆘 Risoluzione Problemi

### Server non si avvia
```bash
# Verifica dipendenze
npm install

# Controlla errori
node mcp-server.js
```

### Tool non funzionano
```bash
# Verifica backend
curl http://localhost:3001/api/health

# Controlla logs
tail -f logs/whatsapp-$(date +%Y-%m-%d).log
```

### Cursor non rileva il server
1. Verifica il file di configurazione
2. Riavvia Cursor completamente
3. Controlla che il server MCP sia attivo