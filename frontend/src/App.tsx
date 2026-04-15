import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import SalesEntry from "./pages/SalesEntry";
import ViewSales from "./pages/ViewSales";
import Reports from "./pages/Reports";
import Salesmen from "./pages/Salesmen";
import AppLayout from "./components/AppLayout";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    // Redirect to Flask login page
    window.location.href = '/login';
    return null;
  }
  return <AppLayout>{children}</AppLayout>;
};

const Heartbeat = () => {
  useEffect(() => {
    // Send a heartbeat every 2 seconds
    const interval = setInterval(() => {
      fetch('/api/heartbeat', { method: 'POST' }).catch(() => {});
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <Heartbeat />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/sales/new" element={<ProtectedRoute><SalesEntry /></ProtectedRoute>} />
            <Route path="/sales" element={<ProtectedRoute><ViewSales /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/salesmen" element={<ProtectedRoute><Salesmen /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
