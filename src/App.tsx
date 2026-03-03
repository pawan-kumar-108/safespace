import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Reflect from "./pages/Reflect";
import Connect from "./pages/Connect";
import Wellness from "./pages/Wellness";
import Learn from "./pages/Learn";
import Stories from "./pages/Stories";
import Chat from "./pages/Chat";
import Professionals from "./pages/Professionals";
import TherapistRegister from "./pages/TherapistRegister";
import TherapistDashboard from "./pages/TherapistDashboard";
import TherapistChat from "./pages/TherapistChat";
import TherapistConversations from "./pages/TherapistConversations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reflect" element={<Reflect />} />
              <Route path="/connect" element={<Connect />} />
              <Route path="/wellness" element={<Wellness />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/stories" element={<Stories />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/professionals" element={<Professionals />} />
              <Route path="/therapist-register" element={<TherapistRegister />} />
              <Route path="/therapist-dashboard" element={<TherapistDashboard />} />
              <Route path="/therapist-chat/:therapistId" element={<TherapistChat />} />
              <Route path="/therapist-conversations" element={<TherapistConversations />} />
              <Route path="/therapist-conversations/:userId" element={<TherapistConversations />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
