-- Add debug fields to messages table
ALTER TABLE "messages" ADD COLUMN "translatedQuery" TEXT;
ALTER TABLE "messages" ADD COLUMN "functionCallsDebug" JSONB;
ALTER TABLE "messages" ADD COLUMN "processingSource" TEXT;
