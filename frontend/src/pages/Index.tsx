
import { useState, useEffect } from "react";
import { SearchBar } from "@/components/search-bar";
import { FeatureCard } from "@/components/feature-card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { 
  Search, 
  Clock, 
  ShieldCheck, 
  Link as LinkIcon,
  BarChart4,
  ArrowRight
} from "lucide-react";

const Index = () => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    setVisible(true);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-radar"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background"></div>
          
          <div 
            className={`container max-w-6xl mx-auto px-4 text-center relative transition-all duration-1000 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-gradient">Real-time</span> Fact Checking
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10">
              Verify any claim instantly with AI-powered analysis from trusted sources across the web.
            </p>
            
            <div className="mb-12">
              <SearchBar fullWidth={false} animate={true} />
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 mb-16">
              <span className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">Social Media</span>
              <span className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">News Articles</span>
              <span className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">Public Data</span>
              <span className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">Government Statements</span>
              <span className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">Scientific Research</span>
            </div>
            
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white relative group animate-pulse"
            >
              Try BrightCheck Now
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">How BrightCheck Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Search className="w-6 h-6" />}
                title="Real-Time Data"
                description="Our AI scans the internet in real-time to gather the most up-to-date information from trusted sources."
              />
              
              <FeatureCard 
                icon={<ShieldCheck className="w-6 h-6" />}
                title="Trusted Sources"
                description="We prioritize credible sources and rank information based on authority and reliability."
              />
              
              <FeatureCard 
                icon={<LinkIcon className="w-6 h-6" />}
                title="Evidence-Based"
                description="Every verdict is supported with direct links to primary sources and relevant evidence."
              />
              
              <FeatureCard 
                icon={<BarChart4 className="w-6 h-6" />}
                title="Sentiment Analysis"
                description="Understand public perception with social media sentiment analysis and opinion tracking."
              />
              
              <FeatureCard 
                icon={<Clock className="w-6 h-6" />}
                title="Timeline Tracking"
                description="See how information evolved over time with our chronological fact tracking system."
              />

              <div className="glassmorphism-card p-6 flex flex-col items-center justify-center text-center">
                <h3 className="text-xl font-semibold mb-4">Ready to verify facts?</h3>
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials/Stats Section */}
        <section className="py-20">
          <div className="container">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-16">The Truth Matters</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-4xl md:text-5xl font-bold text-gradient mb-2">98%</span>
                  <span className="text-muted-foreground">Accuracy Rate</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <span className="text-4xl md:text-5xl font-bold text-gradient mb-2">500+</span>
                  <span className="text-muted-foreground">Sources Analyzed</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <span className="text-4xl md:text-5xl font-bold text-gradient mb-2">3M+</span>
                  <span className="text-muted-foreground">Claims Verified</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <span className="text-4xl md:text-5xl font-bold text-gradient mb-2">15s</span>
                  <span className="text-muted-foreground">Average Response</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-primary/5">
          <div className="container max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Get the facts. Make informed decisions.</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              Join thousands of users who trust BrightCheck to verify information in an era of misinformation.
            </p>
            
            <div className="mb-10">
              <SearchBar fullWidth={false} />
            </div>
            
            <p className="text-sm text-muted-foreground">
              No signup required. Just enter your claim and get instant verification.
            </p>
          </div>
        </section>
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

export default Index;
