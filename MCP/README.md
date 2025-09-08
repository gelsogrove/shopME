# MCP - Model Context Protocol

## Panoramica
Questa cartella contiene il client di test MCP per testare l'applicazione WhatsApp ShopME. Il client permette di simulare conversazioni WhatsApp con il backend dell'applicazione per testare tutte le funzionalità come la gestione del carrello, la ricerca di prodotti, gli ordini e altre operazioni.

## File inclusi

### mcp-test-client.js
Client di test essenziale che simula messaggi WhatsApp inviando richieste formattate correttamente al webhook del backend e ricevendo le risposte del LLM in tempo reale.

**Caratteristiche:**
- ✅ Connessione diretta al backend WhatsApp
- ✅ Conversazione interattiva in tempo reale  
- ✅ Risposta del LLM (SofIA) completa
- ✅ Indicatori di function calls eseguite
- ✅ Gestione errori e debug

## Utilizzo

Per avviare il client di test:

```bash
cd /Users/gelso/workspace/AI/shop
node MCP/mcp-test-client.js
```

## Comandi di test suggeriti

1. **Saluto iniziale**: `ciao` - Per iniziare la conversazione
2. **Catalogo prodotti**: `cosa vendete` - Visualizzazione prodotti
3. **Gestione carrello**: 
   - `aggiungi limoncello al carrello`
   - `fammi vedere il carrello`
   - `svuota carrello`
4. **Ordini**: `dammi lista degli ordini` - Visualizzazione ordini
5. **Contatti**: `contatti` - Informazioni di contatto
6. **Uscita**: `EXIT` - Termina la sessione

## Configurazione

Il client è preconfigurato per:
- **Utente**: Mario Rossi (+34666888999)
- **Backend**: http://localhost:3001
- **Endpoint**: /api/whatsapp/webhook

Assicurati che il backend sia in esecuzione prima di utilizzare il client.
