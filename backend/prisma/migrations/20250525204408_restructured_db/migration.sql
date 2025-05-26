/*
  Warnings:

  - The values [OFFICIAL_FACT_CHECK] on the enum `SourceType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterEnum
BEGIN;
CREATE TYPE "SourceType_new" AS ENUM ('NEWS', 'FACT_CHECK', 'SOCIAL_MEDIA', 'ACADEMIC', 'OFFICIAL', 'FORUM', 'VIDEO', 'BLOG', 'WEB', 'OTHER');
ALTER TABLE "Evidence" ALTER COLUMN "sourceType" TYPE "SourceType_new" USING ("sourceType"::text::"SourceType_new");
ALTER TYPE "SourceType" RENAME TO "SourceType_old";
ALTER TYPE "SourceType_new" RENAME TO "SourceType";
DROP TYPE "SourceType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Evidence" ADD COLUMN     "author" TEXT,
ADD COLUMN     "claims" JSONB,
ADD COLUMN     "credibilityScore" DOUBLE PRECISION NOT NULL DEFAULT 5,
ADD COLUMN     "entities" JSONB,
ADD COLUMN     "fullContent" TEXT,
ADD COLUMN     "keywords" JSONB,
ADD COLUMN     "publishedDate" TIMESTAMP(3),
ADD COLUMN     "sentiment" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "FactCheck" ADD COLUMN     "evidenceCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "processingTime" INTEGER,
ADD COLUMN     "riskLevel" "RiskLevel" NOT NULL DEFAULT 'MEDIUM';
