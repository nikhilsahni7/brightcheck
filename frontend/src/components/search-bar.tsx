
import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const exampleClaims = [
  "Did Pak Airforce destroy 2 Indian Rafale jets?",
  "Is Twitter planning to charge users $20/month?",
  "Has NASA confirmed water on Mars?",
  "Did the WHO announce a new pandemic?",
];

type SearchBarProps = {
  fullWidth?: boolean;
  autoFocus?: boolean;
  animate?: boolean;
};

export function SearchBar({ fullWidth = false, autoFocus = false, animate = false }: SearchBarProps) {
  const [claim, setClaim] = useState("");
  const [currentExample, setCurrentExample] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(animate);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claim && !displayText) return;
    
    const searchQuery = claim || displayText;
    navigate(`/results?claim=${encodeURIComponent(searchQuery)}`);
  };
  
  return (
    <form 
      onSubmit={handleSubmit}
      className={`relative ${isFocused ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''} transition-all duration-300 ease-in-out glassmorphism-card ${fullWidth ? 'w-full' : 'max-w-3xl'} mx-auto overflow-hidden`}
    >
      <div className="flex items-center p-3">
        <Search className={`h-5 w-5 ${isFocused ? 'text-primary' : 'text-muted-foreground'} transition-colors duration-300 flex-shrink-0 ml-2`} />
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
            {displayText}<span className="animate-type-cursor">|</span>
          </div>
        )}
        <Button 
          type="submit" 
          className="bg-primary hover:bg-primary/90 text-white ml-2 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md"
        >
          Verify
        </Button>
      </div>
    </form>
  );
}
