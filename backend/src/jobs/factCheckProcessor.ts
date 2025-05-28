import { PrismaClient } from "@prisma/client";
import { Job } from "bullmq";
import mcpService, {
  type BrightDataTriggerResult,
  triggerFacebookPostsScraping,
  triggerTwitterPostsScraping,
  triggerRedditPostsScraping,
  triggerYouTubeVideosScraping,
  triggerInstagramPostsScraping,
  triggerTikTokPostsScraping,
  triggerQuoraPostsScraping,
} from "../services/mcpService";
import { logger } from "../utils/logger";

const prismaClient = new PrismaClient();

/**
 * Simplified fact-check processor using comprehensive orchestrator
 * This is the main entry point that runs all phases sequentially
 */
export default async function factCheckProcessor(job: Job) {
  const startTime = Date.now();

  try {
    const { claim } = job.data;
    logger.info(
      `[FACT-CHECK] Starting comprehensive fact-check for: "${claim.substring(0, 50)}..."`
    );

    // Update job progress - Phase 1: Preprocessing
    await job.updateProgress(10);

    // Create initial fact check record
    const factCheck = await prismaClient.factCheck.create({
      data: {
        claim,
        verdict: "UNVERIFIED",
        confidence: 0,
        reasoning: JSON.stringify({
          status: "Processing...",
          phase: "Initializing",
          startTime: new Date().toISOString(),
        }),
        riskLevel: "MEDIUM",
        evidenceCount: 0,
      },
    });

    logger.info(
      `[FACT-CHECK] Created fact check record with ID: ${factCheck.id}`
    );

    // Update job progress - Phase 2: Discovery
    await job.updateProgress(20);

    try {
      // Try comprehensive fact-checking first, with fallback to simplified
      let result;
      try {
        logger.info(
          `[FACT-CHECK] Starting comprehensive analysis for job ${job.id}`
        );
        result = await mcpService.runComprehensiveFactCheck(claim, {
          onProgress: async (progress: number) => {
            // Map MCP progress (0-100) to job progress (20-100)
            const jobProgress = 20 + progress * 0.8;
            await job.updateProgress(Math.min(jobProgress, 95));
          },
        });
        logger.info(
          `[FACT-CHECK] Comprehensive analysis completed for job ${job.id}`
        );
      } catch (comprehensiveError) {
        logger.warn(
          `[FACT-CHECK] Comprehensive analysis failed for job ${job.id}, using simplified: ${comprehensiveError}`
        );
        result = await mcpService.runSimplifiedFactCheck(claim, {
          onProgress: async (progress: number) => {
            const jobProgress = 20 + progress * 0.8;
            await job.updateProgress(Math.min(jobProgress, 95));
          },
        });
        logger.info(
          `[FACT-CHECK] Simplified analysis completed for job ${job.id}`
        );
      }

      // Update fact check with final results
      await prismaClient.factCheck.update({
        where: { id: factCheck.id },
        data: {
          verdict: result.verdict as any,
          confidence: result.confidence,
          summary: result.summary,
          reasoning: result.reasoning,
          riskLevel: result.riskAssessment.level as any,
          evidenceCount:
            result.evidence.supporting.length +
            result.evidence.contradicting.length +
            result.evidence.neutral.length,
          processingTime: result.processingTime,
          socialSignals: result.socialSignals as any,
          riskAssessment: result.riskAssessment as any,
          methodology: result.methodology,
          metadata: {
            processingTimestamp: new Date().toISOString(),
            brightCheckVersion: "2.0-MCP-Enhanced",
            totalSources:
              result.evidence.supporting.length +
              result.evidence.contradicting.length +
              result.evidence.neutral.length,
            supportingEvidence: result.evidence.supporting.length,
            contradictingEvidence: result.evidence.contradicting.length,
            neutralEvidence: result.evidence.neutral.length,
            averageCredibility: calculateAverageCredibility(result.evidence),
          },
        },
      });

      // Store evidence in database with better error handling
      const allEvidence = [
        ...result.evidence.supporting,
        ...result.evidence.contradicting,
        ...result.evidence.neutral,
      ];

      logger.info(
        `[FACT-CHECK] Evidence breakdown: Supporting: ${result.evidence.supporting.length}, Contradicting: ${result.evidence.contradicting.length}, Neutral: ${result.evidence.neutral.length}, Total: ${allEvidence.length}`
      );

      if (allEvidence.length > 0) {
        const evidencePromises = allEvidence.map(
          async (evidence: any, index: number) => {
            try {
              return await prismaClient.evidence.create({
                data: {
                  factCheckId: factCheck.id,
                  sourceUrl: evidence.url,
                  sourceName: evidence.source,
                  sourceType: mapSourceType(evidence.type),
                  snippet: evidence.content.substring(0, 1000), // Limit snippet length
                  fullContent: evidence.content,
                  author: evidence.author,
                  publishedDate: evidence.publishedDate
                    ? new Date(evidence.publishedDate)
                    : null,
                  credibilityScore: Math.min(
                    Math.max(evidence.credibilityScore, 0),
                    10
                  ), // Ensure 0-10 range
                  sentiment: evidence.sentiment,
                  entities: evidence.entities || [],
                  keywords: evidence.keywords || [],
                  claims: evidence.claims || [],
                  metadata: {
                    title: evidence.title,
                    type: evidence.type,
                    extractionTimestamp: new Date().toISOString(),
                    processingOrder: index + 1,
                  },
                },
              });
            } catch (evidenceError) {
              logger.error(
                `[FACT-CHECK] Failed to store evidence from ${evidence.source}: ${evidenceError instanceof Error ? evidenceError.message : String(evidenceError)}`
              );
              return null;
            }
          }
        );

        const storedEvidence = await Promise.allSettled(evidencePromises);
        const successfulEvidence = storedEvidence.filter(
          (result: any) =>
            result.status === "fulfilled" && result.value !== null
        ).length;

        logger.info(
          `[FACT-CHECK] Stored ${successfulEvidence}/${allEvidence.length} evidence records`
        );
      }

      logger.info(`[FACT-CHECK] Initiating social media scraping for claim on FactCheck ID: ${factCheck.id}`);
      const claimForSocialSearch = job.data.claim; // Original claim

      type SocialMediaScraperFunction = (inputs: any[]) => Promise<BrightDataTriggerResult>;

      const socialMediaPlatforms: {
        platformName: string;
        scraperFunction: SocialMediaScraperFunction;
        datasetType: string; // For logging/identification
      }[] = [
        {
          platformName: "Facebook",
          scraperFunction: triggerFacebookPostsScraping,
          datasetType: "Facebook Posts",
        },
        {
          platformName: "Twitter",
          scraperFunction: triggerTwitterPostsScraping,
          datasetType: "Twitter Posts",
        },
        {
          platformName: "YouTube",
          scraperFunction: triggerYouTubeVideosScraping,
          datasetType: "YouTube Videos",
        },
        {
          platformName: "Instagram",
          scraperFunction: triggerInstagramPostsScraping,
          datasetType: "Instagram Posts",
        },
        {
          platformName: "TikTok",
          scraperFunction: triggerTikTokPostsScraping,
          datasetType: "TikTok Posts",
        },
        {
          platformName: "Quora",
          scraperFunction: triggerQuoraPostsScraping,
          datasetType: "Quora Posts",
        },
        {
          platformName: "Reddit",
          scraperFunction: triggerRedditPostsScraping,
          datasetType: "Reddit Posts",
        },
      ];

      for (const platform of socialMediaPlatforms) {
        try {
          logger.info(`Attempting to trigger ${platform.datasetType} scraping for claim: "${claim}"`);
          
          const triggerResult: BrightDataTriggerResult = await platform.scraperFunction([{ query: claim, url: undefined }]);

          if (triggerResult.jobInitiated) {
            logger.info(`${platform.datasetType} scraping job initiated. Delivery ID: ${triggerResult.deliveryId || 'N/A'}, Snapshot ID: ${triggerResult.snapshotId || 'N/A'}. Raw Response: ${JSON.stringify(triggerResult.rawResponse)}`);
            
            if (triggerResult.deliveryId || triggerResult.snapshotId) {
              await prismaClient.evidence.create({
                data: {
                  factCheckId: factCheck.id,
                  sourceUrl: `search://${platform.datasetType.toLowerCase().replace(/_/g, '/')}/?query=${encodeURIComponent(claim)}`,
                  sourceName: `${platform.platformName} Search (BrightData)`,
                  sourceType: "SOCIAL_MEDIA",
                  snippet: `Social media scraping initiated for "${claim.substring(0, 50)}..." on ${platform.platformName}.`,
                  fullContent: null,
                  author: null,
                  publishedDate: null,
                  credibilityScore: 5, // Default, can be adjusted
                  metadata: {
                    brightDataDeliveryId: triggerResult.deliveryId, // Store delivery_id if present
                    brightDataSnapshotId: triggerResult.snapshotId, // Store snapshot_id if present
                    query: claim,
                    platformApi: platform.datasetType,
                    triggerTimestamp: new Date().toISOString(),
                  },
                },
              });
              logger.info(`Evidence record created for ${platform.datasetType} with Delivery ID: ${triggerResult.deliveryId} and Snapshot ID: ${triggerResult.snapshotId}`);
            } else {
              // This case should ideally not happen if jobInitiated is true and Bright Data API behaves as expected
              logger.warn(`Job initiated for ${platform.datasetType} but no delivery_id or snapshot_id received. Claim: "${claim}". Raw result: ${JSON.stringify(triggerResult.rawResponse)}`);
            }
          } else {
            // Job was not initiated, e.g., due to invalid input for the specific dataset (like query-only for Twitter)
            logger.warn(`${platform.datasetType} scraping job NOT initiated for claim: "${claim}". Reason: ${triggerResult.error || 'Unknown reason, check mcpService logs.'}. Raw details: ${JSON.stringify(triggerResult.rawResponse)}`);
          }
        } catch (error: any) {
          // This catch block handles errors from the scraperFunction call itself (e.g., network issues, unexpected exceptions)
          // not covered by the BrightDataTriggerResult.success = false scenario (which indicates an API error from Bright Data)
          logger.error(`Critical error calling ${platform.datasetType} scraper function for claim "${claim}": ${error.message}`, { stack: error.stack });
        }
      }

      logger.info(`[FACT-CHECK] Completed initiating social media scraping attempts for FactCheck ID: ${factCheck.id}`);

    const totalTime = Date.now() - startTime;
      logger.info(
        `[FACT-CHECK] Comprehensive fact-check completed in ${totalTime}ms`
      );

      // Update job progress to 100% completion
      await job.updateProgress(100);

      return {
        factCheckId: factCheck.id,
        status: "completed",
        verdict: result.verdict,
        confidence: result.confidence,
        evidenceCount:
          result.evidence.supporting.length +
          result.evidence.contradicting.length +
          result.evidence.neutral.length,
        processingTime: totalTime,
        riskLevel: result.riskAssessment.level as any,
      };
    } catch (processingError) {
      // Update fact check with error status
      await prismaClient.factCheck.update({
        where: { id: factCheck.id },
        data: {
          verdict: "UNVERIFIED",
          confidence: 0,
          reasoning: JSON.stringify({
            status: "Error",
            error:
              processingError instanceof Error
                ? processingError.message
                : String(processingError),
            processingTime: Date.now() - startTime,
            timestamp: new Date().toISOString(),
          }),
          riskLevel: "HIGH",
          processingTime: Date.now() - startTime,
        },
      });

      throw processingError;
    }
  } catch (error) {
    logger.error(
      `[FACT-CHECK] Job ${job.id} failed: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
}

/**
 * Calculate average credibility from categorized evidence
 */
function calculateAverageCredibility(evidence: {
  supporting: any[];
  contradicting: any[];
  neutral: any[];
}): number {
  const allEvidence = [
    ...evidence.supporting,
    ...evidence.contradicting,
    ...evidence.neutral,
  ];

  if (allEvidence.length === 0) return 0;

  const totalCredibility = allEvidence.reduce(
    (sum, e) => sum + (e.credibilityScore || 0),
    0
  );

  return totalCredibility / allEvidence.length;
}

/**
 * Map MCP service source types to Prisma enum values
 */
function mapSourceType(type: string) {
  const typeMap: { [key: string]: any } = {
    NEWS: "NEWS",
    FACT_CHECK: "FACT_CHECK",
    SOCIAL_MEDIA: "SOCIAL_MEDIA",
    FORUM: "FORUM",
    VIDEO: "VIDEO",
    ACADEMIC: "ACADEMIC",
    WEB: "WEB",
    OFFICIAL: "OFFICIAL",
    BLOG: "BLOG",
  };

  return typeMap[type] || "OTHER";
}

/**
 * Extract risk level from reasoning text
 */
function extractRiskLevel(
  reasoning: string
): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  const riskMatch = reasoning.match(
    /RISK_LEVEL:\s*(LOW|MEDIUM|HIGH|CRITICAL)/i
  );
  if (riskMatch) {
    return riskMatch[1].toUpperCase() as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  }

  // Fallback based on content analysis
  if (
    reasoning.toLowerCase().includes("critical") ||
    reasoning.toLowerCase().includes("dangerous")
  ) {
    return "CRITICAL";
  } else if (
    reasoning.toLowerCase().includes("high risk") ||
    reasoning.toLowerCase().includes("misleading")
  ) {
    return "HIGH";
  } else if (
    reasoning.toLowerCase().includes("low risk") ||
    reasoning.toLowerCase().includes("verified")
  ) {
    return "LOW";
  }

  return "MEDIUM";
}
