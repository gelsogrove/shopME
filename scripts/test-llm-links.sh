#!/bin/bash

# 🧪 TEST AUTOMATICO LLM LINKS - Simulazione Chat WhatsApp
# Testa che l'LLM generi sempre link corretti con phone

echo "🧪 TEST AUTOMATICO LLM LINKS"
echo "=========================="

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variabili di test
N8N_WEBHOOK="http://localhost:5678/webhook/webhook-start"
WORKSPACE_ID="cm9hjgq9v00014qk8fsdy4ujv"
MARIA_PHONE="+34666777888"
MARIA_ID="dbaa0c2f-40a4-4758-833c-8fdf9c40b369"

# Funzione per test singolo
test_message() {
    local message="$1"
    local test_name="$2"
    local expected_function="$3"
    
    echo ""
    echo -e "${YELLOW}🧪 TEST: $test_name${NC}"
    echo "📝 Messaggio: '$message'"
    
    # Payload per N8N (simula WhatsApp)
    local payload=$(cat << EOF
{
  "workspaceId": "$WORKSPACE_ID",
  "phoneNumber": "$MARIA_PHONE",
  "messageContent": "$message",
  "sessionToken": "test-session-maria",
  "precompiledData": {
    "agentConfig": {
      "id": "agent-config-test",
      "workspaceId": "$WORKSPACE_ID",
      "model": "openai/gpt-4o-mini",
      "temperature": 0.7,
      "maxTokens": 1000,
      "topP": 0.9,
      "prompt": "You are the virtual assistant for L'Altra Italia. Call GetOrdersListLink() for order requests and GetCustomerProfileLink() for profile modifications.",
      "isActive": true
    },
    "customer": {
      "id": "$MARIA_ID",
      "name": "Maria Garcia",
      "email": "maria.garcia@shopme.com",
      "phone": "$MARIA_PHONE",
      "language": "IT",
      "isActive": true,
      "isBlacklisted": false,
      "activeChatbot": true,
      "businessName": "L'Altra Italia(ESP)",
      "businessType": "ECOMMERCE",
      "discount": "0",
      "conversationHistory": []
    }
  },
  "wipMessages": {
    "en": "Work in progress. Please contact us later.",
    "es": "Trabajos en curso. Por favor, contáctenos más tarde.",
    "it": "Lavori in corso. Contattaci più tardi."
  }
}
EOF
    )
    
    # Chiama N8N
    echo "🔄 Invio a N8N..."
    local response=$(curl -s -X POST "$N8N_WEBHOOK" \
        -H "Content-Type: application/json" \
        -d "$payload")
    
    # Analizza risposta
    echo "📥 Risposta ricevuta"
    echo "$response" | jq -r '.message' 2>/dev/null || echo "$response"
    
    # Verifica presenza link con phone
    if echo "$response" | grep -q "phone="; then
        echo -e "${GREEN}✅ PASS: Link contiene parametro phone${NC}"
    else
        echo -e "${RED}❌ FAIL: Link NON contiene parametro phone${NC}"
    fi
    
    # Verifica funzione chiamata (se specificata)
    if [ ! -z "$expected_function" ]; then
        # TODO: Aggiungere verifica funzione chiamata
        echo "🔍 Verifica funzione: $expected_function (da implementare)"
    fi
    
    return 0
}

# Test 1: Lista ordini
test_message "dammi la lista ordini" "Lista Ordini" "GetOrdersListLink"

# Test 2: Ordine specifico
test_message "dammi l'ordine 20002" "Ordine Specifico" "GetOrdersListLink"

# Test 3: Correzione email
test_message "voglio cambiare la mia email" "Modifica Email" "GetCustomerProfileLink"

# Test 4: Modifica telefono
test_message "devo correggere il numero di telefono" "Modifica Telefono" "GetCustomerProfileLink"

# Test 5: Gestione profilo
test_message "voglio gestire il mio profilo" "Gestione Profilo" "GetCustomerProfileLink"

echo ""
echo "🏁 TEST COMPLETATI"
echo "=================="
echo "Controlla i risultati sopra per verificare che tutti i link contengano 'phone='"
