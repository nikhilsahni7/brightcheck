
import { ExternalLink } from "lucide-react";
import { useState } from "react";

export type SourceType = {
  url: string;
  title: string;
  favicon?: string;
  source: string;
  credibilityScore: number; // 0-100
  timestamp: string;
  snippet: string;
};

type SourceCardProps = {
  source: SourceType;
};

export function SourceCard({ source }: SourceCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Determine the credibility badge color
  const getCredibilityBadge = () => {
    if (source.credibilityScore >= 80) {
      return "bg-brightcheck-green/10 text-brightcheck-green border border-brightcheck-green/20";
    } else if (source.credibilityScore >= 50) {
      return "bg-brightcheck-amber/10 text-brightcheck-amber border border-brightcheck-amber/20";
    } else {
      return "bg-brightcheck-red/10 text-brightcheck-red border border-brightcheck-red/20";
    }
  };
  
  return (
    <div 
      className={`glassmorphism-card p-4 transition-all duration-300 ${isHovered ? 'shadow-lg translate-y-[-2px]' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          {source.favicon ? (
            <img src={source.favicon} alt={source.source} className="w-4 h-4 mr-2" />
          ) : (
            <div className="w-4 h-4 mr-2 bg-secondary rounded-full" />
          )}
          <span className="font-medium">{source.source}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${getCredibilityBadge()}`}>
            {source.credibilityScore}%
          </span>
          <a 
            href={source.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full ${isHovered ? 'bg-secondary/50' : ''}`}
          >
            <ExternalLink className={`w-4 h-4 transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`} />
          </a>
        </div>
      </div>
      
      <h3 className="font-semibold text-base mb-2 line-clamp-2">{source.title}</h3>
      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{source.snippet}</p>
      
      <div className="text-xs text-muted-foreground">
        {source.timestamp}
      </div>
    </div>
  );
}
