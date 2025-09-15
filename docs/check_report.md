# 📊 SHOPME WHATSAPP BOT - TEST REPORT

**Data Test**: $(date)
**Script**: test-whatsapp-bot.sh
**Status**: Pronto per l'esecuzione

## 🎯 OBIETTIVO

Testare automaticamente tutti i 40 test cases definiti in `check.md` per verificare che il sistema WhatsApp bot funzioni correttamente.

## 📋 TEST CASES DEFINITI

### ✅ **CATEGORIE TESTATE:**
1. **Informazioni Utente e Sistema** (3 test)
2. **Gestione Carrello Web-based** (8 test) 
3. **Gestione Ordini e Tracking** (6 test)
4. **Catalogo Prodotti e Servizi** (8 test)
5. **FAQ e Informazioni** (4 test)
6. **Gestione Profilo e Supporto** (2 test)
7. **Sicurezza e Spam Detection** (3 test)
8. **Flusso Conversazionale** (2 test)

### 🌍 **LINGUE SUPPORTATE:**
- 🇮🇹 **Italiano**: Mario Rossi (+390212345678)
- 🇬🇧 **Inglese**: John Smith (+441234567890)  
- 🇪🇸 **Spagnolo**: Maria Garcia (+34912345678)

## 🚀 **COME ESEGUIRE I TEST**

```bash
# Esegui tutti i test automaticamente
./scripts/test-whatsapp-bot.sh
```

## 📊 **RISULTATI ATTESI**

Il sistema dovrebbe:
- ✅ Riconoscere correttamente le calling functions
- ✅ Gestire il multilingua
- ✅ Mantenere il contesto conversazionale
- ✅ Gestire errori e spam
- ✅ Fornire link web per carrello e ordini

## ⚠️ **NOTE IMPORTANTI**

- **Sleep 5 secondi** tra ogni test per evitare rate limits
- **Log dettagliato** di tutti i risultati
- **Report automatico** in questo file
- **Stop al primo fallimento critico** per debugging

## 🚨 **REGOLE CRITICHE RULES_PROMPT**

### ✅ **VERIFICHE PRE-TEST OBBLIGATORIE:**
1. **Backend attivo** su porta 3001
2. **Database configurato** (.env presente)
3. **Prompt aggiornato** nel database
4. **MCP configurato** correttamente
5. **Zero hardcode** nel sistema
6. **Architettura RULES_PROMPT** rispettata
7. **Regole critiche** nel prompt
8. **Regole anti-regressione** verificate

### 🚫 **STOP IMMEDIATO SE:**
- Backend non attivo
- Hardcode rilevato
- Temperatura LLM = 0.0
- Categorie hardcoded
- Mancanza forzatura trigger critici
- Risposta GENERIC invece di funzione specifica
- Qualsiasi violazione RULES_PROMPT

### 🔧 **DEBUGGING AUTOMATICO:**
- Controlla prompt aggiornato: `npm run update:prompt`
- Verifica backend: `curl http://localhost:3001/health`
- Controlla log backend per errori
- Verifica zero hardcode nel sistema

---

*Report generato automaticamente dal sistema di test ShopMe*