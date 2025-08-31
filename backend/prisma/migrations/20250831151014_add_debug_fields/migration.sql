/*
  Warnings:

  - You are about to drop the `offers_embeddings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."offers_embeddings" DROP CONSTRAINT "offers_embeddings_offerId_fkey";

-- DropTable
DROP TABLE "public"."offers_embeddings";
