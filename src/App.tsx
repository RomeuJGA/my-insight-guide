import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import PrivateGate from "./components/PrivateGate";

// Heavy pages loaded lazily — users visit one at a time
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Auth = lazy(() => import("./pages/Auth.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const Credits = lazy(() => import("./pages/Credits.tsx"));
const MyMessages = lazy(() => import("./pages/MyMessages.tsx"));
const Terms = lazy(() => import("./pages/legal/Terms.tsx"));
const Privacy = lazy(() => import("./pages/legal/Privacy.tsx"));
const Refunds = lazy(() => import("./pages/legal/Refunds.tsx"));
const About = lazy(() => import("./pages/About.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PrivateGate>
      <BrowserRouter>
        <Suspense>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/my-messages" element={<MyMessages />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/legal/termos" element={<Terms />} />
            <Route path="/legal/privacidade" element={<Privacy />} />
            <Route path="/legal/reembolsos" element={<Refunds />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      </PrivateGate>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
