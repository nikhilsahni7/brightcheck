import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Evidence, type FactCheck } from "@/lib/api";
import {
  AlertTriangle,
  BarChart3,
  Brain,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Globe,
  HelpCircle,
  MessageCircle,
  ThumbsDown,
  ThumbsUp,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";

interface FactCheckResultsProps {
  factCheck: FactCheck;
}

const getVerdictIcon = (verdict: string) => {
  switch (verdict) {
    case "TRUE":
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    case "FALSE":
      return <XCircle className="w-6 h-6 text-red-500" />;
    case "PARTIALLY_TRUE":
      return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
    case "MISLEADING":
      return <AlertTriangle className="w-6 h-6 text-orange-500" />;
    default:
      return <HelpCircle className="w-6 h-6 text-gray-500" />;
  }
};

const getVerdictColor = (verdict: string) => {
  switch (verdict) {
    case "TRUE":
      return "text-green-600 bg-green-50 border-green-200";
    case "FALSE":
      return "text-red-600 bg-red-50 border-red-200";
    case "PARTIALLY_TRUE":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "MISLEADING":
      return "text-orange-600 bg-orange-50 border-orange-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

const getRiskColor = (level: string) => {
  switch (level) {
    case "LOW":
      return "text-green-600 bg-green-100";
    case "MEDIUM":
      return "text-yellow-600 bg-yellow-100";
    case "HIGH":
      return "text-orange-600 bg-orange-100";
    case "CRITICAL":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const getSourceTypeIcon = (type: string) => {
  switch (type) {
    case "NEWS":
      return "📰";
    case "FACT_CHECK":
      return "✅";
    case "SOCIAL_MEDIA":
      return "📱";
    case "FORUM":
      return "💬";
    case "VIDEO":
      return "🎥";
    case "ACADEMIC":
      return "🎓";
    case "OFFICIAL":
      return "🏛️";
    default:
      return "🌐";
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function EvidenceCard({
  evidence,
  type,
}: {
  evidence: Evidence;
  type: "supporting" | "contradicting" | "neutral";
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Debug logging for entities (remove in production)
  if (process.env.NODE_ENV === "development") {
    console.log(
      "Evidence entities:",
      evidence.entities,
      "Type:",
      typeof evidence.entities,
      "IsArray:",
      Array.isArray(evidence.entities)
    );
    console.log(
      "Evidence keywords:",
      evidence.keywords,
      "Type:",
      typeof evidence.keywords,
      "IsArray:",
      Array.isArray(evidence.keywords)
    );
  }

  const typeColors = {
    supporting: "border-green-200 bg-green-50",
    contradicting: "border-red-200 bg-red-50",
    neutral: "border-gray-200 bg-gray-50",
  };

  return (
    <Card
      className={`${typeColors[type]} transition-all duration-200 hover:shadow-md`}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {getSourceTypeIcon(evidence.sourceType)}
              </span>
              <div>
                <h4 className="font-semibold text-sm">
                  {evidence.metadata.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {evidence.sourceName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {evidence.credibilityScore}/10
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(evidence.sourceUrl, "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <p className="text-sm text-gray-700">
            {isExpanded ? evidence.fullContent : evidence.snippet}
            {evidence.fullContent.length > evidence.snippet.length && (
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto ml-1"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <>
                    Show less <ChevronUp className="w-3 h-3 ml-1" />
                  </>
                ) : (
                  <>
                    Show more <ChevronDown className="w-3 h-3 ml-1" />
                  </>
                )}
              </Button>
            )}
          </p>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {evidence.author && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{evidence.author}</span>
              </div>
            )}
            {evidence.publishedDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(evidence.publishedDate)}</span>
              </div>
            )}
            {evidence.sentiment !== undefined && (
              <div className="flex items-center gap-1">
                {evidence.sentiment > 0 ? (
                  <ThumbsUp className="w-3 h-3 text-green-500" />
                ) : evidence.sentiment < 0 ? (
                  <ThumbsDown className="w-3 h-3 text-red-500" />
                ) : (
                  <MessageCircle className="w-3 h-3 text-gray-500" />
                )}
                <span>
                  Sentiment: {evidence.sentiment?.toFixed(2) || "Neutral"}
                </span>
              </div>
            )}
          </div>

          {/* Keywords and Entities */}
          {((Array.isArray(evidence.keywords) &&
            evidence.keywords.length > 0) ||
            (Array.isArray(evidence.entities) &&
              evidence.entities.length > 0)) && (
            <div className="space-y-2">
              {Array.isArray(evidence.keywords) &&
                evidence.keywords.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Keywords:{" "}
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {evidence.keywords.slice(0, 5).map((keyword, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              {Array.isArray(evidence.entities) &&
                evidence.entities.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Entities:{" "}
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {evidence.entities.slice(0, 3).map((entity, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {entity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function FactCheckResults({ factCheck }: FactCheckResultsProps) {
  // Handle both old and new data structures
  const evidence = factCheck.evidence || [];

  const supportingEvidence = evidence.filter((e) => (e.sentiment || 0) > 0.1);
  const contradictingEvidence = evidence.filter(
    (e) => (e.sentiment || 0) < -0.1
  );
  const neutralEvidence = evidence.filter(
    (e) => Math.abs(e.sentiment || 0) <= 0.1
  );

  return (
    <div className="space-y-6">
      {/* Main Verdict */}
      <Card className={`border-2 ${getVerdictColor(factCheck.verdict)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getVerdictIcon(factCheck.verdict)}
              <div>
                <CardTitle className="text-2xl">
                  {factCheck.verdict.replace("_", " ")}
                </CardTitle>
                <p className="text-sm opacity-80">
                  Confidence: {factCheck.confidence}%
                </p>
              </div>
            </div>
            <Badge className={getRiskColor(factCheck.riskLevel)}>
              {factCheck.riskLevel} RISK
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Claim Analyzed:</h3>
              <p className="text-sm bg-white/50 p-3 rounded-lg border">
                "{factCheck.claim}"
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Analysis Summary:</h3>
              <p className="text-sm">
                {factCheck.summary || factCheck.reasoning}
              </p>
              {factCheck.summary &&
                factCheck.reasoning &&
                factCheck.summary !== factCheck.reasoning && (
                  <div className="mt-2">
                    <h4 className="font-medium text-sm mb-1">
                      Detailed Reasoning:
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {factCheck.reasoning}
                    </p>
                  </div>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {factCheck.sources?.total || factCheck.evidenceCount}
                </div>
                <div className="text-xs text-muted-foreground">
                  Sources Analyzed
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {factCheck.sources?.highCredibility ||
                    factCheck.metadata?.averageCredibility?.toFixed(1) ||
                    "N/A"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {factCheck.sources?.highCredibility
                    ? "High Credibility"
                    : "Avg Credibility"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {factCheck.processingTime
                    ? Math.round(factCheck.processingTime / 1000)
                    : "N/A"}
                  s
                </div>
                <div className="text-xs text-muted-foreground">
                  Processing Time
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {factCheck.sources?.verified || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  Verified Sources
                </div>
              </div>
            </div>

            {/* Enhanced Social Signals */}
            {factCheck.socialSignals && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {factCheck.socialSignals.totalEngagement.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Engagement
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {factCheck.socialSignals.sentiment}
                  </div>
                  <div className="text-xs text-muted-foreground">Sentiment</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {Math.round(factCheck.socialSignals.viralityScore)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Virality Score
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {factCheck.socialSignals.influencerMentions}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Influencer Mentions
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Evidence Analysis */}
      <Tabs defaultValue="evidence" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="evidence">
            Evidence ({factCheck.evidenceCount})
          </TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="methodology">Methodology</TabsTrigger>
        </TabsList>

        <TabsContent value="evidence" className="space-y-6">
          {/* Evidence Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Evidence Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {supportingEvidence.length}
                  </div>
                  <div className="text-sm text-green-600">Supporting</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {contradictingEvidence.length}
                  </div>
                  <div className="text-sm text-red-600">Contradicting</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    {neutralEvidence.length}
                  </div>
                  <div className="text-sm text-gray-600">Neutral</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supporting Evidence */}
          {supportingEvidence.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Supporting Evidence ({supportingEvidence.length})
              </h3>
              <div className="space-y-4">
                {supportingEvidence.map((evidence) => (
                  <EvidenceCard
                    key={evidence.id}
                    evidence={evidence}
                    type="supporting"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Contradicting Evidence */}
          {contradictingEvidence.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                Contradicting Evidence ({contradictingEvidence.length})
              </h3>
              <div className="space-y-4">
                {contradictingEvidence.map((evidence) => (
                  <EvidenceCard
                    key={evidence.id}
                    evidence={evidence}
                    type="contradicting"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Neutral Evidence */}
          {neutralEvidence.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-gray-500" />
                Neutral Evidence ({neutralEvidence.length})
              </h3>
              <div className="space-y-4">
                {neutralEvidence.map((evidence) => (
                  <EvidenceCard
                    key={evidence.id}
                    evidence={evidence}
                    type="neutral"
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Source Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Source Types */}
                <div>
                  <h4 className="font-semibold mb-3">Sources by Type</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(
                      evidence.reduce(
                        (acc, evidenceItem) => {
                          acc[evidenceItem.sourceType] =
                            (acc[evidenceItem.sourceType] || 0) + 1;
                          return acc;
                        },
                        {} as Record<string, number>
                      )
                    ).map(([type, count]) => (
                      <div
                        key={type}
                        className="text-center p-3 bg-muted rounded-lg"
                      >
                        <div className="text-lg">{getSourceTypeIcon(type)}</div>
                        <div className="font-semibold">{count}</div>
                        <div className="text-xs text-muted-foreground">
                          {type.replace("_", " ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Credibility Distribution */}
                <div>
                  <h4 className="font-semibold mb-3">
                    Credibility Distribution
                  </h4>
                  <div className="space-y-2">
                    {[
                      {
                        range: "9-10",
                        label: "Excellent",
                        color: "bg-green-500",
                      },
                      { range: "7-8", label: "Good", color: "bg-blue-500" },
                      { range: "5-6", label: "Fair", color: "bg-yellow-500" },
                      { range: "0-4", label: "Poor", color: "bg-red-500" },
                    ].map(({ range, label, color }) => {
                      const [min, max] = range.split("-").map(Number);
                      const count = evidence.filter(
                        (e) =>
                          e.credibilityScore >= min && e.credibilityScore <= max
                      ).length;
                      const percentage =
                        (count / factCheck.evidenceCount) * 100;

                      return (
                        <div key={range} className="flex items-center gap-3">
                          <div className="w-20 text-sm">{label}</div>
                          <div className="flex-1">
                            <Progress value={percentage} className="h-2" />
                          </div>
                          <div className="w-12 text-sm text-right">{count}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Publication Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Key Events from MCP Timeline */}
                {factCheck.timeline?.keyEvents &&
                  factCheck.timeline.keyEvents.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Key Events Timeline
                      </h4>
                      <div className="space-y-3">
                        {factCheck.timeline.keyEvents.map((event, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800"
                          >
                            <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-sm">
                                  {event.event}
                                </h4>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(event.date)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {event.source}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Timeline Range */}
                {factCheck.timeline && (
                  <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">Earliest: </span>
                        <span className="text-muted-foreground">
                          {factCheck.timeline.earliest
                            ? formatDate(factCheck.timeline.earliest)
                            : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Latest: </span>
                        <span className="text-muted-foreground">
                          {factCheck.timeline.latest
                            ? formatDate(factCheck.timeline.latest)
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Evidence Timeline */}
                <h4 className="font-semibold mb-3">Evidence Timeline</h4>
                {evidence
                  .filter((e) => e.publishedDate)
                  .sort(
                    (a, b) =>
                      new Date(b.publishedDate!).getTime() -
                      new Date(a.publishedDate!).getTime()
                  )
                  .slice(0, 10)
                  .map((evidenceItem, index) => (
                    <div
                      key={evidenceItem.id}
                      className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">
                            {evidenceItem.metadata.title}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(evidenceItem.publishedDate!)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {evidenceItem.sourceName}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methodology" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                BrightCheck Methodology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {factCheck.methodology ||
                    `BrightCheck employed Bright Data's comprehensive MCP server to analyze ${factCheck.sources?.total || factCheck.evidenceCount} pieces of evidence across ${factCheck.sources?.byPlatform ? Object.keys(factCheck.sources.byPlatform).length : "19+"} platforms including Twitter, Facebook, Instagram, YouTube, TikTok, LinkedIn, Reddit, Quora, Pinterest, Bluesky, Telegram, Discord, WhatsApp, and traditional news sources. The system used advanced AI analysis, credibility scoring, sentiment analysis, and cross-platform verification to deliver this comprehensive fact-check result in under 90 seconds.`}
                </p>

                {/* Platform Breakdown */}
                {factCheck.sources?.byPlatform && (
                  <div>
                    <h4 className="font-semibold mb-2">Platform Coverage</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(factCheck.sources.byPlatform).map(
                        ([platform, count]) => (
                          <div
                            key={platform}
                            className="flex justify-between items-center p-2 bg-muted/50 rounded"
                          >
                            <span className="text-sm">{platform}</span>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Risk Assessment */}
                {factCheck.riskAssessment && (
                  <div>
                    <h4 className="font-semibold mb-2">Risk Assessment</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={getRiskColor(
                            factCheck.riskAssessment.level
                          )}
                        >
                          {factCheck.riskAssessment.level} RISK
                        </Badge>
                      </div>
                      {factCheck.riskAssessment.factors.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-1">
                            Risk Factors:
                          </h5>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {factCheck.riskAssessment.factors.map(
                              (factor, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-red-500 mt-1">•</span>
                                  <span>{factor}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      {factCheck.riskAssessment.recommendations.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-1">
                            Recommendations:
                          </h5>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {factCheck.riskAssessment.recommendations.map(
                              (rec, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-blue-500 mt-1">•</span>
                                  <span>{rec}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Analysis Phases</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• AI-powered claim preprocessing</li>
                      <li>• Multi-platform source discovery</li>
                      <li>• Content access and extraction</li>
                      <li>• Dynamic interaction analysis</li>
                      <li>• Gemini Pro AI final analysis</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Quality Metrics</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Source credibility scoring (0-10)</li>
                      <li>• Sentiment analysis (-1 to +1)</li>
                      <li>• Cross-platform verification</li>
                      <li>• Temporal consistency checking</li>
                      <li>• Entity and keyword extraction</li>
                    </ul>
                  </div>
                </div>

                <Separator />

                <div className="text-xs text-muted-foreground">
                  <p>
                    <strong>Processing Time:</strong>{" "}
                    {factCheck.processingTime
                      ? Math.round(factCheck.processingTime / 1000)
                      : "N/A"}{" "}
                    seconds
                  </p>
                  <p>
                    <strong>Analysis Completed:</strong>{" "}
                    {formatDate(factCheck.updatedAt)}
                  </p>
                  <p>
                    <strong>BrightCheck Version:</strong>{" "}
                    {factCheck.metadata?.brightCheckVersion ||
                      "v2.0-MCP-Enhanced"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
