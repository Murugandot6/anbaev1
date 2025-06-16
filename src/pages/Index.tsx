import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-950 text-foreground p-4">
      <div className="text-center mb-8">
        <h1 className="text-6xl md:text-8xl font-extrabold mb-4 leading-none">
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

      <div className="w-full max-w-md mb-8">
        <Input
          type="text"
          placeholder="Submit your grievances for my view!"
          className="w-full p-3 text-lg rounded-lg shadow-md border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      <div className="flex space-x-4">
        <Link to="/login">
          <Button className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white px-6 py-3 rounded-lg shadow-md transition-all duration-300 hover:scale-105">
            Login
          </Button>
        </Link>
        <Link to="/register">
          <Button className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white px-6 py-3 rounded-lg shadow-md transition-all duration-300 hover:scale-105">
            Register
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;