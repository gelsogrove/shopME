/*
  Warnings:

  - You are about to drop the column `image` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "image";

-- CreateTable
CREATE TABLE "_OfferCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_OfferCategories_AB_unique" ON "_OfferCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_OfferCategories_B_index" ON "_OfferCategories"("B");

-- AddForeignKey
ALTER TABLE "_OfferCategories" ADD CONSTRAINT "_OfferCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OfferCategories" ADD CONSTRAINT "_OfferCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
