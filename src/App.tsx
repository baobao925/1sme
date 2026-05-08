import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider } from "@/contexts/RoleContext";
import { AppLayout } from "@/components/layout/AppLayout";

import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/auth/Login";

import AffiliateDashboard from "./pages/affiliate/Dashboard";
import Onboarding from "./pages/affiliate/Onboarding";
import Profile from "./pages/affiliate/Profile";
import DeepLinks from "./pages/affiliate/DeepLinks";
import Traffic from "./pages/affiliate/Traffic";
import Conversions from "./pages/affiliate/Conversions";
import Payout from "./pages/affiliate/Payout";
import Statements from "./pages/affiliate/Statements";
import Complaints from "./pages/affiliate/Complaints";
import MyGroups from "./pages/affiliate/MyGroups";
import GettingStarted from "./pages/affiliate/GettingStarted";

import AdminDashboard from "./pages/admin/Dashboard";
import Affiliates from "./pages/admin/Affiliates";
import AffiliateGroups from "./pages/admin/AffiliateGroups";
import CommissionConfig from "./pages/admin/CommissionConfig";
import Payouts from "./pages/admin/Payouts";
import Reports from "./pages/admin/Reports";
import AdminComplaints from "./pages/admin/Complaints";
import ClickStats from "./pages/admin/ClickStats";
import PaymentHistory from "./pages/admin/PaymentHistory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <RoleProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/affiliate/onboarding" element={<Onboarding />} />
            <Route element={<AppLayout />}>
              {/* Affiliate */}
              <Route path="/affiliate" element={<AffiliateDashboard />} />
              <Route path="/affiliate/getting-started" element={<GettingStarted />} />
              <Route path="/affiliate/profile" element={<Profile />} />
              <Route path="/affiliate/groups" element={<MyGroups />} />
              <Route path="/affiliate/deeplinks" element={<DeepLinks />} />
              <Route path="/affiliate/traffic" element={<Traffic />} />
              <Route path="/affiliate/conversions" element={<Conversions />} />
              <Route path="/affiliate/payout" element={<Payout />} />
              <Route path="/affiliate/statements" element={<Statements />} />
              <Route path="/affiliate/complaints" element={<Complaints />} />

              {/* Admin */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/affiliates" element={<Affiliates />} />
              <Route path="/admin/affiliate-groups" element={<AffiliateGroups />} />
              <Route path="/admin/commission-config" element={<CommissionConfig />} />
              <Route path="/admin/click-stats" element={<ClickStats />} />
              <Route path="/admin/payouts" element={<Payouts />} />
              <Route path="/admin/payment-history" element={<PaymentHistory />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/complaints" element={<AdminComplaints />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </RoleProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
