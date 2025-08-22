# Task List - ShopMe Project

## 🔄 ACTIVE TASKS

## 📋 PENDING TASKS

### TASK #5: Swagger Documentation Updates
- [ ] Aggiornare swagger.json dopo ogni modifica API
- [ ] Verificare che tutte le API siano documentate correttamente
- [ ] Testare che swagger sia funzionante

### TASK #6: Test Coverage Improvements
- [ ] Aumentare la copertura dei test unitari
- [ ] Migliorare i test di integrazione
- [ ] Aggiungere test end-to-end per i flussi critici

### TASK #7: Performance Optimization
- [ ] Ottimizzare le query del database
- [ ] Implementare caching dove appropriato
- [ ] Migliorare i tempi di caricamento del frontend

## 🐛 BUGS TO FIX

### BUG #1: N8N Credential Duplication
- [ ] Risolvere il problema dei duplicati "Backend API Basic Auth" credentials
- [ ] Implementare controllo esistenza prima di creare nuove credenziali
- [ ] Aggiungere cleanup automatico delle credenziali duplicate

### BUG #2: Agent stopped due to max iterations
- [ ] Identificare la causa del limite di iterazioni nel nodo AI Agent di N8N
- [ ] Aumentare il parametro maxIterations nel workflow N8N
- [ ] Aggiungere configurazioni di fallback per evitare loop infiniti
- [ ] Testare che il chatbot funzioni senza errori di iterazioni
- [ ] Verificare che tutte le funzioni (RagSearch, GetAllProducts, etc.) funzionino correttamente

### BUG #3: 🚨 CRITICAL - RAG Search non trova FAQ sui metodi di pagamento
- [ ] **PROBLEMA**: Domanda "che pagamenti accettate?" non trova la FAQ esistente nel DB
- [ ] **FAQ PRESENTE**: "What payment methods do you accept? We accept credit/debit card payments, bank transfers, PayPal, and cash on delivery"
- [ ] **RISPOSTA ERRATA**: "Non ho informazioni specifiche sui metodi di pagamento"
- [ ] **CAUSA**: Sistema RAG non funziona correttamente per le FAQ
- [ ] Verificare che gli embedding delle FAQ siano generati correttamente
- [ ] Controllare le soglie di similarità nel sistema RAG
- [ ] Testare la ricerca semantica per "pagamenti", "payment", "metodi di pagamento"
- [ ] Verificare che il sistema RAG cerchi anche nelle FAQ oltre che nei prodotti
- [ ] **PRIORITÀ**: CRITICA - Impatto diretto sulle vendite

### BUG #4: 🚨 CRITICAL - RAG Search non trova prodotti per categoria (formaggi)
- [ ] **PROBLEMA**: Domanda "che formaggi avete" non trova prodotti nonostante esista categoria formaggi
- [ ] **CATEGORIA PRESENTE**: Esiste una categoria "formaggi" nel database
- [ ] **RISPOSTA ERRATA**: "Non ho elenchi specifici di formaggi disponibili"
- [ ] **CAUSA**: Sistema RAG non funziona correttamente per la ricerca prodotti per categoria
- [ ] Verificare che gli embedding dei prodotti siano generati correttamente
- [ ] Controllare che i prodotti siano associati correttamente alle categorie
- [ ] Testare la ricerca semantica per "formaggi", "cheese", "categoria formaggi"
- [ ] Verificare che il sistema RAG cerchi nei product_chunks
- [ ] **PRIORITÀ**: CRITICA - Impatto diretto sulle vendite di prodotti

### BUG #5: 🚨 CRITICAL - Language Detection non funziona
- [ ] **PROBLEMA**: Il sistema ignora il parameter language nel payload
- [ ] **INPUT ITALIANO**: "Quali sono gli orari di apertura?" → Risponde in inglese
- [ ] **INPUT SPAGNOLO**: "¿Cuáles son los horarios de apertura?" → Risponde in inglese
- [ ] **CAUSA**: Language detection non funziona o non viene passato correttamente al LLM
- [ ] Verificare che il language detector funzioni correttamente
- [ ] Controllare che il parametro language venga passato al prompt del LLM
- [ ] Testare che il sistema risponda nella lingua corretta (IT, ES, EN, PT)
- [ ] Verificare che il workflow N8N gestisca correttamente il language parameter
- [ ] **PRIORITÀ**: CRITICA - Esperienza utente multilingua compromessa

## 📝 NOTES

- **Critical Rule**: Mai toccare il PDF `backend/prisma/temp/international-transportation-law.pdf`
- **Critical Rule**: Backup .env obbligatorio prima di qualsiasi interazione
- **Critical Rule**: Zero hardcode - tutto dal database
- **Critical Rule**: Swagger sempre aggiornato dopo modifiche API
- **Critical Rule**: Test prima di dire "fatto"
- **Critical Rule**: Workspace isolation sempre attiva

---

**Last Updated**: 2025-01-13
**Status**: Active Development
**Next Priority**: BUG #3, #4, #5 - Sistema RAG e Language Detection non funzionano (CRITICAL)
