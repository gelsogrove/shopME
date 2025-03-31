# MCP Browser Tools - Guida Completa

## Introduzione

MCP Browser Tools è un set di strumenti che permette di debuggare, testare e analizzare applicazioni web direttamente attraverso Cursor IDE. Questa guida spiega come configurare e utilizzare questi strumenti.

## Prerequisiti

- Node.js installato
- Cursor IDE
- Un progetto web (React, Next.js, etc.)

## Installazione

1. **Installazione Globale di cursor-tools**

```bash
npm install -g cursor-tools
```

2. **Inizializzazione nel Progetto**

```bash
cursor-tools install .
```

## Configurazione MCP

### 1. File di Configurazione

Il file di configurazione MCP si trova in:

```
~/.cursor/mcp.json
```

### 2. Configurazione Server Browser Tools

Assicurarsi che il file contenga questa configurazione:

```json
{
  "servers": {
    "browser-tools": {
      "transport": {
        "kind": "sse",
        "url": "http://localhost:3025/sse"
      }
    }
  }
}
```

## Avvio del Server

### Importante: Mantenere il Client Aperto

- Il client (Cursor IDE) deve rimanere aperto durante l'utilizzo degli strumenti
- Il server deve essere attivo (indicatore verde nella barra di stato)

### Comandi per il Server

1. **Fermare processi esistenti** (se necessario):

```bash
pkill -f "browser-tools|node"
```

2. **Avviare il server**:

```bash
npx --yes @agentdeskai/browser-tools-server@1.2.0
```

> **Nota**: È fondamentale mantenere il client Cursor aperto mentre il server è in esecuzione.

## Funzionalità Disponibili

### 1. Console e Network Logs

- `mcp_browser_tools_getConsoleLogs`: Visualizza i log della console
- `mcp_browser_tools_getConsoleErrors`: Mostra gli errori della console
- `mcp_browser_tools_getNetworkLogs`: Visualizza tutti i log di rete
- `mcp_browser_tools_getNetworkErrors`: Mostra gli errori di rete

### 2. Screenshot e Debug Visuale

- `mcp_browser_tools_takeScreenshot`: Cattura screenshot della pagina
- `mcp_browser_tools_getSelectedElement`: Analizza elemento selezionato

### 3. Audit e Performance

- `mcp_browser_tools_runAccessibilityAudit`: Audit di accessibilità
- `mcp_browser_tools_runPerformanceAudit`: Audit delle performance
- `mcp_browser_tools_runSEOAudit`: Audit SEO
- `mcp_browser_tools_runBestPracticesAudit`: Audit best practices
- `mcp_browser_tools_runNextJSAudit`: Audit specifico per Next.js

### 4. Debug e Manutenzione

- `mcp_browser_tools_runDebuggerMode`: Modalità debugger
- `mcp_browser_tools_runAuditMode`: Modalità audit completa
- `mcp_browser_tools_wipeLogs`: Pulisce i log memorizzati

## Troubleshooting

### Problemi Comuni e Soluzioni

1. **Server non risponde**

   - Verificare che la porta 3025 sia libera
   - Riavviare Cursor IDE
   - Riavviare il server browser-tools

2. **Immagini non caricate**

   - Controllare i network logs per errori
   - Verificare i path delle immagini
   - Controllare le policy CORS

3. **Console vuota**
   - Assicurarsi che il server sia attivo (indicatore verde)
   - Ricaricare la pagina
   - Pulire i log con wipeLogs e riprovare

## Best Practices

1. **Prima di iniziare**

   - Chiudere tutti i processi node esistenti
   - Verificare che la porta 3025 sia libera
   - Assicurarsi che Cursor IDE sia aperto

2. **Durante lo sviluppo**

   - Mantenere il client Cursor aperto
   - Monitorare regolarmente i log
   - Utilizzare gli audit per ottimizzazioni

3. **Debug**
   - Utilizzare screenshot per problemi visuali
   - Controllare network logs per problemi di caricamento
   - Usare debugger mode per problemi complessi

## Comandi Utili cursor-tools

```bash
cursor-tools --version              # Verifica versione
cursor-tools doc                    # Genera documentazione
cursor-tools browser --console      # Analisi browser
cursor-tools web                    # Analisi web
```

## Note Importanti

- Mantenere sempre il client Cursor aperto durante l'utilizzo
- Verificare l'indicatore verde del server nella barra di stato
- Utilizzare regolarmente gli audit per mantenere la qualità del codice
- Monitorare i log per identificare problemi tempestivamente
