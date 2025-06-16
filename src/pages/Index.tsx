import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Mic, Image } from "lucide-react";

const Index = () => {
  const typingPhrases = [
    "Discover how couples can use our website to resolve conflicts.",
    "Discover how couples can use our website to share compliments.",
    "Discover how couples can use our website to cherish good memories.",
    "Discover how couples can use our website to express feelings.",
  ];

  const [placeholderText, setPlaceholderText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseTime = 1500;

  useEffect(() => {
    const currentPhrase = typingPhrases[phraseIndex];
    let timer: NodeJS.Timeout;

    if (isDeleting) {
      if (charIndex > 0) {
        timer = setTimeout(() => {
          setPlaceholderText(currentPhrase.substring(0, charIndex - 1));
          setCharIndex(prev => prev - 1);
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        setPhraseIndex(prev => (prev + 1) % typingPhrases.length);
      }
    } else {
      if (charIndex < currentPhrase.length) {
        timer = setTimeout(() => {
          setPlaceholderText(currentPhrase.substring(0, charIndex + 1));
          setCharIndex(prev => prev + 1);
        }, typingSpeed);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTime);
      }
    }

    return () => clearTimeout(timer);
  }, [placeholderText, charIndex, isDeleting, phraseIndex, typingPhrases, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-foreground p-4">
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-none">
          <span className="text-blue-600">A</span>
          <span className="text-red-600">n</span>
          <span className="text-yellow-600">b</span>
          <span className="text-blue-600">a</span>
          <span className="text-green-600">e</span>
        </h1>
      </div>

      <div className="w-full max-w-xl mb-6 px-4 animate-fade-in delay-200">
        <div className="relative flex items-center">
          <Search className="absolute left-3 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <Input
            type="text"
            placeholder={placeholderText}
            className="w-full pl-10 pr-20 py-3 text-lg rounded-full shadow-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          />
          <div className="absolute right-3 flex space-x-2">
            <Mic className="text-gray-400 dark:text-gray-500 w-5 h-5 cursor-pointer hover:text-gray-600 dark:hover:text-gray-400" />
            <Image className="text-gray-400 dark:text-gray-500 w-5 h-5 cursor-pointer hover:text-gray-600 dark:hover:text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in delay-400">
        <Link to="/login">
          <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800 px-4 py-2 rounded-md shadow-sm">
            Login
          </Button>
        </Link>
        <Link to="/register">
          <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800 px-4 py-2 rounded-md shadow-sm">
            Register
          </Button>
        </Link>
      </div>

      {/* The language list div has been removed */}
    </div>
  );
};

export default Index;