-- AlterTable
ALTER TABLE "public"."messages" ADD COLUMN     "functionCallsDebug" TEXT,
ADD COLUMN     "processingSource" TEXT,
ADD COLUMN     "translatedQuery" TEXT;

-- AlterTable
ALTER TABLE "public"."whatsapp_settings" ADD COLUMN     "n8nWebhook" TEXT DEFAULT 'http://localhost:5678/webhook/webhook-start';
