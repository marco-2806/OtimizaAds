import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, ProtectedRoute, AdminProtectedRoute, Login, Register } from "@/features/auth";
import { AdGenerator, AdDiagnosis } from "@/features/ads"; 
import { AdminDashboard, AdminUsers, AdminSettings, AdminAIConfig, AdminMonitoring, AdminSubscriptions, AdminServiceConfig } from "@/features/admin";
import FunnelOptimizer from "./pages/app/funnel-optimizer";
import { LandingPage } from "@/features/landing";
import { Dashboard } from "@/features/dashboard";
import { History } from "@/features/history";
import { Subscription } from "@/features/subscription";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/layout/AppLayout";
import AdminLayout from "@/components/admin/AdminLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ErrorBoundary>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />
              
              {/* Protected app routes */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="gerador" element={<AdGenerator />} />
                <Route path="diagnostico" element={<AdDiagnosis />} />
                <Route path="historico" element={<History />} />
                <Route path="otimizador-funil" element={<FunnelOptimizer />} />
                <Route path="assinatura" element={<Subscription />} />
              </Route>

              {/* Admin routes */}
              <Route path="/admin" element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="usuarios" element={<AdminUsers />} />
                <Route path="configuracoes" element={<AdminSettings />} />
                <Route path="ai-config" element={<AdminAIConfig />} />
                <Route path="monitoring" element={<AdminMonitoring />} />
                <Route path="subscriptions" element={<AdminSubscriptions />} />
                <Route path="services" element={<AdminServiceConfig />} />
              </Route>

              {/* Legacy routes for backward compatibility */}
              <Route path="/index" element={<Index />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;