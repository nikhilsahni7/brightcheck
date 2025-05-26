import { Navbar } from "@/components/navbar";
import { SearchBar } from "@/components/search-bar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFactCheckHistory } from "@/hooks/useFactCheck";
import { type FactCheck } from "@/lib/api";
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const getVerdictIcon = (verdict: string) => {
  switch (verdict) {
    case "TRUE":
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case "FALSE":
      return <XCircle className="w-5 h-5 text-red-500" />;
    case "PARTIALLY_TRUE":
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case "MISLEADING":
      return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    default:
      return <Clock className="w-5 h-5 text-gray-500" />;
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInHours < 48) return "Yesterday";
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

function FactCheckCard({ factCheck }: { factCheck: FactCheck }) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/results?claim=${encodeURIComponent(factCheck.claim)}`);
  };

  return (
    <Card
      className="hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={handleViewDetails}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getVerdictIcon(factCheck.verdict)}
            <Badge className={getRiskColor(factCheck.riskLevel)}>
              {factCheck.riskLevel} RISK
            </Badge>
          </div>
          <Badge variant="outline" className="text-xs">
            {factCheck.confidence}% confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {factCheck.claim}
          </h3>
          <div
            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getVerdictColor(factCheck.verdict)}`}
          >
            {factCheck.verdict.replace("_", " ")}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              <span>{factCheck.evidenceCount} sources</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDate(factCheck.createdAt)}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Eye className="w-3 h-3" />
          </Button>
        </div>

        {factCheck.processingTime && (
          <div className="text-xs text-muted-foreground">
            Processed in {Math.round(factCheck.processingTime / 1000)}s
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const History = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredHistory, setFilteredHistory] = useState<FactCheck[]>([]);

  const {
    data: historyData,
    isLoading,
    error,
    refetch,
  } = useFactCheckHistory(currentPage, 12);

  // Filter history based on search term and verdict filter
  useEffect(() => {
    if (!historyData?.data) {
      setFilteredHistory([]);
      return;
    }

    let filtered = historyData.data;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.claim.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by verdict
    if (selectedFilter !== "all") {
      filtered = filtered.filter((item) => item.verdict === selectedFilter);
    }

    setFilteredHistory(filtered);
  }, [searchTerm, selectedFilter, historyData]);

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handleNewFactCheck = (claim: string) => {
    // Navigate to results page with the new claim
    window.location.href = `/results?claim=${encodeURIComponent(claim)}`;
  };

  const getFilterCounts = () => {
    if (!historyData?.data)
      return {
        all: 0,
        TRUE: 0,
        FALSE: 0,
        PARTIALLY_TRUE: 0,
        MISLEADING: 0,
        UNVERIFIED: 0,
      };

    const counts = historyData.data.reduce(
      (acc, item) => {
        acc.all++;
        acc[item.verdict as keyof typeof acc]++;
        return acc;
      },
      {
        all: 0,
        TRUE: 0,
        FALSE: 0,
        PARTIALLY_TRUE: 0,
        MISLEADING: 0,
        UNVERIFIED: 0,
      }
    );

    return counts;
  };

  const filterCounts = getFilterCounts();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Fact Check History</h1>
              <p className="text-muted-foreground">
                Review your previous fact checks and their verdicts
              </p>
            </div>

            <div className="w-full md:w-auto">
              <SearchBar
                fullWidth={false}
                onFactCheckStart={handleNewFactCheck}
              />
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search your fact checks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>Failed to load fact check history: {error.message}</p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Loading your fact check history...
                </p>
              </div>
            </div>
          )}

          {/* Content */}
          {!isLoading && historyData && (
            <Tabs
              value={selectedFilter}
              onValueChange={setSelectedFilter}
              className="w-full"
            >
              <TabsList className="w-full md:w-auto justify-start overflow-auto">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>All ({filterCounts.all})</span>
                </TabsTrigger>
                <TabsTrigger value="TRUE" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>True ({filterCounts.TRUE})</span>
                </TabsTrigger>
                <TabsTrigger value="FALSE" className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span>False ({filterCounts.FALSE})</span>
                </TabsTrigger>
                <TabsTrigger
                  value="PARTIALLY_TRUE"
                  className="flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span>Partial ({filterCounts.PARTIALLY_TRUE})</span>
                </TabsTrigger>
                <TabsTrigger
                  value="MISLEADING"
                  className="flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span>Misleading ({filterCounts.MISLEADING})</span>
                </TabsTrigger>
                <TabsTrigger
                  value="UNVERIFIED"
                  className="flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-gray-500" />
                  <span>Unverified ({filterCounts.UNVERIFIED})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedFilter} className="mt-6">
                {filteredHistory.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredHistory.map((factCheck) => (
                        <FactCheckCard
                          key={factCheck.id}
                          factCheck={factCheck}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {historyData.pagination &&
                      historyData.pagination.pages > currentPage && (
                        <div className="text-center">
                          <Button variant="outline" onClick={handleLoadMore}>
                            Load More (
                            {historyData.pagination.total -
                              filteredHistory.length}{" "}
                            remaining)
                          </Button>
                        </div>
                      )}

                    {/* Stats */}
                    <Card className="bg-muted/30">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-primary">
                              {historyData.pagination?.total || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Total Checks
                            </div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-600">
                              {filterCounts.TRUE}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Verified True
                            </div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-red-600">
                              {filterCounts.FALSE}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Proven False
                            </div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-yellow-600">
                              {filterCounts.PARTIALLY_TRUE +
                                filterCounts.MISLEADING}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Needs Context
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {searchTerm
                          ? "No matching fact checks found"
                          : "No fact checks yet"}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm
                          ? "Try adjusting your search terms or filters"
                          : "Start fact-checking claims to see your history here"}
                      </p>
                      {!searchTerm && (
                        <SearchBar
                          fullWidth={false}
                          onFactCheckStart={handleNewFactCheck}
                        />
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
};

export default History;
