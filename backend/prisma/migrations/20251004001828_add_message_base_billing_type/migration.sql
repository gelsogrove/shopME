-- CreateEnum
CREATE TYPE "public"."BillingType" AS ENUM ('MONTHLY_CHANNEL', 'MESSAGE_BASE', 'LLM_RESPONSE', 'NEW_CUSTOMER', 'NEW_ORDER', 'HUMAN_SUPPORT', 'PUSH_MESSAGE', 'NEW_FAQ', 'ACTIVE_OFFER');

-- CreateTable
CREATE TABLE "public"."Billing" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "customerId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "public"."BillingType" NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Billing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Billing_workspaceId_idx" ON "public"."Billing"("workspaceId");

-- CreateIndex
CREATE INDEX "Billing_customerId_idx" ON "public"."Billing"("customerId");

-- CreateIndex
CREATE INDEX "Billing_type_idx" ON "public"."Billing"("type");

-- CreateIndex
CREATE INDEX "Billing_createdAt_idx" ON "public"."Billing"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Billing" ADD CONSTRAINT "Billing_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Billing" ADD CONSTRAINT "Billing_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
