-- AlterTable
ALTER TABLE "FactCheck" ADD COLUMN     "methodology" TEXT,
ADD COLUMN     "riskAssessment" JSONB,
ADD COLUMN     "socialSignals" JSONB,
ADD COLUMN     "summary" TEXT;
