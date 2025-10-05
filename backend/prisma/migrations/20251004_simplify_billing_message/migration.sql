-- Step 1: Crea il nuovo enum
CREATE TYPE "BillingType_new" AS ENUM ('MONTHLY_CHANNEL', 'MESSAGE', 'NEW_CUSTOMER', 'NEW_ORDER', 'HUMAN_SUPPORT', 'PUSH_MESSAGE', 'NEW_FAQ', 'ACTIVE_OFFER');

-- Step 2: Aggiungi una colonna temporanea
ALTER TABLE "Billing" ADD COLUMN "type_new" "BillingType_new";

-- Step 3: Converti i valori esistenti
UPDATE "Billing" 
SET "type_new" = 'MESSAGE'::"BillingType_new",
    amount = 0.15,
    description = CONCAT('[MIGRATED] ', COALESCE(description, 'Message interaction'))
WHERE type IN ('MESSAGE_BASE', 'LLM_RESPONSE');

-- Step 4: Copia gli altri valori
UPDATE "Billing" 
SET "type_new" = type::text::"BillingType_new"
WHERE type NOT IN ('MESSAGE_BASE', 'LLM_RESPONSE');

-- Step 5: Rimuovi la vecchia colonna
ALTER TABLE "Billing" DROP COLUMN type;

-- Step 6: Rinomina la nuova colonna
ALTER TABLE "Billing" RENAME COLUMN "type_new" TO type;

-- Step 7: Rimuovi il vecchio enum
DROP TYPE "BillingType";

-- Step 8: Rinomina il nuovo enum
ALTER TYPE "BillingType_new" RENAME TO "BillingType";
