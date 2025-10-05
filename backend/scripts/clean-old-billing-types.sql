-- Script SQL per pulire i vecchi tipi di billing prima della migrazione
-- Questo script elimina tutti i record con MESSAGE_BASE e LLM_RESPONSE

-- Conta i record esistenti
SELECT 
  type, 
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM "Billing"
WHERE type IN ('MESSAGE_BASE', 'LLM_RESPONSE')
GROUP BY type;

-- Se vuoi cancellarli, esegui:
-- DELETE FROM "Billing" WHERE type IN ('MESSAGE_BASE', 'LLM_RESPONSE');

-- Oppure convertili nel nuovo tipo MESSAGE con prezzo €0.15:
-- UPDATE "Billing" 
-- SET type = 'MESSAGE', amount = 0.15, description = CONCAT('[MIGRATED] ', COALESCE(description, 'Message'))
-- WHERE type IN ('MESSAGE_BASE', 'LLM_RESPONSE');
