-- AlterTable
ALTER TABLE "_OfferCategories" ADD CONSTRAINT "_OfferCategories_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_OfferCategories_AB_unique";

-- AlterTable
ALTER TABLE "whatsapp_settings" ADD COLUMN     "n8nWebhook" TEXT DEFAULT 'http://localhost:5678/webhook/webhook-start';
