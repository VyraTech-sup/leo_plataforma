/*
  Warnings:

  - You are about to drop the column `externalTransactionId` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `isPending` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `isRecurring` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `transactions` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "transactions_externalTransactionId_idx";

-- DropIndex
DROP INDEX "transactions_externalTransactionId_key";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "externalTransactionId",
DROP COLUMN "isPending",
DROP COLUMN "isRecurring",
DROP COLUMN "tags",
ADD COLUMN     "currentInstallment" INTEGER,
ADD COLUMN     "installmentGroupId" TEXT,
ADD COLUMN     "installmentValue" DECIMAL(65,30),
ADD COLUMN     "totalInstallments" INTEGER;

-- CreateTable
CREATE TABLE "InstallmentGroup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "totalValue" DECIMAL(15,2) NOT NULL,
    "totalInstallments" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstallmentGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transactions_installmentGroupId_idx" ON "transactions"("installmentGroupId");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_installmentGroupId_fkey" FOREIGN KEY ("installmentGroupId") REFERENCES "InstallmentGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
