
import { VerdictType } from "./verdict-meter";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";

export type HistoryItem = {
  id: string;
  claim: string;
  verdict: VerdictType;
  confidenceScore: number;
  date: string;
};

type CheckHistoryCardProps = {
  item: HistoryItem;
};

export function CheckHistoryCard({ item }: CheckHistoryCardProps) {
  const getVerdictClass = () => {
    switch (item.verdict) {
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
  
  return (
    <Link
      to={`/results?claim=${encodeURIComponent(item.claim)}&id=${item.id}`}
      className="block glassmorphism-card p-4 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-lg line-clamp-2">{item.claim}</h3>
        <span className={cn("px-3 py-1 rounded-full text-xs", getVerdictClass())}>
          {item.verdict}
        </span>
      </div>
      
      <div className="flex items-center text-xs text-muted-foreground">
        <Clock className="w-3 h-3 mr-1" />
        <span>{item.date}</span>
      </div>
    </Link>
  );
}
