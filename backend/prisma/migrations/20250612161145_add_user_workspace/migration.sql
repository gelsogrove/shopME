-- AlterTable
ALTER TABLE "_OfferCategories" ADD CONSTRAINT "_OfferCategories_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_OfferCategories_AB_unique";
