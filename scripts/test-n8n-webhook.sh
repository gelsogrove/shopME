#!/bin/bash

# Script per testare il webhook N8N con payload precompilati
# Andrea, usa questo script per testare il flusso senza passare dal backend

set -e

N8N_WEBHOOK_URL="http://localhost:5678/webhook/whatsapp-webhook"
TEST_PAYLOAD_FILE="n8n/test-webhook-payload.json"
SCENARIOS_FILE="n8n/test-scenarios.json"

echo "🧪 SCRIPT DI TEST WEBHOOK N8N - Andrea's Testing Tool"
echo "=================================================="

# Funzione per testare un payload
test_payload() {
    local payload_file=$1
    local description=$2
    
    echo ""
    echo "🔄 Testing: $description"
    echo "📄 Payload: $payload_file"
    echo "🎯 URL: $N8N_WEBHOOK_URL"
    echo ""
    
    if [[ ! -f "$payload_file" ]]; then
        echo "❌ File $payload_file non trovato!"
        return 1
    fi
    
    echo "📤 Sending payload..."
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d @"$payload_file" \
        "$N8N_WEBHOOK_URL" 2>/dev/null)
    
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    echo "📥 Response Code: $http_code"
    
    if [[ $http_code -eq 200 ]]; then
        echo "✅ SUCCESS!"
        echo "📋 Response:"
        echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    else
        echo "❌ FAILED!"
        echo "📋 Error Response:"
        echo "$response_body"
    fi
    
    echo "----------------------------------------"
}

# Funzione per testare uno scenario specifico
test_scenario() {
    local scenario_key=$1
    
    if [[ ! -f "$SCENARIOS_FILE" ]]; then
        echo "❌ File $SCENARIOS_FILE non trovato!"
        return 1
    fi
    
    # Estrai il payload dello scenario
    local temp_payload="/tmp/n8n_test_payload_$scenario_key.json"
    jq ".scenarios.\"$scenario_key\".payload" "$SCENARIOS_FILE" > "$temp_payload"
    
    if [[ $? -ne 0 ]]; then
        echo "❌ Scenario '$scenario_key' non trovato!"
        return 1
    fi
    
    local description=$(jq -r ".scenarios.\"$scenario_key\".description" "$SCENARIOS_FILE")
    test_payload "$temp_payload" "$description"
    
    # Cleanup
    rm -f "$temp_payload"
}

# Menu principale
case "${1:-menu}" in
    "basic")
        test_payload "$TEST_PAYLOAD_FILE" "Basic Product Search Test"
        ;;
    "scenario")
        if [[ -z "$2" ]]; then
            echo "❌ Specifica lo scenario: $0 scenario <scenario_key>"
            echo ""
            echo "📋 Scenari disponibili:"
            jq -r '.scenarios | keys[]' "$SCENARIOS_FILE" 2>/dev/null | sed 's/^/   - /'
            exit 1
        fi
        test_scenario "$2"
        ;;
    "all")
        echo "🚀 Testing tutti gli scenari..."
        scenarios=$(jq -r '.scenarios | keys[]' "$SCENARIOS_FILE" 2>/dev/null)
        for scenario in $scenarios; do
            test_scenario "$scenario"
            sleep 2  # Pausa tra i test
        done
        ;;
    "check")
        echo "🔍 Checking N8N webhook availability..."
        curl -s -o /dev/null -w "Status: %{http_code}\n" "$N8N_WEBHOOK_URL" || echo "❌ N8N non raggiungibile!"
        ;;
    "help"|"menu"|*)
        echo "📖 UTILIZZO:"
        echo "  $0 basic              - Testa il payload base"
        echo "  $0 scenario <key>     - Testa uno scenario specifico"
        echo "  $0 all               - Testa tutti gli scenari"
        echo "  $0 check             - Verifica disponibilità N8N"
        echo "  $0 help              - Mostra questo help"
        echo ""
        echo "📋 Scenari disponibili:"
        if [[ -f "$SCENARIOS_FILE" ]]; then
            jq -r '.scenarios | to_entries[] | "   - \(.key): \(.value.description)"' "$SCENARIOS_FILE" 2>/dev/null
        else
            echo "   ❌ File scenari non trovato: $SCENARIOS_FILE"
        fi
        echo ""
        echo "💡 Esempi:"
        echo "  $0 basic"
        echo "  $0 scenario 1_product_search"
        echo "  $0 scenario 2_blacklisted_customer"
        echo "  $0 all"
        ;;
esac

echo ""
echo "✅ Test completato! Andrea, controlla i risultati sopra." 