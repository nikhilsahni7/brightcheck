const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Health check URL
const HEALTH_CHECK_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000";

export interface FactCheckRequest {
  claim: string;
}

export interface FactCheckResponse {
  status: "processing" | "success" | "error";
  message?: string;
  jobId?: string;
  data?: FactCheck;
}

export interface JobStatusResponse {
  status: "success" | "error";
  data: {
    jobId: string;
    state:
      | "waiting"
      | "active"
      | "completed"
      | "failed"
      | "delayed"
      | "stalled";
    progress: number;
    data: Record<string, unknown>;
    result?: {
      factCheckId?: string;
      [key: string]: unknown;
    };
  };
}

export interface Evidence {
  id: string;
  sourceUrl: string;
  sourceName: string;
  sourceType:
    | "NEWS"
    | "FACT_CHECK"
    | "SOCIAL_MEDIA"
    | "FORUM"
    | "VIDEO"
    | "ACADEMIC"
    | "WEB"
    | "OFFICIAL"
    | "BLOG"
    | "OTHER";
  snippet: string;
  fullContent: string;
  author?: string;
  publishedDate?: string;
  credibilityScore: number;
  sentiment?: number;
  entities: string[];
  keywords: string[];
  claims: string[];
  metadata: {
    title: string;
    type: string;
    extractionTimestamp: string;
    processingOrder: number;
  };
  platform?: string;
  verified?: boolean;
  engagement?: {
    likes?: number;
    shares?: number;
    comments?: number;
    views?: number;
  };
}

export interface FactCheck {
  id: string;
  claim: string;
  verdict: "TRUE" | "FALSE" | "PARTIALLY_TRUE" | "MISLEADING" | "UNVERIFIED";
  confidence: number;
  reasoning: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  evidenceCount: number;
  processingTime?: number;
  createdAt: string;
  updatedAt: string;
  evidence: Evidence[];
  metadata?: {
    processingTimestamp: string;
    brightCheckVersion: string;
    totalSources: number;
    supportingEvidence: number;
    contradictingEvidence: number;
    neutralEvidence: number;
    averageCredibility: number;
  };
  // Enhanced fields from MCP service
  summary?: string;
  sources?: {
    total: number;
    byPlatform: { [platform: string]: number };
    highCredibility: number;
    verified: number;
  };
  timeline?: {
    earliest: string;
    latest: string;
    keyEvents: Array<{
      date: string;
      event: string;
      source: string;
    }>;
  };
  socialSignals?: {
    totalEngagement: number;
    sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED";
    viralityScore: number;
    influencerMentions: number;
  };
  riskAssessment?: {
    level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    factors: string[];
    recommendations: string[];
  };
  methodology?: string;
}

export interface FactCheckResult {
  verdict: "TRUE" | "FALSE" | "PARTIALLY_TRUE" | "MISLEADING" | "UNVERIFIED";
  confidence: number;
  summary: string;
  reasoning: string;
  evidence: {
    supporting: Evidence[];
    contradicting: Evidence[];
    neutral: Evidence[];
  };
  sources: {
    total: number;
    byPlatform: { [platform: string]: number };
    highCredibility: number;
    verified: number;
  };
  timeline: {
    earliest: string;
    latest: string;
    keyEvents: Array<{
      date: string;
      event: string;
      source: string;
    }>;
  };
  socialSignals: {
    totalEngagement: number;
    sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED";
    viralityScore: number;
    influencerMentions: number;
  };
  riskAssessment: {
    level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    factors: string[];
    recommendations: string[];
  };
  processingTime: number;
  methodology: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      credentials: "include", // Include credentials for CORS
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }

        // Handle specific error cases
        if (response.status === 404) {
          throw new Error(
            "API endpoint not found. Please check if the backend is running."
          );
        } else if (response.status === 500) {
          throw new Error("Internal server error. Please try again later.");
        } else if (response.status === 0 || !response.status) {
          throw new Error(
            "Network error. Please check your connection and ensure the backend is running."
          );
        }

        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);

      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to the backend. Please ensure the server is running on http://localhost:3000"
        );
      }

      throw error;
    }
  }

  // Submit a new fact check
  async submitFactCheck(claim: string): Promise<FactCheckResponse> {
    return this.request<FactCheckResponse>("/fact-checks", {
      method: "POST",
      body: JSON.stringify({ claim }),
    });
  }

  // Get job status
  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    return this.request<JobStatusResponse>(`/fact-checks/job/${jobId}`);
  }

  // Get fact check by ID
  async getFactCheck(id: string): Promise<FactCheckResponse> {
    return this.request<FactCheckResponse>(`/fact-checks/${id}`);
  }

  // List all fact checks with pagination
  async listFactChecks(
    page = 1,
    limit = 10
  ): Promise<{
    status: "success";
    data: FactCheck[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    return this.request(`/fact-checks?page=${page}&limit=${limit}`);
  }

  // Health check
  async healthCheck(): Promise<{
    status: string;
    message: string;
    timestamp: string;
  }> {
    // Use the health endpoint under /api
    return this.request("/health");
  }

  // Transform MCP service result to frontend format
  transformMcpResult(mcpResult: FactCheckResult): FactCheck {
    const now = new Date().toISOString();

    // Convert evidence format
    const evidence: Evidence[] = [
      ...mcpResult.evidence.supporting.map((e, index) => ({
        id: `supporting-${index}`,
        sourceUrl: e.sourceUrl || "#",
        sourceName: e.sourceName || "Unknown Source",
        sourceType: e.sourceType || ("WEB" as const),
        snippet: e.snippet || "",
        fullContent: e.fullContent || e.snippet || "",
        author: e.author,
        publishedDate: e.publishedDate,
        credibilityScore: e.credibilityScore || 5,
        sentiment: e.sentiment || 0.5,
        entities: e.entities || [],
        keywords: e.keywords || [],
        claims: e.claims || [],
        metadata: e.metadata || {
          title: e.sourceName || "Unknown",
          type: e.sourceType || "WEB",
          extractionTimestamp: now,
          processingOrder: index,
        },
        platform: e.platform,
        verified: e.verified,
        engagement: e.engagement,
      })),
      ...mcpResult.evidence.contradicting.map((e, index) => ({
        id: `contradicting-${index}`,
        sourceUrl: e.sourceUrl || "#",
        sourceName: e.sourceName || "Unknown Source",
        sourceType: e.sourceType || ("WEB" as const),
        snippet: e.snippet || "",
        fullContent: e.fullContent || e.snippet || "",
        author: e.author,
        publishedDate: e.publishedDate,
        credibilityScore: e.credibilityScore || 5,
        sentiment: e.sentiment || -0.5,
        entities: e.entities || [],
        keywords: e.keywords || [],
        claims: e.claims || [],
        metadata: e.metadata || {
          title: e.sourceName || "Unknown",
          type: e.sourceType || "WEB",
          extractionTimestamp: now,
          processingOrder: index,
        },
        platform: e.platform,
        verified: e.verified,
        engagement: e.engagement,
      })),
      ...mcpResult.evidence.neutral.map((e, index) => ({
        id: `neutral-${index}`,
        sourceUrl: e.sourceUrl || "#",
        sourceName: e.sourceName || "Unknown Source",
        sourceType: e.sourceType || ("WEB" as const),
        snippet: e.snippet || "",
        fullContent: e.fullContent || e.snippet || "",
        author: e.author,
        publishedDate: e.publishedDate,
        credibilityScore: e.credibilityScore || 5,
        sentiment: e.sentiment || 0,
        entities: e.entities || [],
        keywords: e.keywords || [],
        claims: e.claims || [],
        metadata: e.metadata || {
          title: e.sourceName || "Unknown",
          type: e.sourceType || "WEB",
          extractionTimestamp: now,
          processingOrder: index,
        },
        platform: e.platform,
        verified: e.verified,
        engagement: e.engagement,
      })),
    ];

    return {
      id: `fact-check-${Date.now()}`,
      claim: "Analyzed claim", // This should come from the request
      verdict: mcpResult.verdict,
      confidence: mcpResult.confidence,
      reasoning: mcpResult.reasoning,
      riskLevel: mcpResult.riskAssessment.level,
      evidenceCount: evidence.length,
      processingTime: mcpResult.processingTime,
      createdAt: now,
      updatedAt: now,
      evidence,
      summary: mcpResult.summary,
      sources: mcpResult.sources,
      timeline: mcpResult.timeline,
      socialSignals: mcpResult.socialSignals,
      riskAssessment: mcpResult.riskAssessment,
      methodology: mcpResult.methodology,
      metadata: {
        processingTimestamp: now,
        brightCheckVersion: "v2.0-MCP-Enhanced",
        totalSources: evidence.length,
        supportingEvidence: mcpResult.evidence.supporting.length,
        contradictingEvidence: mcpResult.evidence.contradicting.length,
        neutralEvidence: mcpResult.evidence.neutral.length,
        averageCredibility:
          evidence.reduce((sum, e) => sum + e.credibilityScore, 0) /
          evidence.length,
      },
    };
  }
}

export const apiService = new ApiService();
export default apiService;
