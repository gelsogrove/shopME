#!/bin/bash

# Script per testare l'API /api/internal/rag-search con una query specificata
# Mostra l'output formattato per essere usato come input RAG per un secondo modello LLM
#
# Uso: ./test-searchrag.sh [query] [--json]
# Esempio: ./test-searchrag.sh "mozzarella"
# Esempio con output JSON: ./test-searchrag.sh "mozzarella" --json
# Se non viene specificata una query, viene usata "mozzarella" come default
#
# NOTA: Dai test effettuati, sembra che al momento solo la query "mozzarella" restituisca risultati.
# Le query come "mozzarelle", "formaggio", "bufala", "cheese", "pizza", "parmigiano" non trovano risultati.
# Questo potrebbe essere dovuto alla configurazione degli embedding o alla limitata quantità di dati indicizzati.

API_URL="http://localhost:3001/api/internal/rag-search"
WORKSPACE_ID="cm9hjgq9v00014qk8fsdy4ujv"
LANG="it"
AUTH="Basic YWRtaW46YWRtaW4="  # admin:admin in Base64

# Usa la query passata come parametro o "mozzarella" come default
QUERY=${1:-"mozzarella"}

# Controlla se è richiesto l'output JSON
if [ "$2" == "--json" ]; then
  JSON_OUTPUT=true
else
  JSON_OUTPUT=false
  echo "🔍 Query: '$QUERY'"
  echo "-------------------------------------"
fi

# Eseguo la chiamata API e formatto l'output in modo semplice e pulito
RESULT=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH" \
  -d '{
    "query": "'$QUERY'",
    "workspaceId": "'$WORKSPACE_ID'",
    "customerLanguage": "'$LANG'"
  }')

# Se è richiesto l'output JSON, formatto i dati in un JSON semplificato
if [ "$JSON_OUTPUT" = true ]; then
  echo "$RESULT" | jq '{
    query: "'$QUERY'",
    prodotti: [.products[] | {
      nome: .product.name,
      descrizione: .product.description,
      categoria: .product.category.name,
      prezzo: .product.price
    }],
    faqs: [.faqs[] | {
      domanda: .faq.question,
      risposta: .faq.answer
    }],
    servizi: [.services[] | {
      nome: .service.name,
      descrizione: .service.description,
      prezzo: .service.price
    }],
    documenti: [.documents[] | {
      titolo: .document.title,
      contenuto: .content
    }]
  }'
  exit 0
fi

# Formatta l'output in modo più leggibile per il RAG
echo "RISULTATI TROVATI:"
echo ""

# Prodotti
PRODUCTS_COUNT=$(echo $RESULT | jq '.products | length')
if [ "$PRODUCTS_COUNT" -gt 0 ]; then
  echo "PRODOTTI ($PRODUCTS_COUNT):"
  echo "$RESULT" | jq -r '.products[] | "- Nome: \(.product.name)\n  Descrizione: \(.product.description)\n  Categoria: \(.product.category.name)\n  Prezzo: \(.product.price)€\n"'
fi

# FAQs
FAQS_COUNT=$(echo $RESULT | jq '.faqs | length')
if [ "$FAQS_COUNT" -gt 0 ]; then
  echo "FAQ ($FAQS_COUNT):"
  echo "$RESULT" | jq -r '.faqs[] | "- Domanda: \(.faq.question)\n  Risposta: \(.faq.answer)\n"'
fi

# Servizi
SERVICES_COUNT=$(echo $RESULT | jq '.services | length')
if [ "$SERVICES_COUNT" -gt 0 ]; then
  echo "SERVIZI ($SERVICES_COUNT):"
  echo "$RESULT" | jq -r '.services[] | "- Nome: \(.service.name)\n  Descrizione: \(.service.description)\n  Prezzo: \(.service.price)€\n"'
fi

# Documenti
DOCS_COUNT=$(echo $RESULT | jq '.documents | length')
if [ "$DOCS_COUNT" -gt 0 ]; then
  echo "DOCUMENTI ($DOCS_COUNT):"
  echo "$RESULT" | jq -r '.documents[] | "- Titolo: \(.document.title)\n  Contenuto: \(.content)\n"'
fi

# Se non ci sono risultati
if [ "$PRODUCTS_COUNT" -eq 0 ] && [ "$FAQS_COUNT" -eq 0 ] && [ "$SERVICES_COUNT" -eq 0 ] && [ "$DOCS_COUNT" -eq 0 ]; then
  echo "Nessun risultato trovato per la query '$QUERY'"
fi