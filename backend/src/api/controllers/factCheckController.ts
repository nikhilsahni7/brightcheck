import { PrismaClient } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { logger } from "../../utils/logger";
import { queues } from "../../utils/queue";

const prisma = new PrismaClient();

// Validation schema for fact check request
const factCheckSchema = z.object({
  claim: z
    .string()
    .min(10, "Claim must be at least 10 characters long")
    .max(1000, "Claim must be less than 1000 characters"),
});

// In-memory cache to prevent duplicate submissions
const recentSubmissions = new Map<
  string,
  { jobId: string; timestamp: number }
>();
const DUPLICATE_PREVENTION_WINDOW = 30000; // 30 seconds

// Clean up old submissions periodically
setInterval(() => {
  const now = Date.now();
  for (const [claim, data] of recentSubmissions.entries()) {
    if (now - data.timestamp > DUPLICATE_PREVENTION_WINDOW) {
      recentSubmissions.delete(claim);
    }
  }
}, 60000); // Clean up every minute

// Helper function to transform evidence data from database format to API format
const transformEvidence = (evidence: any) => {
  // Helper function to safely convert JSON to array
  const jsonToArray = (value: any): string[] => {
    if (Array.isArray(value)) {
      return value;
    }
    if (value === null || value === undefined) {
      return [];
    }
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    if (typeof value === "object") {
      // If it's already a parsed JSON object that should be an array
      return Array.isArray(value) ? value : [];
    }
    return [];
  };

  // Helper function to safely convert JSON string to object
  const jsonToObject = (value: any): object | undefined => {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return value; // Already an object
    }
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return typeof parsed === "object" &&
          parsed !== null &&
          !Array.isArray(parsed)
          ? parsed
          : undefined;
      } catch {
        return undefined;
      }
    }
    return undefined;
  };

  const transformed = {
    ...evidence,
    entities: jsonToArray(evidence.entities),
    keywords: jsonToArray(evidence.keywords),
    claims: jsonToArray(evidence.claims),
    engagement: jsonToObject(evidence.engagement), // Parse engagement
  };

  // If engagement was not parsable or was not a valid object, ensure it's at least an empty object or undefined
  // depending on how the frontend expects it if missing.
  // For now, if it ended up undefined from jsonToObject, we'll keep it that way.
  // If it was null from DB and jsonToObject returned undefined, it remains undefined.
  // If it was a valid object from DB, it remains an object.

  return transformed;
};

export const submitFactCheck = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request
    const validatedData = factCheckSchema.parse(req.body);
    const { claim } = validatedData;

    logger.info(
      `Received fact check request for claim: "${claim.substring(0, 50)}..."`
    );

    // Check for recent duplicate submissions
    const claimKey = claim.toLowerCase().trim();
    const recentSubmission = recentSubmissions.get(claimKey);

    if (recentSubmission) {
      logger.info(
        `Duplicate submission detected for claim, returning existing job: ${recentSubmission.jobId}`
      );
      return res.status(202).json({
        status: "processing",
        message: "Similar fact check is already being processed",
        jobId: recentSubmission.jobId,
      });
    }

    // Add job to fact check queue with unique job options
    const job = await queues.factCheck.add(
      "new-fact-check",
      { claim },
      {
        attempts: 1, // No retries to prevent phase repetition
        removeOnComplete: 5,
        removeOnFail: 10,
        // Add unique job ID based on claim hash to prevent duplicates
        jobId: `fact-check-${Buffer.from(claimKey).toString("base64").slice(0, 16)}-${Date.now()}`,
        backoff: {
          type: "exponential",
          delay: 10000,
        },
      }
    );

    // Store in recent submissions cache
    recentSubmissions.set(claimKey, {
      jobId: job.id!,
      timestamp: Date.now(),
    });

    logger.info(`Created fact check job with ID: ${job.id}`);

    // Return response
    res.status(202).json({
      status: "processing",
      message: "Fact check job created and is being processed",
      jobId: job.id,
    });
  } catch (error) {
    logger.error(
      `Error creating fact check job: ${error instanceof Error ? error.message : String(error)}`
    );

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: "error",
        message: "Validation error",
        errors: error.errors,
      });
    }

    next(error);
  }
};

export const getFactCheck = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Fetch fact check with evidence
    const factCheck = await prisma.factCheck.findUnique({
      where: { id },
      select: {
        id: true,
        claim: true,
        verdict: true,
        confidence: true,
        summary: true,
        reasoning: true,
        socialSignals: true,
        riskAssessment: true,
        methodology: true,
        riskLevel: true,
        metadata: true,
        processingTime: true,
        evidenceCount: true,
        createdAt: true,
        updatedAt: true,
        evidence: {
          orderBy: {
            credibilityScore: "desc",
          },
        },
        searchQueries: {
          select: {
            query: true,
            platform: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!factCheck) {
      return res.status(404).json({
        status: "error",
        message: "Fact check not found",
      });
    }

    // Transform evidence data to ensure JSON fields are properly converted to arrays
    const transformedFactCheck = {
      ...factCheck,
      evidence: factCheck.evidence.map(transformEvidence),
    };

    // Return fact check data
    res.status(200).json({
      status: "success",
      data: transformedFactCheck,
    });
  } catch (error) {
    logger.error(
      `Error fetching fact check: ${error instanceof Error ? error.message : String(error)}`
    );
    next(error);
  }
};

export const listFactChecks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Fetch fact checks with pagination
    const factChecks = await prisma.factCheck.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        claim: true,
        verdict: true,
        confidence: true,
        riskLevel: true,
        evidenceCount: true,
        processingTime: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { evidence: true },
        },
      },
    });

    // Transform the data to match frontend expectations
    const transformedFactChecks = factChecks.map((factCheck) => ({
      ...factCheck,
      evidenceCount: factCheck.evidenceCount || factCheck._count.evidence,
      // Remove _count from the response
      _count: undefined,
    }));

    // Count total fact checks
    const total = await prisma.factCheck.count();

    // Return paginated list
    res.status(200).json({
      status: "success",
      data: transformedFactChecks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error(
      `Error listing fact checks: ${error instanceof Error ? error.message : String(error)}`
    );
    next(error);
  }
};

export const getJobStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Get job status from queue
    const job = await queues.factCheck.getJob(id);

    if (!job) {
      return res.status(404).json({
        status: "error",
        message: "Job not found",
      });
    }

    // Get job state and progress
    const state = await job.getState();
    const progress = job.progress;

    res.status(200).json({
      status: "success",
      data: {
        jobId: job.id,
        state,
        progress,
        data: job.data,
        result: job.returnvalue,
      },
    });
  } catch (error) {
    logger.error(
      `Error getting job status: ${error instanceof Error ? error.message : String(error)}`
    );
    next(error);
  }
};
