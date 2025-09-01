# Server Management Rules

## ⚠️ REGOLA CRITICA - GESTIONE SERVER ⚠️

**L'UTENTE GESTISCE I SERVER - NON L'ASSISTENTE**

### Regole Fondamentali:
1. **NON lanciare mai server in background** (`npm run dev`, `npm start`, etc.)
2. **L'utente avvia e gestisce tutti i server** (frontend, backend, database)
3. **Solo testing e curl commands** per l'assistente
4. **Mai usare isBackground=true** per comandi server

### Cosa può fare l'assistente:
- ✅ Curl per testare webhook
- ✅ Comandi di build e compilazione
- ✅ Test e debugging
- ✅ Modifiche al codice
- ✅ Controllo logs

### Cosa NON può fare l'assistente:
- ❌ npm run dev
- ❌ npm start
- ❌ Avviare server in background
- ❌ Gestire processi server

### Nota:
Questa regola è stata appresa il 1 Settembre 2025 dopo feedback dell'utente.
L'utente ha specificato chiaramente: "i server li lanci io !!! non lo hai ancora imparato"
