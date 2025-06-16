import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login"; // Import Login page
import Register from "./pages/Register"; // Import Register page
import Dashboard from "./pages/Dashboard"; // Import Dashboard page
import SendMessage from "./pages/SendMessage"; // Import SendMessage page
import EditProfile from "./pages/EditProfile"; // Import EditProfile page
import { SessionContextProvider } from "./contexts/SessionContext"; // Import SessionContextProvider

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionContextProvider> {/* Wrap routes with SessionContextProvider */}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} /> {/* Add Login route */}
            <Route path="/register" element={<Register />} /> {/* Add Register route */}
            <Route path="/dashboard" element={<Dashboard />} /> {/* Add Dashboard route */}
            <Route path="/send-message" element={<SendMessage />} /> {/* Add SendMessage route */}
            <Route path="/edit-profile" element={<EditProfile />} /> {/* Add EditProfile route */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SessionContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;