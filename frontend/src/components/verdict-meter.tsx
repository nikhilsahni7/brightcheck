
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export type VerdictType = "TRUE" | "FALSE" | "UNVERIFIED";

type VerdictMeterProps = {
  verdict: VerdictType;
  confidenceScore: number; // 0-100
};

export function VerdictMeter({ verdict, confidenceScore }: VerdictMeterProps) {
  const [score, setScore] = useState(0);
  
  useEffect(() => {
    // Animate the confidence score from 0 to the actual value
    const timer = setTimeout(() => {
      setScore(confidenceScore);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [confidenceScore]);
  
  const getVerdictClass = () => {
    switch (verdict) {
      case "TRUE":
        return "verdict-true";
      case "FALSE":
        return "verdict-false";
      case "UNVERIFIED":
        return "verdict-unverified";
      default:
        return "";
    }
  };
  
  const getVerdictColor = () => {
    switch (verdict) {
      case "TRUE":
        return "bg-brightcheck-green";
      case "FALSE":
        return "bg-brightcheck-red";
      case "UNVERIFIED":
        return "bg-brightcheck-amber";
      default:
        return "";
    }
  };
  
  const getVerdictShadow = () => {
    switch (verdict) {
      case "TRUE":
        return "shadow-brightcheck-green/20";
      case "FALSE":
        return "shadow-brightcheck-red/20";
      case "UNVERIFIED":
        return "shadow-brightcheck-amber/20";
      default:
        return "";
    }
  };
  
  return (
    <div className="w-full animate-fade-in">
      <div className={cn(
        "inline-flex items-center px-4 py-2 rounded-full mb-3", 
        getVerdictClass(),
        "transform transition-all duration-300 hover:scale-105",
        "shadow-md", getVerdictShadow()
      )}>
        <span className="font-semibold">{verdict}</span>
        <span className="ml-2 text-sm">({confidenceScore}% confidence)</span>
      </div>
      
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden shadow-inner">
        <div
          className={cn("h-full transition-all duration-1000 ease-in-out", getVerdictColor())}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
