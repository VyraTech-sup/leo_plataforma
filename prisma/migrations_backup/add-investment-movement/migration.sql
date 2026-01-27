-- Migration: Add InvestmentMovement model for aportes/retiradas
CREATE TABLE "investment_movements" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "investmentId" TEXT NOT NULL,
  "amount" DECIMAL(15,2) NOT NULL,
  "type" VARCHAR(16) NOT NULL, -- APORTE or RETIRADA
  "date" TIMESTAMP NOT NULL DEFAULT NOW(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "fk_investment" FOREIGN KEY ("investmentId") REFERENCES "investments"("id") ON DELETE CASCADE
);

CREATE INDEX "investment_movements_investmentId_idx" ON "investment_movements" ("investmentId");
