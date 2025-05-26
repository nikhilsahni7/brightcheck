import express from "express";
import * as factCheckController from "./controllers/factCheckController";

const router = express.Router();

// Fact Check endpoints
router.post("/fact-checks", factCheckController.submitFactCheck as any);
router.get("/fact-checks/:id", factCheckController.getFactCheck as any);
router.get("/fact-checks", factCheckController.listFactChecks as any);
router.get("/fact-checks/job/:id", factCheckController.getJobStatus as any);

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
status: "healthy",
    message: "BrightCheck API is up and running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
