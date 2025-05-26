import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  type FactCheckPhase,
  type FactCheckProgress,
} from "@/hooks/useFactCheck";
import {
  AlertCircle,
  Brain,
  CheckCircle,
  Clock,
  Download,
  Globe,
  Loader2,
  Search,
  Timer,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

interface FactCheckProgressProps {
  progress: FactCheckProgress;
  isLoading: boolean;
  claim: string;
}

const phaseIcons = {
  0: Search,
  1: Globe,
  2: Download,
  3: Zap,
  4: Brain,
};

const formatTime = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

const getStatusIcon = (status: FactCheckPhase["status"]) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case "active":
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    case "error":
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    default:
      return <Clock className="w-5 h-5 text-gray-400" />;
  }
};

const getStatusColor = (status: FactCheckPhase["status"]) => {
  switch (status) {
    case "completed":
      return "bg-green-500";
    case "active":
      return "bg-blue-500";
    case "error":
      return "bg-red-500";
    default:
      return "bg-gray-300";
  }
};

export function FactCheckProgress({
  progress,
  isLoading,
  claim,
}: FactCheckProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Animate progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress.overallProgress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress.overallProgress]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            BrightCheck AI Agent Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Analyzing: "
            {claim.length > 100 ? claim.substring(0, 100) + "..." : claim}"
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(animatedProgress)}%
                </span>
              </div>
              <Progress value={animatedProgress} className="h-2" />
            </div>

            {/* Time Information */}
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                <span>Time Elapsed: {formatTime(progress.timeElapsed)}</span>
              </div>
              {progress.estimatedTimeRemaining &&
                progress.estimatedTimeRemaining > 0 && (
                  <span className="text-muted-foreground">
                    Est. {formatTime(progress.estimatedTimeRemaining)} remaining
                  </span>
                )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phases */}
      <div className="space-y-4">
        {progress.phases.map((phase, index) => {
          const PhaseIcon = phaseIcons[index as keyof typeof phaseIcons];
          const isActive = index === progress.currentPhase;
          const isCompleted = phase.status === "completed";
          const isError = phase.status === "error";

          return (
            <Card
              key={index}
              className={`transition-all duration-500 ${
                isActive ? "ring-2 ring-primary ring-offset-2 shadow-lg" : ""
              } ${isCompleted ? "bg-green-50 dark:bg-green-950/20" : ""} ${
                isError ? "bg-red-50 dark:bg-red-950/20" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Phase Icon */}
                  <div
                    className={`p-2 rounded-full ${getStatusColor(phase.status)} bg-opacity-10`}
                  >
                    <PhaseIcon
                      className={`w-5 h-5 ${
                        isCompleted
                          ? "text-green-600"
                          : isActive
                            ? "text-primary"
                            : isError
                              ? "text-red-600"
                              : "text-gray-400"
                      }`}
                    />
                  </div>

                  {/* Phase Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{phase.name}</h3>
                        <Badge
                          variant={
                            isCompleted
                              ? "default"
                              : isActive
                                ? "secondary"
                                : isError
                                  ? "destructive"
                                  : "outline"
                          }
                        >
                          {phase.status}
                        </Badge>
                      </div>
                      {getStatusIcon(phase.status)}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {phase.description}
                    </p>

                    {/* Phase Details */}
                    {(isActive || isCompleted) && phase.details && (
                      <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          {phase.details}
                        </p>
                      </div>
                    )}

                    {/* Phase Timing */}
                    {phase.startTime && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {phase.startTime && (
                          <span>
                            Started: {formatTime(Date.now() - phase.startTime)}{" "}
                            ago
                          </span>
                        )}
                        {phase.endTime && phase.startTime && (
                          <span>
                            Duration:{" "}
                            {formatTime(phase.endTime - phase.startTime)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Active Phase Progress */}
                    {isActive && isLoading && (
                      <div className="mt-2">
                        <Progress
                          value={((index + 1) / progress.phases.length) * 100}
                          className="h-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sources Being Searched */}
      {progress.currentPhase === 1 && isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Sources Being Analyzed (19+ Platforms)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Comprehensive parallel discovery across multiple platforms and
              sources
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Social Media Platforms */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-blue-600">
                  Social Media Platforms
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { name: "Twitter", icon: "🐦" },
                    { name: "Facebook", icon: "📘" },
                    { name: "Instagram", icon: "📸" },
                    { name: "TikTok", icon: "🎵" },
                    { name: "LinkedIn", icon: "💼" },
                    { name: "Reddit", icon: "🤖" },
                    { name: "Quora", icon: "❓" },
                    { name: "Pinterest", icon: "📌" },
                    { name: "Bluesky", icon: "🦋" },
                    { name: "Telegram", icon: "📱" },
                    { name: "Discord", icon: "🎮" },
                    { name: "WhatsApp", icon: "💬" },
                  ].map((source, index) => (
                    <div
                      key={source.name}
                      className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg animate-pulse border border-blue-200 dark:border-blue-800"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <span className="text-lg">{source.icon}</span>
                      <span className="text-xs font-medium">{source.name}</span>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping ml-auto" />
                    </div>
                  ))}
                </div>
              </div>

              {/* News & Media */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-green-600">
                  News & Media Sources
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { name: "Google News", icon: "📰" },
                    { name: "Reuters", icon: "📊" },
                    { name: "AP News", icon: "📡" },
                    { name: "BBC", icon: "🏛️" },
                    { name: "CNN", icon: "📺" },
                    { name: "The Guardian", icon: "📰" },
                  ].map((source, index) => (
                    <div
                      key={source.name}
                      className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded-lg animate-pulse border border-green-200 dark:border-green-800"
                      style={{ animationDelay: `${(index + 12) * 150}ms` }}
                    >
                      <span className="text-lg">{source.icon}</span>
                      <span className="text-xs font-medium">{source.name}</span>
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping ml-auto" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Academic & Official */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-purple-600">
                  Academic & Official Sources
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { name: "Google Scholar", icon: "🎓" },
                    { name: "Government Sites", icon: "🏛️" },
                    { name: "Fact Checkers", icon: "✅" },
                    { name: "WHO/CDC", icon: "🏥" },
                    { name: "Research Papers", icon: "📄" },
                    { name: "Expert Networks", icon: "👨‍🔬" },
                  ].map((source, index) => (
                    <div
                      key={source.name}
                      className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg animate-pulse border border-purple-200 dark:border-purple-800"
                      style={{ animationDelay: `${(index + 18) * 150}ms` }}
                    >
                      <span className="text-lg">{source.icon}</span>
                      <span className="text-xs font-medium">{source.name}</span>
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping ml-auto" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis Details */}
      {progress.currentPhase === 4 && isLoading && (
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-purple/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary animate-pulse" />
              Gemini Pro AI Analysis
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Advanced AI-powered comprehensive analysis and verdict generation
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span>
                      Categorizing evidence (supporting/contradicting/neutral)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                    <span>
                      Analyzing source credibility and verification status
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
                    <span>Performing sentiment analysis across platforms</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                    <span>Generating publication timeline and key events</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                    <span>Evaluating social signals and virality score</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    <span>Calculating risk assessment and recommendations</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Brain className="w-4 h-4 text-primary animate-pulse" />
                  <span>
                    Generating final verdict with confidence scoring...
                  </span>
                </div>
                <div className="mt-2 bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                    <span>
                      AI model processing{" "}
                      {progress.timeElapsed > 60000 ? "complex" : "standard"}{" "}
                      analysis...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
