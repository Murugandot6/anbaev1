import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="flex flex-col items-center justify-center flex-grow">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center">
          Welcome to Anbae
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground text-center max-w-2xl">
          Your personalized space to connect and express with your partner.
        </p>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;