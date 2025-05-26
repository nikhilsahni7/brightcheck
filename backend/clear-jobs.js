#!/usr/bin/env node

const { Queue } = require("bullmq");
const { config } = require("dotenv");

// Load environment variables
config();

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redisOptions = {
  url: redisUrl,
};

const clearAllJobs = async () => {
  console.log("🧹 Clearing all BrightCheck jobs...");

  const factCheckQueue = new Queue("fact-check", {
    connection: redisOptions,
  });

  try {
    // Get job counts before clearing
    const waiting = await factCheckQueue.getWaiting();
    const active = await factCheckQueue.getActive();
    const completed = await factCheckQueue.getCompleted();
    const failed = await factCheckQueue.getFailed();

    console.log(
      `📊 Found ${waiting.length} waiting, ${active.length} active, ${completed.length} completed, ${failed.length} failed jobs`
    );

    // Clear all jobs
    await factCheckQueue.obliterate({ force: true });

    console.log("✅ All jobs cleared successfully!");
  } catch (error) {
    console.error("❌ Error clearing jobs:", error);
  } finally {
    await factCheckQueue.close();
    process.exit(0);
  }
};

clearAllJobs();
