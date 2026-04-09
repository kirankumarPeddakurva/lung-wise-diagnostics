import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getUser } from "@/lib/auth";
import AuthPage from "@/components/AuthPage";
import Navbar from "@/components/Navbar";
import Dashboard from "@/pages/Dashboard";
import UploadResults from "@/pages/UploadResults";
import HistoryPage from "@/pages/HistoryPage";
import AboutPage from "@/pages/AboutPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getUser());

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthPage onAuth={() => setIsAuthenticated(true)} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar onLogout={() => setIsAuthenticated(false)} />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadResults />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
