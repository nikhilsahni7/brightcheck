
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, X, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ui/theme-toggle";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-r from-brightcheck-indigo to-brightcheck-aqua flex items-center justify-center">
              <span className="text-white font-bold">B</span>
              <div className="absolute inset-0 border-2 border-transparent rounded-full animate-radar-scan"></div>
            </div>
            <span className="font-bold text-xl">BrightCheck</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-foreground/80 hover:text-foreground transition-colors relative group">
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link to="/history" className="text-foreground/80 hover:text-foreground transition-colors relative group">
            History
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
          </Link>
          <a href="#" className="text-foreground/80 hover:text-foreground transition-colors relative group">
            About
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
          </a>
          <ThemeToggle />
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
            Get Started
          </Button>
        </nav>
        
        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 w-full bg-background animate-fade-in">
          <nav className="container flex flex-col gap-4 p-6">
            <Link 
              to="/" 
              className="text-lg py-3 border-b"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/history" 
              className="text-lg py-3 border-b"
              onClick={() => setIsMenuOpen(false)}
            >
              History
            </Link>
            <a 
              href="#" 
              className="text-lg py-3 border-b"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
            <Button className="mt-4 bg-primary hover:bg-primary/90 text-white">
              Get Started
            </Button>
          </nav>
        </div>
      )}
      
      {/* Floating Search Button (Mobile) */}
      <Link to="/" className="fixed md:hidden bottom-6 right-6 z-40 p-3 rounded-full bg-primary text-white shadow-lg">
        <Search className="h-5 w-5" />
      </Link>
    </header>
  );
}
