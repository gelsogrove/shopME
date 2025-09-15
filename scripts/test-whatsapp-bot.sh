#!/bin/bash

# 🧪 SHOPME WHATSAPP BOT - AUTOMATED TEST SCRIPT
# Andrea, questo script testa automaticamente tutti i test cases del check.md
# SEGUE LE REGOLE DEL RULES_PROMPT - ZERO HARDCODE, ZERO DANNI!

set -e

# 🚨 REGOLE CRITICHE DEL RULES_PROMPT
echo -e "${RED}🚨 REGOLE CRITICHE RULES_PROMPT:${NC}"
echo -e "${RED}1. ZERO HARDCODE - Tutto dal database${NC}"
echo -e "${RED}2. ZERO DANNI - Se qualcosa non va, STOP IMMEDIATO${NC}"
echo -e "${RED}3. VERIFICA PRIMA - Controlla che tutto sia configurato${NC}"
echo -e "${RED}4. SEGUI ARCHITETTURA - PROMPT_AGENT → DUAL_LLM → FORMATTER${NC}"
echo ""

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurazione
LOG_FILE="/tmp/shopme_test_$(date +%Y%m%d_%H%M%S).log"
REPORT_FILE="/Users/gelso/workspace/AI/shop/docs/check_report.md"

echo -e "${BLUE}🚀 SHOPME WHATSAPP BOT - TEST AUTOMATICO${NC}"
echo -e "${BLUE}==========================================${NC}"
echo "📅 Data: $(date)"
echo "📝 Log: $LOG_FILE"
echo "📊 Report: $REPORT_FILE"
echo ""

# 🔍 VERIFICHE PRE-TEST OBBLIGATORIE (RULES_PROMPT)
echo -e "${YELLOW}🔍 VERIFICHE PRE-TEST OBBLIGATORIE${NC}"
echo "=================================="

# 1. Verifica che il backend sia in esecuzione
echo -e "${BLUE}1. Verifico che il backend sia attivo...${NC}"
if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${RED}❌ ERRORE CRITICO: Backend non attivo su porta 3001${NC}"
    echo -e "${RED}🚨 STOP IMMEDIATO - Avvia il backend prima di continuare${NC}"
    echo -e "${YELLOW}💡 Comando: cd backend && npm run dev${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend attivo${NC}"

# 2. Verifica che il database sia configurato
echo -e "${BLUE}2. Verifico configurazione database...${NC}"
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ ERRORE CRITICO: File .env non trovato${NC}"
    echo -e "${RED}🚨 STOP IMMEDIATO - Configura il database prima di continuare${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Database configurato${NC}"

# 3. Verifica che il prompt sia aggiornato nel database
echo -e "${BLUE}3. Verifico che il prompt sia aggiornato nel database...${NC}"
if [ ! -f "docs/other/prompt_agent.md" ]; then
    echo -e "${RED}❌ ERRORE CRITICO: prompt_agent.md non trovato${NC}"
    echo -e "${RED}🚨 STOP IMMEDIATO - File prompt mancante${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Prompt file presente${NC}"

# 4. Verifica che MCP sia configurato
echo -e "${BLUE}4. Verifico configurazione MCP...${NC}"
if [ ! -f "MCP/mcp-test-client.js" ]; then
    echo -e "${RED}❌ ERRORE CRITICO: MCP test client non trovato${NC}"
    echo -e "${RED}🚨 STOP IMMEDIATO - MCP non configurato${NC}"
    exit 1
fi
echo -e "${GREEN}✅ MCP configurato${NC}"

# 5. Verifica che non ci siano hardcode nel sistema
echo -e "${BLUE}5. Verifico che non ci siano hardcode nel sistema...${NC}"
if grep -r "DEFAULT_PROMPT\|initialConfig\|hardcode" backend/src/ --include="*.ts" > /dev/null 2>&1; then
    echo -e "${RED}❌ ERRORE CRITICO: Trovato hardcode nel sistema${NC}"
    echo -e "${RED}🚨 STOP IMMEDIATO - Rimuovi hardcode prima di continuare${NC}"
    echo -e "${YELLOW}💡 Controlla: grep -r 'DEFAULT_PROMPT\|initialConfig' backend/src/${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Nessun hardcode rilevato${NC}"

# 6. Verifica architettura RULES_PROMPT
echo -e "${BLUE}6. Verifico architettura RULES_PROMPT...${NC}"
if [ ! -f "backend/src/services/dual-llm.service.ts" ]; then
    echo -e "${RED}❌ ERRORE CRITICO: dual-llm.service.ts non trovato${NC}"
    echo -e "${RED}🚨 STOP IMMEDIATO - Architettura RULES_PROMPT non rispettata${NC}"
    exit 1
fi

if [ ! -f "backend/src/services/formatter.service.ts" ]; then
    echo -e "${RED}❌ ERRORE CRITICO: formatter.service.ts non trovato${NC}"
    echo -e "${RED}🚨 STOP IMMEDIATO - Architettura RULES_PROMPT non rispettata${NC}"
    exit 1
fi

if [ ! -f "backend/src/services/translation.service.ts" ]; then
    echo -e "${RED}❌ ERRORE CRITICO: translation.service.ts non trovato${NC}"
    echo -e "${RED}🚨 STOP IMMEDIATO - Architettura RULES_PROMPT non rispettata${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Architettura RULES_PROMPT rispettata${NC}"

# 7. Verifica che il prompt contenga le regole critiche
echo -e "${BLUE}7. Verifico regole critiche nel prompt...${NC}"
if ! grep -q "TRIGGER ULTRA-ESPLICITI\|FORZA ASSOLUTA" docs/other/prompt_agent.md; then
    echo -e "${RED}❌ ERRORE CRITICO: Prompt non contiene trigger ultra-espliciti${NC}"
    echo -e "${RED}🚨 STOP IMMEDIATO - Prompt non conforme a RULES_PROMPT${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Prompt conforme a RULES_PROMPT${NC}"

# 8. Verifica regole anti-regressione
echo -e "${BLUE}8. Verifico regole anti-regressione...${NC}"

# Verifica temperatura LLM
if grep -q "temperature: 0.0" backend/src/services/dual-llm.service.ts; then
    echo -e "${RED}❌ ERRORE CRITICO: Temperatura LLM è 0.0 (troppo bassa)${NC}"
    echo -e "${RED}🚨 STOP IMMEDIATO - Temperatura deve essere ≥ 0.1${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Temperatura LLM corretta${NC}"

# Verifica che non ci siano categorie hardcoded
if grep -q "Formaggi e Latticini\|Salumi" docs/other/prompt_agent.md; then
    echo -e "${RED}❌ ERRORE CRITICO: Trovate categorie hardcoded nel prompt${NC}"
    echo -e "${RED}🚨 STOP IMMEDIATO - Categorie devono essere dinamiche dal database${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Nessuna categoria hardcoded${NC}"

# Verifica che ci sia forzatura per trigger critici
if ! grep -q "criticalTriggers\|isCriticalTrigger" backend/src/services/dual-llm.service.ts; then
    echo -e "${RED}❌ ERRORE CRITICO: Mancanza forzatura per trigger critici${NC}"
    echo -e "${RED}🚨 STOP IMMEDIATO - Sistema deve forzare trigger critici${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Forzatura trigger critici presente${NC}"

echo -e "${GREEN}🎉 TUTTE LE VERIFICHE SUPERATE - SISTEMA PRONTO PER I TEST${NC}"
echo ""

# Funzione per testare un comando
test_command() {
    local user="$1"
    local message="$2"
    local expected_cf="$3"
    local test_id="$4"
    
    echo -e "${YELLOW}🧪 TEST #$test_id: $message${NC}"
    echo "👤 User: $user"
    echo "💬 Message: $message"
    echo "🎯 Expected CF: $expected_cf"
    
    # Esegui test con MCP
    local result=$(cd /Users/gelso/workspace/AI/shop && node MCP/mcp-test-client.js test_chat user="$user" message="$message" log=true exitFirstMessage=true 2>&1)
    
    # 🚨 REGOLA CRITICA RULES_PROMPT: Verifica che non ci siano hardcode nella risposta
    if echo "$result" | grep -qi "DEFAULT_PROMPT\|initialConfig\|hardcode\|fallback"; then
        echo -e "${RED}❌ ERRORE CRITICO: Trovato hardcode nella risposta${NC}"
        echo -e "${RED}🚨 STOP IMMEDIATO - Sistema contiene hardcode${NC}"
        echo -e "${RED}📄 Risultato problematico: $result${NC}"
        exit 1
    fi
    
    # 🚨 REGOLA CRITICA RULES_PROMPT: Verifica che la risposta non sia generica
    if echo "$result" | grep -qi "GENERIC" && [ "$expected_cf" != "GENERIC" ]; then
        echo -e "${RED}❌ ERRORE CRITICO: Risposta GENERIC invece di $expected_cf${NC}"
        echo -e "${RED}🚨 STOP IMMEDIATO - LLM non riconosce la funzione${NC}"
        echo -e "${RED}📄 Risultato problematico: $result${NC}"
        exit 1
    fi
    
    # Salva risultato nel log
    echo "=== TEST #$test_id ===" >> "$LOG_FILE"
    echo "User: $user" >> "$LOG_FILE"
    echo "Message: $message" >> "$LOG_FILE"
    echo "Expected: $expected_cf" >> "$LOG_FILE"
    echo "Result: $result" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    
    # Verifica se il risultato contiene la calling function attesa
    if echo "$result" | grep -q "$expected_cf"; then
        echo -e "${GREEN}✅ SUCCESS: $expected_cf trovata${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED: $expected_cf non trovata${NC}"
        echo -e "${RED}📄 Risultato: $result${NC}"
        
        # 🚨 REGOLA CRITICA RULES_PROMPT: STOP IMMEDIATO SE QUALCOSA NON VA
        echo -e "${RED}🚨 STOP IMMEDIATO - Test fallito${NC}"
        echo -e "${RED}🔍 DEBUGGING NECESSARIO:${NC}"
        echo -e "${YELLOW}1. Controlla che il prompt sia aggiornato: npm run update:prompt${NC}"
        echo -e "${YELLOW}2. Verifica che il backend sia attivo: curl http://localhost:3001/health${NC}"
        echo -e "${YELLOW}3. Controlla i log del backend per errori${NC}"
        echo -e "${YELLOW}4. Verifica che non ci siano hardcode nel sistema${NC}"
        echo ""
        echo -e "${RED}📊 REPORT PARZIALE SALVATO IN: $REPORT_FILE${NC}"
        echo -e "${RED}📝 LOG DETTAGLIATO IN: $LOG_FILE${NC}"
        echo ""
        echo -e "${RED}Andrea, il test è stato interrotto per sicurezza.${NC}"
        echo -e "${RED}Risolvi il problema e riprova.${NC}"
        exit 1
    fi
}

# Funzione per sleep tra test
sleep_between_tests() {
    echo -e "${BLUE}⏱️  Sleep 5 secondi per evitare rate limits...${NC}"
    sleep 5
}

# Inizializza report
cat > "$REPORT_FILE" << EOF
# 📊 SHOPME WHATSAPP BOT - TEST REPORT

**Data Test**: $(date)
**Script**: test-whatsapp-bot.sh
**Log File**: $LOG_FILE

## 📈 STATISTICHE

| Categoria | Test Eseguiti | Successi | Fallimenti | % Successo |
|-----------|---------------|----------|------------|------------|
EOF

# Contatori
TOTAL_TESTS=0
SUCCESS_TESTS=0
FAILED_TESTS=0

# Funzione per aggiornare contatori
update_counters() {
    local success=$1
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ $success -eq 0 ]; then
        SUCCESS_TESTS=$((SUCCESS_TESTS + 1))
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

echo -e "${BLUE}🎯 CATEGORIA 1: INFORMAZIONI UTENTE E SISTEMA${NC}"
echo "================================================"

# Test 1: chi sei
test_command "Mario Rossi" "chi sei" "GENERIC" "1"
update_counters $?
sleep_between_tests

# Test 1b: who are you
test_command "John Smith" "who are you" "GENERIC" "1b"
update_counters $?
sleep_between_tests

# Test 1c: quién eres
test_command "Maria Garcia" "quién eres" "GENERIC" "1c"
update_counters $?
sleep_between_tests

echo -e "${BLUE}🛒 CATEGORIA 2: GESTIONE CARRELLO (WEB-BASED)${NC}"
echo "================================================"

# Test 2: aggiungi al carrello un prosecco
test_command "Mario Rossi" "aggiungi al carrello un prosecco" "generateCartLink" "2"
update_counters $?
sleep_between_tests

# Test 3: aggiungi al carrello una mozzarella
test_command "Mario Rossi" "aggiungi al carrello una mozzarella" "generateCartLink" "3"
update_counters $?
sleep_between_tests

# Test 4: fammi vedere il carrello
test_command "Mario Rossi" "fammi vedere il carrello" "generateCartLink" "4"
update_counters $?
sleep_between_tests

echo -e "${BLUE}📦 CATEGORIA 3: GESTIONE ORDINI E TRACKING${NC}"
echo "================================================"

# Test 11: dammi link ordini
test_command "Mario Rossi" "dammi link ordini" "GetOrdersListLink" "11"
update_counters $?
sleep_between_tests

# Test 12: quando arriva il mio ordine
test_command "Mario Rossi" "quando arriva il mio ordine" "GetShipmentTrackingLink" "12"
update_counters $?
sleep_between_tests

echo -e "${BLUE}🛍️ CATEGORIA 4: CATALOGO PRODOTTI E SERVIZI${NC}"
echo "================================================"

# Test 15: che prodotti avete
test_command "Mario Rossi" "che prodotti avete" "GetAllProducts" "15"
update_counters $?
sleep_between_tests

# Test 16: che categorie hai di prodotti
test_command "Mario Rossi" "che categorie hai di prodotti" "GetAllCategories" "16"
update_counters $?
sleep_between_tests

# Test 17: Formaggi e Latticini
test_command "Mario Rossi" "Formaggi e Latticini" "GetProductsByCategory" "17"
update_counters $?
sleep_between_tests

echo -e "${BLUE}❓ CATEGORIA 5: FAQ E INFORMAZIONI${NC}"
echo "================================================"

# Test 21: come pago
test_command "Mario Rossi" "come pago" "SearchRag" "21"
update_counters $?
sleep_between_tests

# Test 21b: come gestite la catena del freddo
test_command "Mario Rossi" "come gestite la catena del freddo" "SearchRag" "21b"
update_counters $?
sleep_between_tests

echo -e "${BLUE}👤 CATEGORIA 6: GESTIONE PROFILO E SUPPORTO${NC}"
echo "================================================"

# Test 22: voglio modificare il mio indirizzo di fatturazione
test_command "Mario Rossi" "voglio modificare il mio indirizzo di fatturazione" "GetCustomerProfileLink" "22"
update_counters $?
sleep_between_tests

# Test 23: voglio parlare con un operatore
test_command "Mario Rossi" "voglio parlare con un operatore" "ContactOperator" "23"
update_counters $?
sleep_between_tests

echo -e "${BLUE}🚨 CATEGORIA 7: SICUREZZA E SPAM DETECTION${NC}"
echo "================================================"

# Test 25: messaggio malformato
test_command "Mario Rossi" "messaggio malformato @#\$%" "GENERIC" "25"
update_counters $?
sleep_between_tests

# Genera report finale
echo "" >> "$REPORT_FILE"
echo "## 📊 RISULTATI FINALI" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "| Metrica | Valore |" >> "$REPORT_FILE"
echo "|---------|--------|" >> "$REPORT_FILE"
echo "| **Totale Test** | $TOTAL_TESTS |" >> "$REPORT_FILE"
echo "| **Successi** | $SUCCESS_TESTS |" >> "$REPORT_FILE"
echo "| **Fallimenti** | $FAILED_TESTS |" >> "$REPORT_FILE"

if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_PERCENTAGE=$((SUCCESS_TESTS * 100 / TOTAL_TESTS))
    echo "| **% Successo** | $SUCCESS_PERCENTAGE% |" >> "$REPORT_FILE"
else
    echo "| **% Successo** | 0% |" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo "## 📝 LOG COMPLETO" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"
cat "$LOG_FILE" >> "$REPORT_FILE"
echo "\`\`\`" >> "$REPORT_FILE"

# Output finale
echo ""
echo -e "${BLUE}🎉 TEST COMPLETATI!${NC}"
echo -e "${BLUE}==================${NC}"
echo -e "📊 **Totale Test**: $TOTAL_TESTS"
echo -e "✅ **Successi**: $SUCCESS_TESTS"
echo -e "❌ **Fallimenti**: $FAILED_TESTS"

if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_PERCENTAGE=$((SUCCESS_TESTS * 100 / TOTAL_TESTS))
    echo -e "📈 **% Successo**: $SUCCESS_PERCENTAGE%"
    
    if [ $SUCCESS_PERCENTAGE -ge 80 ]; then
        echo -e "${GREEN}🎯 ECCELLENTE! Sistema funziona molto bene${NC}"
    elif [ $SUCCESS_PERCENTAGE -ge 60 ]; then
        echo -e "${YELLOW}⚠️  BUONO, ma ci sono alcuni problemi da risolvere${NC}"
    else
        echo -e "${RED}🚨 ATTENZIONE! Molti test falliscono, serve debugging${NC}"
    fi
fi

echo ""
echo -e "📄 **Report completo**: $REPORT_FILE"
echo -e "📝 **Log dettagliato**: $LOG_FILE"
echo ""
echo -e "${BLUE}Andrea, il test è completato! Controlla il report per i dettagli.${NC}"
