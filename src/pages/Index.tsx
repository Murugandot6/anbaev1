import { MadeWithDyad } from "@/components/made-with-dyad";
import { Heart } from "lucide-react"; // Importing a relevant icon

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-950 text-foreground p-4">
      <div className="flex flex-col items-center justify-center flex-grow">
        <Heart className="w-24 h-24 text-pink-500 dark:text-purple-400 mb-8 animate-pulse" /> {/* Added a pulsing heart icon */}
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-center text-gray-900 dark:text-white leading-tight">
          Welcome to <span className="text-pink-600 dark:text-purple-400">Anbae</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground text-center max-w-2xl px-4">
          Your personalized space to connect and express with your partner, fostering clear communication and a deeper bond.
        </p>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;