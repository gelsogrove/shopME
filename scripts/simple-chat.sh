#!/bin/bash

# 🤖 SIMPLE CHAT - Chatta direttamente con il bot come se fossi Maria Garcia
# Usage: ./simple-chat.sh

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Customer preset - Maria Garcia
CUSTOMER_ID="577758fc-daef-46a2-9713-36295763f7ec"
CUSTOMER_NAME="Maria Garcia"
CUSTOMER_PHONE="+34666777888"
WORKSPACE_ID="6c72e7e8-9f2a-4b8e-8e7d-2c3f4a5b6789"

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    💬 CHAT CON IL BOT                       ║${NC}"
echo -e "${CYAN}║              Tu sei: Maria Garcia (+34666777888)             ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo -e "${YELLOW}Scrivi il tuo messaggio (o 'EXIT' per uscire):${NC}"
echo ""

while true; do
    echo -ne "${BLUE}👤 Maria: ${NC}"
    read -r message
    
    if [[ "${message^^}" == "EXIT" || "${message^^}" == "QUIT" ]]; then
        echo -e "${YELLOW}👋 Ciao Maria!${NC}"
        exit 0
    fi
    
    if [[ -z "$message" ]]; then
        continue
    fi
    
    echo -e "${CYAN}🔄 Bot sta pensando...${NC}"
    
    # Chiama N8N webhook direttamente
    response=$(curl -s -X POST "http://localhost:5678/webhook/webhook-start" \
        -H "Content-Type: application/json" \
        -d "{
            \"phoneNumber\": \"$CUSTOMER_PHONE\",
            \"message\": \"$message\",
            \"workspaceId\": \"$WORKSPACE_ID\",
            \"customerId\": \"$CUSTOMER_ID\",
            \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")\"
        }" 2>/dev/null)
    
    if [[ $? -eq 0 && -n "$response" ]]; then
        # Estrae il messaggio dalla risposta
        bot_message=$(echo "$response" | grep -o '"message":"[^"]*"' | sed 's/"message":"//' | sed 's/"$//' | sed 's/\\n/\n/g' 2>/dev/null)
        
        if [[ -z "$bot_message" ]]; then
            # Fallback: prova a estrarre tutto il JSON come messaggio
            bot_message=$(echo "$response" | head -c 500)
        fi
        
        echo -e "${GREEN}🤖 Bot ShopMe: ${bot_message}${NC}"
        
        # Evidenzia i link se ci sono
        if echo "$bot_message" | grep -q "http://"; then
            echo -e "${CYAN}🔗 LINK TROVATI:${NC}"
            echo "$bot_message" | grep -o 'http://[^[:space:]]*' | while read -r link; do
                echo -e "   ${BLUE}→ $link${NC}"
            done
        fi
    else
        echo -e "${RED}❌ Errore: Bot non ha risposto${NC}"
        echo -e "${RED}Response: $response${NC}"
    fi
    
    echo ""
done
