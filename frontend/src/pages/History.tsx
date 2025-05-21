
import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { CheckHistoryCard, HistoryItem } from "@/components/check-history-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchBar } from "@/components/search-bar";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

// Mock history data
const MOCK_HISTORY: HistoryItem[] = [
  {
    id: "1",
    claim: "Did Pak Airforce destroy 2 Indian Rafale jets?",
    verdict: "FALSE",
    confidenceScore: 89,
    date: "2 hours ago"
  },
  {
    id: "2",
    claim: "Is Twitter planning to charge users $20/month?",
    verdict: "UNVERIFIED",
    confidenceScore: 60,
    date: "Yesterday"
  },
  {
    id: "3",
    claim: "Has NASA confirmed water on Mars?",
    verdict: "TRUE",
    confidenceScore: 95,
    date: "3 days ago"
  },
  {
    id: "4",
    claim: "Did the WHO announce a new pandemic?",
    verdict: "FALSE",
    confidenceScore: 92,
    date: "1 week ago"
  },
  {
    id: "5",
    claim: "Is Apple releasing a new iPhone model next month?",
    verdict: "UNVERIFIED",
    confidenceScore: 55,
    date: "1 week ago"
  },
  {
    id: "6",
    claim: "Has the European Union banned gas cars starting 2025?",
    verdict: "FALSE",
    confidenceScore: 87,
    date: "2 weeks ago"
  },
  {
    id: "7",
    claim: "Did scientists discover a new species of dinosaur in Argentina?",
    verdict: "TRUE",
    confidenceScore: 91,
    date: "3 weeks ago"
  },
  {
    id: "8",
    claim: "Is the government planning to implement a four-day work week?",
    verdict: "UNVERIFIED",
    confidenceScore: 48,
    date: "1 month ago"
  },
];

const History = () => {
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>(MOCK_HISTORY);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  
  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredHistory(MOCK_HISTORY);
    } else {
      setFilteredHistory(
        MOCK_HISTORY.filter((item) => item.verdict === activeFilter)
      );
    }
  }, [activeFilter]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Fact Check History</h1>
            <p className="text-muted-foreground">
              Review your previous fact checks and their verdicts
            </p>
          </div>
          
          <div className="w-full md:w-auto">
            <SearchBar fullWidth={false} />
          </div>
        </div>
        
        <Tabs defaultValue="all" onValueChange={setActiveFilter} className="w-full animate-fade-in">
          <TabsList className="w-full md:w-auto justify-start overflow-auto">
            <TabsTrigger value="all" className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>All</span>
            </TabsTrigger>
            <TabsTrigger value="TRUE" className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-brightcheck-green" />
              <span>True</span>
            </TabsTrigger>
            <TabsTrigger value="FALSE" className="flex items-center gap-1">
              <XCircle className="w-4 h-4 text-brightcheck-red" />
              <span>False</span>
            </TabsTrigger>
            <TabsTrigger value="UNVERIFIED" className="flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-brightcheck-amber" />
              <span>Unverified</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHistory.map((item) => (
                <CheckHistoryCard key={item.id} item={item} />
              ))}
            </div>
            
            {filteredHistory.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No history items found</p>
              </div>
            )}
            
            {filteredHistory.length > 0 && (
              <div className="mt-8 text-center">
                <Button variant="outline">Load More</Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="TRUE" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHistory.map((item) => (
                <CheckHistoryCard key={item.id} item={item} />
              ))}
            </div>
            
            {filteredHistory.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No true claims found</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="FALSE" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHistory.map((item) => (
                <CheckHistoryCard key={item.id} item={item} />
              ))}
            </div>
            
            {filteredHistory.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No false claims found</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="UNVERIFIED" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHistory.map((item) => (
                <CheckHistoryCard key={item.id} item={item} />
              ))}
            </div>
            
            {filteredHistory.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No unverified claims found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="border-t py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white text-xs font-bold">B</span>
              </div>
              <span className="font-semibold">BrightCheck</span>
            </div>
            
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">About</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default History;
