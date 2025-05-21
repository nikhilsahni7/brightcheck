
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/navbar";
import { SearchBar } from "@/components/search-bar";
import { VerdictMeter } from "@/components/verdict-meter";
import { SourceCard, SourceType } from "@/components/source-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Globe,
  MessageSquare,
  Newspaper,
  PieChart,
  BarChart,
  Share2,
  ChevronDown,
  Clock
} from "lucide-react";

// Mock data for demonstration
const MOCK_SOURCES: SourceType[] = [
  {
    url: "https://example.com/news/article1",
    title: "Official Investigation Reveals No Evidence of Fighter Jet Incident",
    favicon: "https://www.example.com/favicon.ico",
    source: "Reliable News Network",
    credibilityScore: 92,
    timestamp: "2 hours ago",
    snippet: "An official investigation by international observers has found no evidence to support claims that Pakistani Air Force destroyed Indian Rafale jets in a recent border incident."
  },
  {
    url: "https://example.com/news/article2",
    title: "Military Officials Deny Reports of Aerial Combat Between India and Pakistan",
    favicon: "https://www.example2.com/favicon.ico",
    source: "Global Defense Journal",
    credibilityScore: 88,
    timestamp: "4 hours ago",
    snippet: "Military officials from both India and Pakistan have denied reports circulating on social media claiming that fighter jets were engaged in combat along the border region."
  },
  {
    url: "https://example.com/news/article3",
    title: "Social Media Fuels Unverified Claims of Fighter Jet Confrontation",
    favicon: "https://www.example3.com/favicon.ico",
    source: "Media Watch",
    credibilityScore: 75,
    timestamp: "5 hours ago",
    snippet: "Analysis shows how unverified claims about military confrontations spread rapidly across platforms like Twitter and Facebook, often without factual basis."
  },
  {
    url: "https://example.com/news/article4",
    title: "Viral Video Claiming to Show Downed Jets Confirmed to be from 2019 Exercise",
    favicon: "https://www.example4.com/favicon.ico",
    source: "Fact Check Daily",
    credibilityScore: 95,
    timestamp: "Yesterday",
    snippet: "A viral video purporting to show recent combat between Indian and Pakistani aircraft has been identified as footage from a 2019 military exercise."
  },
];

const Results = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  
  const claim = searchParams.get("claim") || "Did Pak Airforce destroy 2 Indian Rafale jets?";
  
  // For demo purposes, we're simulating a loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const getVerdictIcon = () => {
    return <XCircle className="w-6 h-6 text-brightcheck-red" />;
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Analyzing your claim</h2>
            <p className="text-muted-foreground">
              Searching through trusted sources and analyzing real-time data...
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <SearchBar autoFocus={false} fullWidth={true} />
        </div>
        
        <div className="glassmorphism-card p-6 md:p-8 mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div className="flex-shrink-0">
              {getVerdictIcon()}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{claim}</h1>
          </div>
          
          <VerdictMeter verdict="FALSE" confidenceScore={89} />
          
          <div className="mt-6 text-muted-foreground">
            <p className="mb-4">
              <strong>Our Analysis:</strong> After reviewing multiple credible sources including official military statements, news reports, and verification of circulating media, we found no evidence to support this claim. Military officials from both countries have denied any such incident occurred during the specified timeframe.
            </p>
            
            {!showMore && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center text-primary"
                onClick={() => setShowMore(true)}
              >
                <span>Show more details</span>
                <ChevronDown className="ml-1 w-4 h-4" />
              </Button>
            )}
            
            {showMore && (
              <div className="mt-4 animate-fade-in">
                <p className="mb-4">
                  The claim appears to have originated from several unverified social media accounts and was subsequently amplified across platforms. Video footage shared alongside the claim has been identified as coming from a military exercise conducted in 2019, not recent events.
                </p>
                <p>
                  International observers and independent journalists in the region have not corroborated any such military engagement. The Indian Air Force inventory records show no recent losses of Rafale aircraft.
                </p>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="w-3 h-3 mr-1" />
              <span>Last updated: 2 hours ago</span>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="evidence" className="w-full animate-fade-in">
          <TabsList className="w-full justify-start overflow-auto">
            <TabsTrigger value="evidence" className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>Conclusive Evidence</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>Social Media</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-1">
              <Newspaper className="w-4 h-4" />
              <span>News Articles</span>
            </TabsTrigger>
            <TabsTrigger value="sentiment" className="flex items-center gap-1">
              <PieChart className="w-4 h-4" />
              <span>Public Sentiment</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Evidence Tab */}
          <TabsContent value="evidence" className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Key Findings</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <XCircle className="w-5 h-5 text-brightcheck-red mr-2 mt-0.5 flex-shrink-0" />
                    <span>No official military statements from either country confirm this incident</span>
                  </li>
                  <li className="flex items-start">
                    <XCircle className="w-5 h-5 text-brightcheck-red mr-2 mt-0.5 flex-shrink-0" />
                    <span>Satellite imagery from the alleged timeframe shows no evidence of downed aircraft</span>
                  </li>
                  <li className="flex items-start">
                    <XCircle className="w-5 h-5 text-brightcheck-red mr-2 mt-0.5 flex-shrink-0" />
                    <span>Video footage shared as evidence has been verified as from a 2019 military exercise</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-brightcheck-green mr-2 mt-0.5 flex-shrink-0" />
                    <span>Independent journalists in border regions report no unusual military activity</span>
                  </li>
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Most Reliable Sources</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {MOCK_SOURCES.slice(0, 4).map((source, index) => (
                    <SourceCard key={index} source={source} />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Social Media Tab */}
          <TabsContent value="social" className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Social Media Analysis</h3>
                <p className="text-muted-foreground mb-6">
                  We analyzed 2,543 social media posts across Twitter, Facebook, Reddit and other platforms
                  referencing this claim over the past 48 hours.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="glassmorphism-card p-4 text-center">
                    <h4 className="text-sm text-muted-foreground mb-1">Spreading the claim</h4>
                    <p className="text-3xl font-bold text-brightcheck-red">68%</p>
                    <p className="text-xs text-muted-foreground">of social media posts</p>
                  </div>
                  
                  <div className="glassmorphism-card p-4 text-center">
                    <h4 className="text-sm text-muted-foreground mb-1">Debunking the claim</h4>
                    <p className="text-3xl font-bold text-brightcheck-green">27%</p>
                    <p className="text-xs text-muted-foreground">of social media posts</p>
                  </div>
                  
                  <div className="glassmorphism-card p-4 text-center">
                    <h4 className="text-sm text-muted-foreground mb-1">Neutral discussion</h4>
                    <p className="text-3xl font-bold">5%</p>
                    <p className="text-xs text-muted-foreground">of social media posts</p>
                  </div>
                </div>
                
                <div className="h-64 glassmorphism-card p-4 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>Social Media Trend Analysis Chart</p>
                    <p className="text-xs">(Interactive chart showing claim spread over time)</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Influential Accounts</h3>
                <p className="text-muted-foreground mb-6">
                  Key accounts that have significantly influenced the spread of this claim.
                </p>
                
                <div className="space-y-4">
                  {/* Example influential accounts would go here */}
                  <div className="glassmorphism-card p-4">
                    <p className="text-muted-foreground">Analysis of influential accounts would appear here</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* News Tab */}
          <TabsContent value="news" className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">News Coverage</h3>
                <p className="text-muted-foreground mb-6">
                  We analyzed 37 news articles from 24 different news outlets discussing this claim.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MOCK_SOURCES.map((source, index) => (
                    <SourceCard key={index} source={source} />
                  ))}
                </div>
                
                <Button variant="outline" className="w-full mt-4">
                  Load More Sources
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Sentiment Tab */}
          <TabsContent value="sentiment" className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Public Sentiment Analysis</h3>
                <p className="text-muted-foreground mb-6">
                  We analyzed public sentiment around this claim based on social media engagement and comments.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="glassmorphism-card p-6">
                    <h4 className="text-lg font-medium mb-4">Sentiment Distribution</h4>
                    <div className="h-48 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <PieChart className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p>Sentiment Distribution Chart</p>
                        <p className="text-xs">(Interactive pie chart showing sentiment)</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glassmorphism-card p-6">
                    <h4 className="text-lg font-medium mb-4">Regional Breakdown</h4>
                    <div className="h-48 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Globe className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p>Geographic Distribution Map</p>
                        <p className="text-xs">(Interactive map showing regional engagement)</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="glassmorphism-card p-6">
                  <h4 className="text-lg font-medium mb-4">Key Topics & Phrases</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-primary/5 rounded-full text-sm">Military Conflict</span>
                    <span className="px-3 py-1 bg-primary/5 rounded-full text-sm">Fighter Jets</span>
                    <span className="px-3 py-1 bg-primary/5 rounded-full text-sm">India-Pakistan</span>
                    <span className="px-3 py-1 bg-primary/5 rounded-full text-sm">Rafale</span>
                    <span className="px-3 py-1 bg-primary/5 rounded-full text-sm">Border Tensions</span>
                    <span className="px-3 py-1 bg-primary/5 rounded-full text-sm">Misinformation</span>
                    <span className="px-3 py-1 bg-primary/5 rounded-full text-sm">Video Evidence</span>
                    <span className="px-3 py-1 bg-primary/5 rounded-full text-sm">Fact Check</span>
                  </div>
                </div>
              </div>
            </div>
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

export default Results;
