#!/bin/bash

# Script per riorganizzare i file di test nella struttura corretta

# Crea le directory se non esistono
mkdir -p src/__tests__/unit/{controllers,services,repositories,middleware,utils,helpers}
mkdir -p src/__tests__/integration/{controllers,services,middleware,endpoints,utils,helpers}

# Sposta i test dei servizi
echo "Spostamento test dei servizi..."
mv src/__tests__/product.service.spec.ts src/__tests__/unit/services/ 2>/dev/null
mv src/__tests__/offer.service.spec.ts src/__tests__/unit/services/ 2>/dev/null
mv src/__tests__/category.service.spec.ts src/__tests__/unit/services/ 2>/dev/null
mv src/__tests__/service.service.spec.ts src/__tests__/unit/services/ 2>/dev/null
mv src/__tests__/message.service.spec.ts src/__tests__/unit/services/ 2>/dev/null
mv src/__tests__/faq.service.spec.ts src/__tests__/unit/services/ 2>/dev/null

# Sposta i test dei controller
echo "Spostamento test dei controller..."
mv src/__tests__/category.controller.spec.ts src/__tests__/unit/controllers/ 2>/dev/null
mv src/__tests__/faq.controller.spec.ts src/__tests__/unit/controllers/ 2>/dev/null
mv src/__tests__/offer.controller.spec.ts src/__tests__/unit/controllers/ 2>/dev/null
mv src/__tests__/services.controller.spec.ts src/__tests__/unit/controllers/ 2>/dev/null

# Sposta i test di middleware
echo "Spostamento test dei middleware..."
mv src/__tests__/workspace-middleware.spec.ts src/__tests__/unit/middleware/ 2>/dev/null

# Sposta i test di utility
echo "Spostamento test delle utility..."
mv src/__tests__/language-detector.spec.ts src/__tests__/unit/utils/ 2>/dev/null

# Analizza il contenuto degli altri file per capire dove spostarli
echo "Spostamento altri file di test..."

# endpoints.spec.ts dovrebbe andare in integration/endpoints
mv src/__tests__/endpoints.spec.ts src/__tests__/integration/endpoints/ 2>/dev/null

# services.spec.ts e supplier-product.spec.ts sono probabilmente test di integrazione
mv src/__tests__/services.spec.ts src/__tests__/integration/services/ 2>/dev/null
mv src/__tests__/supplier-product.spec.ts src/__tests__/integration/services/ 2>/dev/null

# Sposta i file di utility nei percorsi corretti se non sono già stati spostati
if [ -f src/__tests__/repositories.mock.ts ]; then
  echo "Spostamento file di mock dei repository..."
  mv src/__tests__/repositories.mock.ts src/__tests__/unit/ 2>/dev/null
fi

echo "Processo completato!" 