# 🤖 CURSOR CHAT HELPER

## Uso Rapido nel Terminale di Cursor

### 1. **Bash Simulator** (Semplice)
```bash
./scripts/chat-simulator.sh
```

### 2. **Node.js MCP Tool** (Avanzato) 
```bash
node scripts/mcp-chat-tool.js
```

## 🚀 **Quick Start Guide per Andrea:**

### Passo 1: Avvia il Simulatore
```bash
cd /Users/gelso/workspace/AI/shop
./scripts/chat-simulator.sh
```

### Passo 2: Comandi Base
```
START CHAT maria      # Inizia chat con Maria Garcia
dammi link ordini     # Test link lista ordini
dammi ordine 20012    # Test link ordine specifico  
fammi modificare la mia mail  # Test link profilo
END CHAT              # Termina chat
EXIT                  # Esci
```

### Passo 3: Testa i Link
I link vengono evidenziati automaticamente nell'output, tu li copi e testi nel browser!

## 🔧 **Esempi di Test Scenarios:**

### Test Scenario 1: Order Links
```
START CHAT maria
dammi link ordini
# Expected: http://localhost:3000/orders-public?token=...&phone=%2B34666777888
dammi ordine 20012  
# Expected: http://localhost:3000/orders-public/20012?token=...&phone=%2B34666777888
END CHAT
```

### Test Scenario 2: Profile Links
```
START CHAT maria
fammi modificare la mia mail
# Expected: http://localhost:3000/customer-profile?token=...&phone=%2B34666777888
voglio cambiare il mio indirizzo
# Expected: Same profile link
END CHAT
```

### Test Scenario 3: Multi-Customer
```
START CHAT maria
dammi link ordini
END CHAT

START CHAT mario  
dammi link ordini
# Verifica che i token siano diversi per clienti diversi
END CHAT
```

## 🎯 **Vantaggi di questo Approccio:**

1. **✅ Test Immediato** - Vedi subito cosa risponde l'LLM
2. **✅ Link Validation** - Puoi copiare/testare i link subito  
3. **✅ Debugging Real-Time** - Logs diretti nel terminale
4. **✅ Multiple Scenarios** - Testa diversi clienti rapidamente
5. **✅ No Browser Needed** - Tutto nel terminale di Cursor

## 🔍 **Debug Features:**

- **Colorized Output** - Facile distinguere messaggi/risposte/link
- **Error Handling** - Mostra errori di connessione/API
- **Link Extraction** - Evidenzia automaticamente tutti i link HTTP
- **Customer Management** - Switch rapido tra clienti diversi

## 📝 **Note Tecniche:**

- Usa l'endpoint `/api/internal/n8n/webhook` 
- Auth: `admin:admin` (Basic Auth)
- WorkspaceId: `6c72e7e8-9f2a-4b8e-8e7d-2c3f4a5b6789`
- Customers preconfigurati: Maria Garcia, Mario Rossi

## 🚨 **Troubleshooting:**

Se il simulatore non funziona:
1. Verifica che il backend sia attivo (`npm run dev`)
2. Controlla che N8N sia raggiungibile
3. Verifica i customer ID nel database (potrebbero essere cambiati dopo seed)

## 🎯 **Next Steps:**

Dopo aver testato con il simulatore, Andrea può:
1. **Identificare** quali link non funzionano
2. **Verificare** se il middleware link-corrector funziona  
3. **Debug** direttamente l'LLM prompt se non chiama le funzioni
4. **Testare** il token reuse system in real-time
