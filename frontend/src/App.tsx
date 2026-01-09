// App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RequireAdmin from "./components/auth/RequireAdmin";

import Index from "./pages/public/Index";
import Login from "./pages/auth/Login";
import BookingFlow from "./pages/booking/BookingFlow";
import BookingConfirm from "./pages/booking/BookingConfirm";
import BookingSuccess from "./pages/booking/BookingSuccess";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";
import ServicesPublicPage from "./pages/public/ServicesPublic";
import ServicesAdminPage from "./pages/admin/ServicesAdmin";
import TechAdminPage from "./pages/admin/TechAdmin";



const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/book" element={<BookingFlow />} />
            {/* <Route path="/book/confirm" element={<BookingConfirm />} /> */}
            <Route path="/book/success" element={<BookingSuccess />} />
            <Route path="*" element={<NotFound />} />

            <Route path="/services" element={<ServicesPublicPage />} />


            <Route path="/admin" element={
                <RequireAdmin>
                  <AdminDashboard />
                </RequireAdmin>
              }
            />
            <Route path="/admin/services"
              element={
                <RequireAdmin>
                  <ServicesAdminPage />
                </RequireAdmin>
              }
            />
            <Route path="/admin/technicians"
                element={
                <RequireAdmin>
                  <TechAdminPage />
                </RequireAdmin>
              } />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;



