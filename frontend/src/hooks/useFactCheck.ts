import { apiService } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export interface FactCheckPhase {
  name: string;
  description: string;
  status: "pending" | "active" | "completed" | "error";
  startTime?: number;
  endTime?: number;
  details?: string;
}

export interface FactCheckProgress {
  currentPhase: number;
  phases: FactCheckPhase[];
  overallProgress: number;
  timeElapsed: number;
  estimatedTimeRemaining?: number;
}

const FACT_CHECK_PHASES: Omit<
  FactCheckPhase,
  "status" | "startTime" | "endTime"
>[] = [
  {
    name: "Preprocessing",
    description: "AI-powered claim analysis and entity extraction",
    details:
      "Advanced entity extraction, keyword analysis, claim classification, urgency assessment, complexity analysis, and platform identification using AI assistance",
  },
  {
    name: "Discovery",
    description: "Massive parallel discovery across 19+ platforms",
    details:
      "Comprehensive search across Twitter, Facebook, Instagram, YouTube, TikTok, LinkedIn, Reddit, Quora, Pinterest, Bluesky, Telegram, Discord, WhatsApp, Google News, Reuters, AP News, BBC, academic sources, fact-checkers, and government sites",
  },
  {
    name: "Access & Extraction",
    description: "Enhanced content access and structured extraction",
    details:
      "Using Bright Data's web unlocker and scraping browser to access protected content, extract structured data, analyze credibility scores, and perform sentiment analysis",
  },
  {
    name: "Dynamic Interaction",
    description: "Advanced browser automation for social media",
    details:
      "Browser automation for dynamic content, social media interactions, screenshot capture, scroll actions, and enhanced data extraction from interactive platforms",
  },
  {
    name: "AI Analysis",
    description: "Gemini Pro AI-powered comprehensive analysis",
    details:
      "Advanced AI analysis using Gemini Pro to categorize evidence, assess credibility, analyze sentiment, generate timeline, evaluate social signals, calculate risk assessment, and produce final verdict with confidence scoring",
  },
];

export function useFactCheck() {
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState<FactCheckProgress>({
    currentPhase: 0,
    phases: FACT_CHECK_PHASES.map((phase) => ({ ...phase, status: "pending" })),
    overallProgress: 0,
    timeElapsed: 0,
  });
  const [startTime, setStartTime] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Submit fact check mutation
  const submitFactCheckMutation = useMutation({
    mutationFn: (claim: string) => {
      console.log("Submitting fact check for claim:", claim);
      return apiService.submitFactCheck(claim);
    },
    onSuccess: (data) => {
      console.log("Fact check submission successful:", data);
      if (data.status === "processing" && data.jobId) {
        setCurrentJobId(data.jobId);
        setStartTime(Date.now());
        setProgress((prev) => ({
          ...prev,
          currentPhase: 0,
          phases: prev.phases.map((phase, index) => ({
            ...phase,
            status: index === 0 ? "active" : "pending",
            startTime: index === 0 ? Date.now() : undefined,
          })),
          overallProgress: 0,
          timeElapsed: 0,
        }));
        toast.success("Fact check started! Analyzing your claim...");
      } else {
        console.error("Unexpected response format:", data);
        toast.error("Unexpected response from server");
      }
    },
    onError: (error) => {
      console.error("Fact check submission failed:", error);
      toast.error(`Failed to start fact check: ${error.message}`);
    },
  });

  // Job status query with polling
  const { data: jobStatus, error: jobError } = useQuery({
    queryKey: ["jobStatus", currentJobId],
    queryFn: () =>
      currentJobId ? apiService.getJobStatus(currentJobId) : null,
    enabled: !!currentJobId,
    refetchInterval: (query) => {
      // Stop polling if job is completed or failed
      const data = query.state.data;
      if (data?.data?.state === "completed" || data?.data?.state === "failed") {
        return false;
      }
      return 1000; // Poll every 1 second for better responsiveness
    },
    refetchIntervalInBackground: true,
  });

  // Update progress based on job status
  useEffect(() => {
    if (!jobStatus?.data || !startTime) return;

    const { state, progress: jobProgress, result } = jobStatus.data;
    const timeElapsed = Date.now() - startTime;

    console.log("Job status update:", { state, jobProgress, result });

    // Determine current phase based on progress
    let currentPhase = 0;
    if (jobProgress >= 20) currentPhase = 1;
    if (jobProgress >= 40) currentPhase = 2;
    if (jobProgress >= 60) currentPhase = 3;
    if (jobProgress >= 80) currentPhase = 4;

    // Update phases status
    const updatedPhases = FACT_CHECK_PHASES.map((phase, index) => {
      let status: FactCheckPhase["status"] = "pending";

      if (index < currentPhase) {
        status = "completed";
      } else if (index === currentPhase) {
        status = state === "failed" ? "error" : "active";
      }

      return {
        ...phase,
        status,
        startTime:
          index <= currentPhase ? startTime + index * 15000 : undefined,
        endTime:
          index < currentPhase ? startTime + (index + 1) * 15000 : undefined,
      };
    });

    // Calculate estimated time remaining
    const estimatedTotal = 90000; // 90 seconds
    const estimatedTimeRemaining = Math.max(0, estimatedTotal - timeElapsed);

    setProgress({
      currentPhase,
      phases: updatedPhases,
      overallProgress: jobProgress || 0,
      timeElapsed,
      estimatedTimeRemaining,
    });

    // Handle completion
    if (state === "completed") {
      console.log("Job completed, result:", result);
      setProgress((prev) => ({
        ...prev,
        phases: prev.phases.map((phase) => ({ ...phase, status: "completed" })),
        overallProgress: 100,
        currentPhase: FACT_CHECK_PHASES.length - 1,
      }));

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["factChecks"] });

      toast.success("Fact check completed!");
    } else if (state === "failed") {
      console.error("Job failed:", result);
      setProgress((prev) => ({
        ...prev,
        phases: prev.phases.map((phase, index) => ({
          ...phase,
          status: index === currentPhase ? "error" : phase.status,
        })),
      }));

      toast.error("Fact check failed. Please try again.");
    }
  }, [jobStatus, startTime, queryClient]);

  // Get fact check result when job is completed
  const { data: factCheckResult } = useQuery({
    queryKey: [
      "factCheck",
      jobStatus?.data?.result?.factCheckId || currentJobId,
    ],
    queryFn: async () => {
      // First try to get the factCheckId from the job result
      const factCheckId = jobStatus?.data?.result?.factCheckId;
      console.log("Fetching fact check result for ID:", factCheckId);

      if (factCheckId) {
        return apiService.getFactCheck(factCheckId);
      }

      // If no factCheckId in result, try to find the most recent fact check
      // This is a fallback for when the job result structure doesn't include factCheckId
      try {
        const recentFactChecks = await apiService.listFactChecks(1, 1);
        if (recentFactChecks.data && recentFactChecks.data.length > 0) {
          const mostRecent = recentFactChecks.data[0];
          console.log("Using most recent fact check:", mostRecent.id);
          return apiService.getFactCheck(mostRecent.id);
        }
      } catch (error) {
        console.error("Error fetching recent fact checks:", error);
      }

      return null;
    },
    enabled: jobStatus?.data?.state === "completed",
    retry: 3,
    retryDelay: 1000,
  });

  // Reset function
  const reset = useCallback(() => {
    setCurrentJobId(null);
    setStartTime(null);
    setProgress({
      currentPhase: 0,
      phases: FACT_CHECK_PHASES.map((phase) => ({
        ...phase,
        status: "pending",
      })),
      overallProgress: 0,
      timeElapsed: 0,
    });
  }, []);

  // Submit fact check function
  const submitFactCheck = useCallback(
    (claim: string) => {
      reset();
      submitFactCheckMutation.mutate(claim);
    },
    [submitFactCheckMutation, reset]
  );

  return {
    submitFactCheck,
    progress,
    isLoading:
      submitFactCheckMutation.isPending ||
      (!!currentJobId && jobStatus?.data?.state === "active"),
    isCompleted: jobStatus?.data?.state === "completed",
    isFailed: jobStatus?.data?.state === "failed",
    factCheckResult: factCheckResult?.data,
    error: submitFactCheckMutation.error || jobError,
    reset,
    jobId: currentJobId,
  };
}

// Hook for fetching fact check history
export function useFactCheckHistory(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["factChecks", page, limit],
    queryFn: async () => {
      console.log("Fetching fact check history:", { page, limit });
      try {
        const result = await apiService.listFactChecks(page, limit);
        console.log("Fact check history result:", result);
        return result;
      } catch (error) {
        console.error("Error fetching fact check history:", error);
        throw error;
      }
    },
    staleTime: 30000, // 30 seconds
    retry: 3,
    retryDelay: 1000,
  });
}
