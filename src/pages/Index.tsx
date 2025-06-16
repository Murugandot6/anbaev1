import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heart, Search } from "lucide-react";

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

      <div className="w-full max-w-xl mb-8 px-4 animate-fade-in delay-200">
        <div className="relative flex items-center">
          <Search className="absolute left-3 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <Input
            type="text"
            placeholder={placeholderText} {/* Dynamic placeholder */}
            className="w-full pl-10 pr-4 py-3 text-lg rounded-full shadow-md border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in delay-600">
        <Link to="/login">
          <Button className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 text-white dark:bg-purple-600 dark:hover:bg-purple-700">
            Login
          </Button>
        </Link>
        <Link to="/register">
          <Button variant="outline" className="w-full sm:w-auto text-pink-600 border-pink-600 hover:bg-pink-50 dark:text-purple-400 dark:border-purple-400 dark:hover:bg-purple-900">
            Register
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;