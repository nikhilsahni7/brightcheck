-- CreateEnum
CREATE TYPE "Verdict" AS ENUM ('TRUE', 'FALSE', 'PARTIALLY_TRUE', 'UNVERIFIED', 'OUTDATED');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('NEWS', 'OFFICIAL_FACT_CHECK', 'SOCIAL_MEDIA', 'BLOG', 'FORUM', 'VIDEO', 'OTHER');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('GOOGLE', 'GOOGLE_NEWS', 'TWITTER', 'REDDIT', 'FACEBOOK', 'INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'QUORA', 'OTHER');

-- CreateTable
CREATE TABLE "FactCheck" (
    "id" TEXT NOT NULL,
    "claim" TEXT NOT NULL,
    "verdict" "Verdict" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reasoning" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FactCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL,
    "snippet" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "factCheckId" TEXT NOT NULL,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchQuery" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "results" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "factCheckId" TEXT NOT NULL,

    CONSTRAINT "SearchQuery_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_factCheckId_fkey" FOREIGN KEY ("factCheckId") REFERENCES "FactCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchQuery" ADD CONSTRAINT "SearchQuery_factCheckId_fkey" FOREIGN KEY ("factCheckId") REFERENCES "FactCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
