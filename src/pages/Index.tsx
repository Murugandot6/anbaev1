import { MadeWithDyad } from "@/components/made-with-dyad";
import Navbar from "@/components/Navbar"; // Import the new Navbar component
import { Heart, Sparkles, MessageSquare, Lock } from "lucide-react"; // Importing relevant icons for features
import { Button } from "@/components/ui/button"; // Importing Button from shadcn/ui

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-950 text-foreground">
      <Navbar /> {/* Include the Navbar here */}

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center flex-grow text-center py-20 px-4 pt-24 md:pt-32 animate-fade-in">
        <Heart className="w-24 h-24 text-pink-500 dark:text-purple-400 mb-8 animate-pulse" />
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-gray-900 dark:text-white leading-tight">
          Welcome to <span className="text-pink-600 dark:text-purple-400">Anbae</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-8">
          Your personalized space to connect and express with your partner, fostering clear communication and a deeper bond.
        </p>
        <Button size="lg" className="bg-pink-600 hover:bg-pink-700 text-white dark:bg-purple-600 dark:hover:bg-purple-700 text-lg px-8 py-6 rounded-full shadow-lg transition-all duration-300 hover:scale-105">
          Start Your Journey
        </Button>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white dark:bg-gray-800 text-center">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-gray-900 dark:text-white">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md transition-transform duration-300 hover:scale-105">
              <Sparkles className="w-16 h-16 text-pink-500 dark:text-purple-400 mb-4" />
              <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Personalized Insights</h3>
              <p className="text-muted-foreground">Gain unique insights into your relationship dynamics and growth areas.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md transition-transform duration-300 hover:scale-105">
              <MessageSquare className="w-16 h-16 text-pink-500 dark:text-purple-400 mb-4" />
              <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Enhanced Communication</h3>
              <p className="text-muted-foreground">Tools and prompts to help you communicate more effectively and openly.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md transition-transform duration-300 hover:scale-105">
              <Lock className="w-16 h-16 text-pink-500 dark:text-purple-400 mb-4" />
              <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Private & Secure</h3>
              <p className="text-muted-foreground">Your conversations and data are kept private and secure.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section id="call-to-action" className="py-20 px-4 bg-gradient-to-r from-pink-600 to-purple-600 dark:from-purple-800 dark:to-pink-800 text-white text-center">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold mb-6">Ready to Deepen Your Connection?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join Anbae today and start building a stronger, more understanding relationship with your partner.
          </p>
          <Button size="lg" className="bg-white text-pink-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-purple-400 dark:hover:bg-gray-700 text-lg px-8 py-6 rounded-full shadow-lg transition-all duration-300 hover:scale-105">
            Sign Up Now
          </Button>
        </div>
      </section>

      <MadeWithDyad />
    </div>
  );
};

export default Index;