import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ScanPage from "./pages/ScanPage";
import PantryPage from "./pages/PantryPage";
import ProfilePage from "./pages/ProfilePage";
import PricingPage from "./pages/PricingPage";
import SubscriptionSuccessPage from "./pages/SubscriptionSuccessPage";
import MyKitchenPage from "./pages/MyKitchenPage";
import CookingJournalPage from "./pages/CookingJournalPage";
import ChatPage from "./pages/ChatPage";
import CookNowPage from "./pages/CookNowPage";
import ShoppingListPage from "./pages/ShoppingListPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/pantry" element={<PantryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/subscription-success" element={<SubscriptionSuccessPage />} />
          <Route path="/my-kitchen" element={<MyKitchenPage />} />
          <Route path="/cooking-journal" element={<CookingJournalPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/cook-now" element={<CookNowPage />} />
          <Route path="/shopping-list" element={<ShoppingListPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
