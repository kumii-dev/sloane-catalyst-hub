import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Mentorship from "./pages/Mentorship";
import FindMentor from "./pages/FindMentor";
import BecomeMentor from "./pages/BecomeMentor";
import FundingHub from "./pages/FundingHub";
import BrowseFunding from "./pages/BrowseFunding";
import StartupDashboard from "./pages/StartupDashboard";
import FunderDashboard from "./pages/FunderDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/mentorship" element={<Mentorship />} />
            <Route path="/find-mentor" element={<FindMentor />} />
            <Route path="/become-mentor" element={<BecomeMentor />} />
            <Route path="/funding" element={<FundingHub />} />
            <Route path="/funding/browse" element={<BrowseFunding />} />
            <Route path="/funding/startup-dashboard" element={<StartupDashboard />} />
            <Route path="/funding/funder-dashboard" element={<FunderDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
