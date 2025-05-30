import { useFactCheck } from "@/hooks/useFactCheck";
import { Loader2, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "./ui/button";

const exampleClaims = [
  // 🌍 World & Politics

  "Has North Korea launched a nuclear missile in 2025?",
  "Is the UN planning to remove permanent members of the Security Council?",

  // 💻 Tech & Social Media
  "Is Twitter charging $20/month for verified users?",
  "Did Apple announce a foldable iPhone in 2025?",
  "Is OpenAI releasing ChatGPT-5 this year?",

  // 🌌 Science & Space
  "Has NASA confirmed the presence of water on Mars?",
  "Did scientists discover a parallel universe?",
  "Has ISRO landed a rover on the dark side of the moon?",

  // 🦠 Health & COVID
  "Did the COVID-19 vaccine cause infertility in men?",
  "Has the WHO declared a new pandemic in 2025?",
  "Are antidepressants proven to be ineffective now?",

  // 🌡️ Climate & Environment
  "Is climate change responsible for extreme flooding in Europe?",
  "Did July 2025 break the record for the hottest month ever?",
  "Is the Amazon rainforest losing 1% every year?",

  // 🧠 Conspiracy & Misinformation
  "Is 5G responsible for bird deaths around the world?",
  "Are COVID vaccines secretly microchipping people?",
  "Did Bill Gates say he wants to reduce global population using vaccines?",

  // 🧾 Economics & Society
  "Is India now the 3rd largest economy in the world?",
  "Are food prices expected to double by the end of 2025?",
  "Has the world entered a global recession in 2025?",
];

type SearchBarProps = {
  fullWidth?: boolean;
  autoFocus?: boolean;
  animate?: boolean;
  onFactCheckStart?: (claim: string) => void;
};

export function SearchBar({
  fullWidth = false,
  autoFocus = false,
  animate = false,
  onFactCheckStart,
}: SearchBarProps) {
  const [claim, setClaim] = useState("");
  const [currentExample, setCurrentExample] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(animate);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { submitFactCheck, isLoading } = useFactCheck();

  // Auto-typing animation
  useEffect(() => {
    if (!animate) return;

    if (isTyping) {
      const example = exampleClaims[currentExample];
      let index = 0;

      const typingInterval = setInterval(() => {
        if (index < example.length) {
          setDisplayText(example.substring(0, index + 1));
          index++;
        } else {
          clearInterval(typingInterval);
          setTimeout(() => {
            setIsTyping(false);
            setTimeout(() => {
              setDisplayText("");
              setCurrentExample((currentExample + 1) % exampleClaims.length);
              setIsTyping(true);
            }, 2000);
          }, 1500);
        }
      }, 100);

      return () => clearInterval(typingInterval);
    }
  }, [currentExample, isTyping, animate]);

  // Autofocus input
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const searchQuery = claim || displayText;
    if (!searchQuery.trim()) {
      toast.error("Please enter a claim to verify");
      return;
    }

    if (searchQuery.length < 5) {
      toast.error("Please enter a more detailed claim (at least 5 characters)");
      return;
    }

    if (searchQuery.length > 500) {
      toast.error("Claim is too long. Please keep it under 500 characters");
      return;
    }

    try {
      // Call the callback if provided (for real-time updates on Results page)
      if (onFactCheckStart) {
        onFactCheckStart(searchQuery);
        return; // Don't navigate if we're already on Results page
      }

      // Show toast to indicate we're starting the analysis
      toast.success("Starting fact check analysis...");

      // Navigate to results page with the claim - Results page will handle submission
      navigate(`/results?claim=${encodeURIComponent(searchQuery)}`);
    } catch (error) {
      console.error("Error submitting fact check:", error);
      toast.error("Failed to start fact check. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative ${isFocused ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""} transition-all duration-300 ease-in-out glassmorphism-card ${fullWidth ? "w-full" : "max-w-3xl"} mx-auto overflow-hidden`}
    >
      <div className="flex items-center p-3">
        <Search
          className={`h-5 w-5 ${isFocused ? "text-primary" : "text-muted-foreground"} transition-colors duration-300 flex-shrink-0 ml-2`}
        />
        <input
          ref={inputRef}
          type="text"
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={animate ? "" : "Type your claim to verify..."}
          className="flex-1 bg-transparent border-none outline-none px-4 py-2 w-full text-foreground placeholder:text-muted-foreground/70 transition-all duration-300"
        />
        {animate && !claim && (
          <div className="absolute left-[52px] text-muted-foreground/70 pointer-events-none">
            {displayText}
            <span className="animate-type-cursor">|</span>
          </div>
        )}
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90 text-white ml-2 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Verify"
          )}
        </Button>
      </div>
    </form>
  );
}
