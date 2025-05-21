
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../theme-provider";
import { useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative p-2 rounded-full overflow-hidden bg-secondary hover:bg-secondary/80 transition-colors duration-300"
      aria-label="Toggle theme"
    >
      {isHovered && (
        <span className="absolute inset-0 bg-primary/10 animate-spotlight" />
      )}
      {theme === "dark" ? (
        <Sun className="h-5 w-5 transition-transform duration-300 hover:rotate-12" />
      ) : (
        <Moon className="h-5 w-5 transition-transform duration-300 hover:rotate-12" />
      )}
    </button>
  );
}
