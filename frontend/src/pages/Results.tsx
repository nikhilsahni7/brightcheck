import { ConnectionStatus } from "@/components/connection-status";
import { FactCheckProgress } from "@/components/fact-check-progress";
import { FactCheckResults } from "@/components/fact-check-results";
import { Navbar } from "@/components/navbar";
import { SearchBar } from "@/components/search-bar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFactCheck } from "@/hooks/useFactCheck";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Home,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Results = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentClaim, setCurrentClaim] = useState("");

  const claim = searchParams.get("claim") || "";
  const {
    submitFactCheck,
    progress,
    isLoading,
    isCompleted,
    isFailed,
    factCheckResult,
    error,
    reset,
  } = useFactCheck();

  // Initialize fact check when claim is provided
  useEffect(() => {
    if (claim && claim !== currentClaim) {
      console.log("New claim detected, starting fact check:", claim);
      setCurrentClaim(claim);

      // Reset any previous state and start new fact check
      reset();

      // Start the fact check after a small delay to ensure reset is complete
      setTimeout(() => {
        console.log("Submitting fact check for:", claim);
        submitFactCheck(claim);
      }, 100);
    }
  }, [claim, currentClaim, submitFactCheck, reset]);

  // Handle new fact check from search bar
  const handleNewFactCheck = (newClaim: string) => {
    console.log("Handling new fact check:", newClaim);
    reset(); // Reset previous state first
    setCurrentClaim(newClaim);
    setSearchParams({ claim: newClaim });
    // Start the fact check immediately
    setTimeout(() => {
      submitFactCheck(newClaim);
    }, 100); // Small delay to ensure reset is complete
  };

  // Redirect to home if no claim
  useEffect(() => {
    if (!claim) {
      navigate("/");
    }
  }, [claim, navigate]);

  const handleRetry = () => {
    reset();
    if (claim) {
      submitFactCheck(claim);
    }
  };

  const handleGoHome = () => {
    reset();
    navigate("/");
  };

  if (!claim) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        {/* Header with navigation and search */}
        <div className="space-y-6">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleGoHome}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>

            <div className="flex items-center gap-4">
              <ConnectionStatus />
              {(isCompleted || isFailed) && (
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Analysis
                </Button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full">
            <SearchBar fullWidth={true} onFactCheckStart={handleNewFactCheck} />
          </div>

          {/* Error State */}
          {isFailed && error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>Failed to complete fact check: {error.message}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="mt-2"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Loading/Progress State */}
          {isLoading && (
            <div className="space-y-6">
              <FactCheckProgress
                progress={progress}
                isLoading={isLoading}
                claim={claim}
              />
            </div>
          )}

          {/* Completed State */}
          {isCompleted && factCheckResult && (
            <div className="space-y-6">
              {/* Success Alert */}
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Fact check completed successfully! Analysis took{" "}
                  {Math.round(progress.timeElapsed / 1000)} seconds.
                </AlertDescription>
              </Alert>

              {/* Results */}
              <FactCheckResults factCheck={factCheckResult} />
            </div>
          )}

          {/* Initial State - No active fact check */}
          {!isLoading && !isCompleted && !isFailed && claim && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-6 h-6" />
                  Ready to Analyze
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">Claim: "{claim}"</p>
                  <p className="text-sm text-muted-foreground">
                    Click "Verify" in the search bar above to start the
                    fact-checking process, or enter a new claim to analyze.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => submitFactCheck(claim)}>
                      Start Analysis
                    </Button>
                    <Button variant="outline" onClick={handleGoHome}>
                      <Home className="w-4 h-4 mr-2" />
                      Go Home
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Information Card */}
          {!isLoading && (
            <Card className="bg-muted/30">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary mb-2">
                      19+
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Platforms Analyzed
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Twitter, Facebook, Instagram, YouTube, TikTok, LinkedIn,
                      Reddit, News Sites, and more
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary mb-2">
                      90s
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Max Processing Time
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Comprehensive analysis across all sources
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary mb-2">
                      AI
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Powered Analysis
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Gemini Pro AI for final verdict generation
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Results;
