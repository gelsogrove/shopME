#!/bin/bash

# 🤖 CHAT SIMULATOR - Simula conversazioni WhatsApp direttamente nel terminale
# Usage: ./chat-simulator.sh

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Config
BACKEND_URL="http://localhost:3001"
WORKSPACE_ID="6c72e7e8-9f2a-4b8e-8e7d-2c3f4a5b6789"

# Customer presets
declare -A CUSTOMERS
CUSTOMERS["maria"]="2b8fbd85-4286-4bce-a0a0-a7e17b8ca7e2|Maria Garcia|+34666777888"
CUSTOMERS["mario"]="3c9fce96-5397-5c9f-9f8e-3d4f5a6b7890|Mario Rossi|+34666888999"

# Session variables
CURRENT_CUSTOMER=""
CURRENT_PHONE=""
CURRENT_NAME=""
CHAT_ACTIVE=false

print_banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🤖 CHAT SIMULATOR v1.0                   ║"
    echo "║              Test WhatsApp bot direttamente qui!            ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_help() {
    echo -e "${YELLOW}📋 COMANDI DISPONIBILI:${NC}"
    echo "  START CHAT <customer>     - Inizia chat (maria, mario)"
    echo "  END CHAT                  - Termina chat"
    echo "  HELP                      - Mostra questo help"
    echo "  EXIT                      - Esci dal simulatore"
    echo ""
    echo -e "${YELLOW}💬 ESEMPI DI MESSAGGI:${NC}"
    echo "  dammi link ordini"
    echo "  dammi ordine 20012"
    echo "  fammi modificare la mia mail"
    echo "  voglio cambiare il mio indirizzo"
    echo ""
    echo -e "${YELLOW}👥 CLIENTI DISPONIBILI:${NC}"
    for customer in "${!CUSTOMERS[@]}"; do
        IFS='|' read -r id name phone <<< "${CUSTOMERS[$customer]}"
        echo -e "  ${GREEN}$customer${NC} - $name ($phone)"
    done
}

start_chat() {
    local customer_key="$1"
    
    if [[ -z "${CUSTOMERS[$customer_key]}" ]]; then
        echo -e "${RED}❌ Cliente '$customer_key' non trovato!${NC}"
        echo -e "${YELLOW}Clienti disponibili: ${!CUSTOMERS[*]}${NC}"
        return 1
    fi
    
    IFS='|' read -r id name phone <<< "${CUSTOMERS[$customer_key]}"
    
    CURRENT_CUSTOMER="$id"
    CURRENT_PHONE="$phone"
    CURRENT_NAME="$name"
    CHAT_ACTIVE=true
    
    echo -e "${GREEN}🚀 CHAT ATTIVATA!${NC}"
    echo -e "${BLUE}👤 Cliente: $name ($phone)${NC}"
    echo -e "${BLUE}🆔 ID: $id${NC}"
    echo -e "${CYAN}💬 Scrivi il tuo messaggio (o 'END CHAT' per terminare):${NC}"
}

send_message() {
    local message="$1"
    
    echo -e "${YELLOW}👤 $CURRENT_NAME: $message${NC}"
    
    # Prepara payload per N8N
    local payload=$(cat <<EOF
{
    "phoneNumber": "$CURRENT_PHONE",
    "message": "$message",
    "workspaceId": "$WORKSPACE_ID",
    "customerId": "$CURRENT_CUSTOMER",
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")"
}
EOF
)
    
    echo -e "${CYAN}🔄 Invio messaggio al bot...${NC}"
    
    # Chiama l'endpoint N8N
    local response=$(curl -s -X POST \
        "$BACKEND_URL/api/internal/n8n/webhook" \
        -H "Content-Type: application/json" \
        -H "Authorization: Basic $(echo -n 'admin:admin' | base64)" \
        -d "$payload" \
        2>/dev/null)
    
    if [[ $? -eq 0 && -n "$response" ]]; then
        # Estrae il messaggio dalla risposta
        local bot_message=$(echo "$response" | jq -r '.message // .response // .text // .' 2>/dev/null)
        
        if [[ "$bot_message" != "null" && -n "$bot_message" ]]; then
            echo -e "${GREEN}🤖 Bot ShopMe: $bot_message${NC}"
            
            # Cerca link nella risposta e li evidenzia
            if echo "$bot_message" | grep -q "http://"; then
                echo -e "${CYAN}🔗 LINK TROVATI:${NC}"
                echo "$bot_message" | grep -o 'http://[^[:space:]]*' | while read -r link; do
                    echo -e "   ${BLUE}$link${NC}"
                done
            fi
        else
            echo -e "${RED}❌ Risposta bot non valida: $response${NC}"
        fi
    else
        echo -e "${RED}❌ Errore nella comunicazione con il bot${NC}"
        echo -e "${RED}Response: $response${NC}"
    fi
    
    echo ""
}

end_chat() {
    echo -e "${YELLOW}👋 Chat con $CURRENT_NAME terminata!${NC}"
    CHAT_ACTIVE=false
    CURRENT_CUSTOMER=""
    CURRENT_PHONE=""
    CURRENT_NAME=""
}

main() {
    print_banner
    print_help
    
    while true; do
        if [[ "$CHAT_ACTIVE" == true ]]; then
            echo -ne "${CYAN}💬 Messaggio: ${NC}"
        else
            echo -ne "${CYAN}🔧 Comando: ${NC}"
        fi
        
        read -r input
        
        # Trim input
        input=$(echo "$input" | xargs)
        
        if [[ -z "$input" ]]; then
            continue
        fi
        
        # Comandi globali
        case "${input^^}" in
            "EXIT"|"QUIT"|"Q")
                echo -e "${YELLOW}👋 Arrivederci Andrea!${NC}"
                exit 0
                ;;
            "HELP"|"H")
                print_help
                continue
                ;;
            "END CHAT")
                if [[ "$CHAT_ACTIVE" == true ]]; then
                    end_chat
                else
                    echo -e "${RED}❌ Nessuna chat attiva!${NC}"
                fi
                continue
                ;;
        esac
        
        # Comandi START CHAT
        if [[ "${input^^}" =~ ^START\ CHAT\ (.+)$ ]]; then
            customer_key=$(echo "${BASH_REMATCH[1]}" | tr '[:upper:]' '[:lower:]')
            start_chat "$customer_key"
            continue
        fi
        
        # Messaggi chat
        if [[ "$CHAT_ACTIVE" == true ]]; then
            send_message "$input"
        else
            echo -e "${RED}❌ Comando non riconosciuto! Scrivi 'HELP' per l'aiuto.${NC}"
        fi
    done
}

# Verifica dipendenze
if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ jq non installato! Installa con: brew install jq${NC}"
    exit 1
fi

if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ curl non installato!${NC}"
    exit 1
fi

# Avvia il simulatore
main "$@"
