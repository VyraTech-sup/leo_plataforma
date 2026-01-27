/*
  Warnings:

  - Changed the type of `type` on the `investment_movements` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('APORTE', 'RETIRADA');

-- DropForeignKey
ALTER TABLE "investment_movements" DROP CONSTRAINT "fk_investment";

-- AlterTable
ALTER TABLE "investment_movements" ALTER COLUMN "id" DROP DEFAULT,
DROP COLUMN "type",
ADD COLUMN     "type" "MovementType" NOT NULL,
ALTER COLUMN "date" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "investment_movements" ADD CONSTRAINT "investment_movements_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "investments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
