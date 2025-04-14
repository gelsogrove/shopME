-- This is an empty migration.

-- Modifica della colonna description da VARCHAR a TEXT nella tabella services
ALTER TABLE "services" ALTER COLUMN "description" TYPE TEXT;