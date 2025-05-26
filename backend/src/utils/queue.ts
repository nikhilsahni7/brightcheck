import { Job, Queue, QueueEvents, Worker } from "bullmq";
import { config } from "dotenv";
import Redis from "redis";
import { logger } from "./logger";

// Load environment variables
config();

// Redis connection options
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redisOptions = {
  url: redisUrl,
};

// Create Redis client
const createRedisClient = () => {
  const client = Redis.createClient(redisOptions);

  client.on("error", (err) => {
    logger.error("Redis connection error:", err);
  });

  client.on("connect", () => {
    logger.info("Connected to Redis");
  });

  return client;
};

// Queue names
export const QueueNames = {
  FACT_CHECK: "fact-check",
} as const;

// Create simplified queue structure with optimized settings for long-running jobs
export const queues = {
  factCheck: new Queue(QueueNames.FACT_CHECK, {
    connection: redisOptions,
    defaultJobOptions: {
      removeOnComplete: 10, // Keep last 10 completed jobs
      removeOnFail: 50, // Keep last 50 failed jobs for debugging
      attempts: 1, // No retries to prevent phase repetition (changed from 2)
      backoff: {
        type: "exponential",
        delay: 10000, // 10 second delay if retry is needed
      },
      // Job timeout settings
      jobId: undefined, // Let BullMQ generate unique IDs
      delay: 0,
      priority: 0,
      // Prevent job duplication
      removeOnComplete: 5,
      removeOnFail: 10,
    },
  }),
};

// Setup queue events for monitoring (singleton)
let queueEventsInitialized = false;
let queueEventsInstance: QueueEvents | null = null;

export const setupQueueEvents = () => {
  if (queueEventsInitialized) {
    logger.warn("[QUEUE] Queue events already initialized, skipping...");
    return queueEventsInstance;
  }

  const queueEvents = new QueueEvents(QueueNames.FACT_CHECK, {
    connection: redisOptions,
  });

  queueEvents.on("completed", ({ jobId, returnvalue }) => {
    const result = returnvalue as any;
    logger.info(`[QUEUE] Fact-check job ${jobId} completed`, {
      verdict: result?.verdict,
      confidence: result?.confidence,
      evidenceCount: result?.evidenceCount,
      processingTime: result?.processingTime,
    });
  });

  queueEvents.on("failed", ({ jobId, failedReason }) => {
    logger.error(`[QUEUE] Fact-check job ${jobId} failed`, {
      reason: failedReason,
    });
  });

  queueEvents.on("stalled", ({ jobId }) => {
    logger.warn(`[QUEUE] Fact-check job ${jobId} stalled`);
  });

  queueEvents.on("progress", ({ jobId, data }) => {
    logger.info(`[QUEUE] Fact-check job ${jobId} progress:`, data);
  });

  queueEvents.on("waiting", ({ jobId }) => {
    logger.info(`[QUEUE] Fact-check job ${jobId} is waiting`);
  });

  queueEvents.on("active", ({ jobId }) => {
    logger.info(`[QUEUE] Fact-check job ${jobId} started processing`);
  });

  // Handle retries and prevent infinite loops
  queueEvents.on("retries-exhausted", ({ jobId }) => {
    logger.error(`[QUEUE] Fact-check job ${jobId} exhausted all retries`);
  });

  queueEventsInitialized = true;
  queueEventsInstance = queueEvents;

  return queueEvents;
};

// Function to create a worker (simplified) - Updated for long-running jobs
export const createWorker = <T, R>(
  processor: (job: Job<T>) => Promise<R>,
  options = {}
) => {
  const worker = new Worker(QueueNames.FACT_CHECK, processor, {
    connection: redisOptions,
    concurrency: 1, // Single job at a time to prevent conflicts
    limiter: {
      max: 2, // Max 2 jobs in 3 minutes
      duration: 180000,
    },
    stalledInterval: 120000, // Check for stalled jobs every 2 minutes
    maxStalledCount: 1, // Only allow 1 stall before failing
    lockDuration: 200000, // 3 minutes 20 seconds lock
    lockRenewTime: 60000, // Renew every minute
    ...options,
  });

  worker.on("error", (err) => {
    logger.error(`[QUEUE] Error in fact-check worker:`, err);
  });

  return worker;
};

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info("[QUEUE] Shutting down queue connections...");

  try {
    await queues.factCheck.close();

    if (queueEventsInstance) {
      await queueEventsInstance.close();
      queueEventsInstance = null;
      queueEventsInitialized = false;
    }
  } catch (error) {
    logger.error("[QUEUE] Error during shutdown:", error);
  }

  logger.info("[QUEUE] All queue connections closed");
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

export default queues;
