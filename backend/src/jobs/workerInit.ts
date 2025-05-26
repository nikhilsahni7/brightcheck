import type { WorkerOptions } from "bullmq";
import { Job, Worker } from "bullmq";
import { logger } from "../utils/logger";
import { QueueNames } from "../utils/queue";
import factCheckProcessor from "./factCheckProcessor";

// Timeout constants - Increased for comprehensive fact-checking
const TOTAL_TIMEOUT = 180000; // 3 minutes total (increased from 90 seconds)
const JOB_TIMEOUT = 170000; // 2 minutes 50 seconds per job (leaving 10s buffer)
const LOCK_DURATION = 200000; // 3 minutes 20 seconds lock duration (longer than job timeout)

// Redis connection options
const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
};

interface FactCheckJobData {
  claim: string;
  id: string;
}

// Singleton worker instance
let workerInstance: Worker<FactCheckJobData> | null = null;
let workersInitialized = false;

/**
 * Initialize simplified worker process (singleton)
 * Only fact-check worker is needed since all phases are handled by the comprehensive orchestrator
 */
export function initializeWorkers() {
  if (workersInitialized) {
    logger.warn("Workers already initialized, skipping...");
    return workerInstance
      ? [{ name: "FactCheck", worker: workerInstance }]
      : [];
  }

  logger.info("Initializing simplified fact-check worker...");

  // Common worker options - Optimized for long-running fact-check jobs
  const workerOptions: WorkerOptions = {
    connection,
    concurrency: 1, // Keep at 1 to prevent resource conflicts
    limiter: {
      max: 2, // Reduced to 2 concurrent jobs max
      duration: 180000, // 3 minutes window
    },
    stalledInterval: 120000, // Check for stalled jobs every 2 minutes (increased)
    maxStalledCount: 1, // Only allow 1 stall before marking as failed
    lockDuration: LOCK_DURATION, // 3 minutes 20 seconds lock duration
    lockRenewTime: 60000, // Renew lock every minute
    settings: {
      stalledInterval: 120000,
      maxStalledCount: 1,
    },
  };

  // Initialize fact check worker with comprehensive orchestrator
  const factCheckWorker = new Worker<FactCheckJobData>(
    QueueNames.FACT_CHECK,
    async (job: Job<FactCheckJobData>) => {
      try {
        logger.info(`[WORKER] Starting comprehensive fact-check job ${job.id}`);

        // Set job timeout to prevent infinite running
        const jobTimeoutId = setTimeout(() => {
          logger.error(
            `[WORKER] Job ${job.id} exceeded maximum timeout of ${JOB_TIMEOUT}ms`
          );
          throw new Error(`Job timeout exceeded (${JOB_TIMEOUT}ms)`);
        }, JOB_TIMEOUT);

        try {
          // Process the fact check using comprehensive orchestrator
          const result = await factCheckProcessor(job);

          // Clear timeout on successful completion
          clearTimeout(jobTimeoutId);

          logger.info(
            `[WORKER] Completed fact-check job ${job.id} with verdict: ${result.verdict}`
          );
          return result;
        } catch (processingError) {
          // Clear timeout on error
          clearTimeout(jobTimeoutId);
          throw processingError;
        }
      } catch (error) {
        logger.error(
          `[WORKER] Fact check job ${job.id} failed: ${error instanceof Error ? error.message : String(error)}`
        );
        throw error;
      }
    },
    workerOptions
  );

  // Handle worker events
  factCheckWorker.on("completed", (job: Job<FactCheckJobData>, result: any) => {
    logger.info(`[WORKER] Fact check job ${job.id} completed successfully`, {
      verdict: result.verdict,
      confidence: result.confidence,
      evidenceCount: result.evidenceCount,
      processingTime: result.processingTime,
    });
  });

  factCheckWorker.on(
    "failed",
    (job: Job<FactCheckJobData> | undefined, error: Error) => {
      logger.error(`[WORKER] Fact check job ${job?.id} failed`, {
        error: error.message,
        stack: error.stack,
      });
    }
  );

  factCheckWorker.on("stalled", (jobId: string) => {
    logger.warn(
      `[WORKER] Fact check job ${jobId} stalled - may need manual intervention`
    );
  });

  // Handle worker errors
  factCheckWorker.on("error", (error: Error) => {
    logger.error(`[WORKER] Worker error: ${error.message}`, {
      stack: error.stack,
    });
  });

  // Handle process events for graceful shutdown
  process.on("SIGTERM", async () => {
    logger.info("SIGTERM received, closing fact-check worker...");
    await factCheckWorker.close();
  });

  process.on("SIGINT", async () => {
    logger.info("SIGINT received, closing fact-check worker...");
    await factCheckWorker.close();
  });

  // Set singleton instances
  workerInstance = factCheckWorker;
  workersInitialized = true;

  logger.info("Simplified fact-check worker initialized successfully");

  return [{ name: "FactCheck", worker: factCheckWorker }];
}

export default initializeWorkers;
