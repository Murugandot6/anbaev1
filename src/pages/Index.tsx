import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heart, Search } from "lucide-react";
import TypingAnimation from "@/components/TypingAnimation"; // Import the new component

const Index = () => {
  const typingPhrases = [
    "how couples can use our website to resolve conflicts.",
    "how couples can use our website to share compliments.",
    "how couples can use our website to cherish good memories.",
    "how couples can use our website to express feelings.",
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-foreground p-4">
      <div className="text-center mb-8 animate-fade-in"> {/* Added fade-in animation */}
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-none">
          <span className="text-blue-600">a</span>
          <span className="text-red-600">n</span>
          <span className="text-yellow-600">b</span>
          <span className="text-green-600">a</span>
          <span className="text-blue-600">e</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground flex items-center justify-center gap-2">
          <Heart className="w-6 h-6 text-pink-600 dark:text-purple-400" /> Grievance Portal
        </p>
      </div>

      <div className="w-full max-w-xl mb-8 px-4 animate-fade-in delay-200"> {/* Added fade-in animation with delay */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search Anbae..."
            className="w-full pl-10 pr-4 py-3 text-lg rounded-full shadow-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          />
        </div>
      </div>

      <div className="text-center mb-8 animate-fade-in delay-400"> {/* Added fade-in animation with delay */}
        <p className="text-lg md:text-xl text-muted-foreground">
          Discover&nbsp;
          <TypingAnimation phrases={typingPhrases} />
        </p>
      </div>

      {/* Removed Login/Register buttons from the main homepage */}
      {/* Users can still navigate to /login or /register directly */}
    </div>
  );
};

export default Index;