#!/usr/bin/env node

/**
 * BrightCheck Test Script
 * Tests the comprehensive fact-checking system end-to-end
 */

import axios from "axios";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_BASE = process.env.API_BASE || "http://localhost:3000";

async function testFactCheck() {
  console.log("🚀 Testing BrightCheck Comprehensive Fact-Checking System\n");

  const testClaims = [
    "The Earth is flat",
    "COVID-19 vaccines contain microchips",
    "Climate change is a hoax",
    "The 2020 US election was stolen",
    "5G towers cause cancer",
  ];

  for (const claim of testClaims) {
    console.log(`📝 Testing claim: "${claim}"`);

    try {
      // Submit fact check
      console.log("   ⏳ Submitting fact check request...");
      const submitResponse = await axios.post(`${API_BASE}/api/fact-checks`, {
        claim,
      });

      if (submitResponse.status !== 202) {
        console.log(`   ❌ Failed to submit: ${submitResponse.status}`);
        continue;
      }

      const jobId = submitResponse.data.jobId;
      console.log(`   ✅ Job created: ${jobId}`);

      // Poll for completion (max 2 minutes)
      console.log("   ⏳ Waiting for completion...");
      let completed = false;
      let attempts = 0;
      const maxAttempts = 24; // 2 minutes with 5-second intervals

      while (!completed && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
        attempts++;

        try {
          const statusResponse = await axios.get(
            `${API_BASE}/api/fact-checks/job/${jobId}`
          );
          const jobState = statusResponse.data.data.state;

          console.log(
            `   📊 Job state: ${jobState} (attempt ${attempts}/${maxAttempts})`
          );

          if (jobState === "completed") {
            completed = true;

            // Get the fact check result
            const result = statusResponse.data.data.result;
            if (result && result.factCheckId) {
              const factCheckResponse = await axios.get(
                `${API_BASE}/api/fact-checks/${result.factCheckId}`
              );
              const factCheck = factCheckResponse.data.data;

              console.log(`   ✅ COMPLETED!`);
              console.log(`   📊 Verdict: ${factCheck.verdict}`);
              console.log(`   🎯 Confidence: ${factCheck.confidence}%`);
              console.log(`   ⚠️  Risk Level: ${factCheck.riskLevel}`);
              console.log(`   📚 Evidence Count: ${factCheck.evidenceCount}`);
              console.log(`   ⏱️  Processing Time: ${result.processingTime}ms`);
              console.log(
                `   🔍 Evidence Sources: ${factCheck.evidence?.length || 0}`
              );
            }
          } else if (jobState === "failed") {
            console.log(`   ❌ Job failed`);
            break;
          }
        } catch (statusError) {
          console.log(`   ⚠️  Status check error: ${statusError.message}`);
        }
      }

      if (!completed) {
        console.log(`   ⏰ Timeout after ${maxAttempts * 5} seconds`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    console.log(""); // Empty line between tests
  }

  console.log("🏁 Test completed!");
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testFactCheck().catch(console.error);
}

export { testFactCheck };
