import cors from "cors";
import { config } from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./api/routes";
import initializeWorkers from "./jobs/workerInit";
import { logger } from "./utils/logger";
import { queues, setupQueueEvents } from "./utils/queue";

// Load environment variables
config();

// Function to clear all previous jobs and reset queue state
const clearPreviousJobs = async () => {
  try {
    logger.info("🧹 Clearing all previous jobs and resetting queue state...");

    // Get job counts before clearing
    const waiting = await queues.factCheck.getWaiting();
    const active = await queues.factCheck.getActive();
    const completed = await queues.factCheck.getCompleted();
    const failed = await queues.factCheck.getFailed();

    logger.info(
      `📊 Found ${waiting.length} waiting, ${active.length} active, ${completed.length} completed, ${failed.length} failed jobs`
    );

    // Clear all jobs from the fact-check queue
    await queues.factCheck.obliterate({ force: true });

    // Wait for Redis operations to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));

    logger.info(
      "✅ All previous jobs cleared successfully - starting with clean slate"
    );
  } catch (error) {
    logger.error("❌ Error clearing previous jobs:", error);
    // Don't fail startup if job clearing fails
  }
};

// Validate required environment variables
const requiredEnvVars = ["BRIGHT_DATA_API_TOKEN", "DATABASE_URL", "REDIS_URL"];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error(
    "❌ Missing required environment variables:",
    missingEnvVars.join(", ")
  );
  console.error(
    "Please check your .env file and ensure all required variables are set."
  );
  process.exit(1);
}

// Create Express server
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers

app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite dev server
      "http://localhost:8080", // Current frontend port
      "http://localhost:3000", // Alternative dev port
      "http://localhost:4173", // Vite preview
      "https://brightcheck.vercel.app", // Production domain (if deployed)
      "https://*.vercel.app", // Vercel preview deployments
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["X-Total-Count"],
    maxAge: 86400, // 24 hours
  })
);

app.use(express.json({ limit: "10mb" })); // Parse JSON bodies with size limit
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Parse URL-encoded bodies
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// API Routes
app.use("/api", routes);

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error(`Error: ${err.message}`, { error: err, stack: err.stack });
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }
);

// Setup workers and queue events (only once)
let workersStarted = false;
const startWorkers = () => {
  if (workersStarted) {
    logger.warn("Workers already started, skipping...");
    return;
  }

  setupQueueEvents();
  initializeWorkers();
  workersStarted = true;
  logger.info("BrightCheck workers started successfully");
};

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// Start the application
const startApp = async () => {
  try {
    logger.info("Starting BrightCheck backend...");

    // Clear all previous jobs first
    await clearPreviousJobs();

    // Start workers
    startWorkers();

    // Start the server
    const server = app.listen(port, () => {
      logger.info(`Server running at http://localhost:${port}`);
    });

    // Handle graceful shutdown
    process.on("SIGTERM", () => {
      logger.info("SIGTERM signal received: shutting down...");
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      logger.info("SIGINT signal received: shutting down...");
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    });

    logger.info("BrightCheck backend started successfully");
  } catch (error) {
    logger.error("Failed to start application", { error });
    process.exit(1);
  }
};

// Start the application
startApp();
