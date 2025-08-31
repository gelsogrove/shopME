-- CreateTable
CREATE TABLE "public"."offers_embeddings" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "embedding" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "offers_embeddings_offerId_key" ON "public"."offers_embeddings"("offerId");

-- CreateIndex
CREATE INDEX "offers_embeddings_offerId_idx" ON "public"."offers_embeddings"("offerId");

-- AddForeignKey
ALTER TABLE "public"."offers_embeddings" ADD CONSTRAINT "offers_embeddings_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "public"."offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
