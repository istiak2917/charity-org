import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import MemberLayout from "@/pages/member/MemberLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import GalleryPage from "./pages/GalleryPage";
import ReportsPage from "./pages/ReportsPage";
import BloodPage from "./pages/BloodPage";
import AdminHome from "./pages/admin/AdminHome";
import ProjectManager from "./pages/admin/ProjectManager";
import DonationManager from "./pages/admin/DonationManager";
import CampaignManager from "./pages/admin/CampaignManager";
import FinanceManager from "./pages/admin/FinanceManager";
import VolunteerManager from "./pages/admin/VolunteerManager";
import VolunteerTaskManager from "./pages/admin/VolunteerTaskManager";
import EventManager from "./pages/admin/EventManager";
import BlogManager from "./pages/admin/BlogManager";
import GalleryManager from "./pages/admin/GalleryManager";
import TeamManager from "./pages/admin/TeamManager";
import BloodRequestManager from "./pages/admin/BloodRequestManager";
import ReportsManager from "./pages/admin/ReportsManager";
import ContactInbox from "./pages/admin/ContactInbox";
import RoleManager from "./pages/admin/RoleManager";
import SettingsPage from "./pages/admin/SettingsPage";
import HomepageBuilder from "./pages/admin/HomepageBuilder";
import AuditLogViewer from "./pages/admin/AuditLogViewer";
import SeedData from "./pages/admin/SeedData";
import MemberProfile from "./pages/member/MemberProfile";
import MemberDonations from "./pages/member/MemberDonations";
import VolunteerPanel from "./pages/member/VolunteerPanel";

const queryClient = new QueryClient();

const AdminRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute requiredRole="admin">
    <AdminLayout>{children}</AdminLayout>
  </ProtectedRoute>
);

const MemberRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <MemberLayout>{children}</MemberLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/blood" element={<BloodPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminHome /></AdminRoute>} />
            <Route path="/admin/projects" element={<AdminRoute><ProjectManager /></AdminRoute>} />
            <Route path="/admin/donations" element={<AdminRoute><DonationManager /></AdminRoute>} />
            <Route path="/admin/campaigns" element={<AdminRoute><CampaignManager /></AdminRoute>} />
            <Route path="/admin/finance" element={<AdminRoute><FinanceManager /></AdminRoute>} />
            <Route path="/admin/volunteers" element={<AdminRoute><VolunteerManager /></AdminRoute>} />
            <Route path="/admin/tasks" element={<AdminRoute><VolunteerTaskManager /></AdminRoute>} />
            <Route path="/admin/events" element={<AdminRoute><EventManager /></AdminRoute>} />
            <Route path="/admin/blood" element={<AdminRoute><BloodRequestManager /></AdminRoute>} />
            <Route path="/admin/blog" element={<AdminRoute><BlogManager /></AdminRoute>} />
            <Route path="/admin/gallery" element={<AdminRoute><GalleryManager /></AdminRoute>} />
            <Route path="/admin/team" element={<AdminRoute><TeamManager /></AdminRoute>} />
            <Route path="/admin/reports" element={<AdminRoute><ReportsManager /></AdminRoute>} />
            <Route path="/admin/messages" element={<AdminRoute><ContactInbox /></AdminRoute>} />
            <Route path="/admin/roles" element={<AdminRoute><RoleManager /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
            <Route path="/admin/homepage" element={<AdminRoute><HomepageBuilder /></AdminRoute>} />
            <Route path="/admin/audit" element={<AdminRoute><AuditLogViewer /></AdminRoute>} />
            <Route path="/admin/seed" element={<AdminRoute><SeedData /></AdminRoute>} />

            {/* Member Routes */}
            <Route path="/member" element={<MemberRoute><MemberProfile /></MemberRoute>} />
            <Route path="/member/donations" element={<MemberRoute><MemberDonations /></MemberRoute>} />
            <Route path="/member/volunteer" element={<MemberRoute><VolunteerPanel /></MemberRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
