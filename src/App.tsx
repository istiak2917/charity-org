import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import SiteSettingsLoader from "@/components/SiteSettingsLoader";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import SupportChatWidget from "@/components/SupportChatWidget";
import MemberLayout from "@/pages/member/MemberLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import GalleryPage from "./pages/GalleryPage";
import ReportsPage from "./pages/ReportsPage";
import TransparencyPage from "./pages/TransparencyPage";
import BloodPage from "./pages/BloodPage";

// Public route pages
import EventsPage from "./pages/public/EventsPage";
import EventDetailPage from "./pages/public/EventDetailPage";
import BlogPage from "./pages/public/BlogPage";
import BlogDetailPage from "./pages/public/BlogDetailPage";
import ProjectsPage from "./pages/public/ProjectsPage";
import ProjectDetailPage from "./pages/public/ProjectDetailPage";
import VolunteersPage from "./pages/public/VolunteersPage";
import DonationsPage from "./pages/public/DonationsPage";
import InventoryPage from "./pages/public/InventoryPage";
import PolicyPage from "./pages/public/PolicyPage";
import MapPage from "./pages/public/MapPage";
import PublicAPI from "./pages/public/PublicAPI";
import RecurringDonationPage from "./pages/public/RecurringDonationPage";
import PaymentResultPage from "./pages/public/PaymentResultPage";
import TestimonialsPage from "./pages/public/TestimonialsPage";
// Admin pages
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
import DonorCRM from "./pages/admin/DonorCRM";
import BeneficiaryManager from "./pages/admin/BeneficiaryManager";
import InventoryManager from "./pages/admin/InventoryManager";
import BranchManager from "./pages/admin/BranchManager";
import AnalyticsEngine from "./pages/admin/AnalyticsEngine";
import BackupManager from "./pages/admin/BackupManager";
import PageManager from "./pages/admin/PageManager";
import NewsletterManager from "./pages/admin/NewsletterManager";
import SponsorshipManager from "./pages/admin/SponsorshipManager";
import GrantManager from "./pages/admin/GrantManager";
import EmergencyCampaign from "./pages/admin/EmergencyCampaign";
import CaseTracker from "./pages/admin/CaseTracker";
import VolunteerCalendar from "./pages/admin/VolunteerCalendar";
import AttendanceTracker from "./pages/admin/AttendanceTracker";
import DocumentVault from "./pages/admin/DocumentVault";
import ImpactDashboard from "./pages/admin/ImpactDashboard";
import NotificationQueue from "./pages/admin/NotificationQueue";
import DirectoryManager from "./pages/admin/DirectoryManager";
import FormBuilder from "./pages/admin/FormBuilder";
import PollManager from "./pages/admin/PollManager";
import FAQReviewManager from "./pages/admin/FAQReviewManager";
import EmailTemplateManager from "./pages/admin/EmailTemplateManager";
import WebhookManager from "./pages/admin/WebhookManager";
import ABTestManager from "./pages/admin/ABTestManager";
import AdvancedReporting from "./pages/admin/AdvancedReporting";
import SessionManager from "./pages/admin/SessionManager";
import DirectoryPage from "./pages/public/DirectoryPage";
import FormPage from "./pages/public/FormPage";
import PollPage from "./pages/public/PollPage";

import MemberProfile from "./pages/member/MemberProfile";
import MemberDonations from "./pages/member/MemberDonations";
import VolunteerPanel from "./pages/member/VolunteerPanel";
import ChatPage from "./pages/member/ChatPage";

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
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <LanguageProvider>
        <CurrencyProvider>
        <AuthProvider>
        <SiteSettingsLoader>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/transparency" element={<TransparencyPage />} />
            <Route path="/blood" element={<BloodPage />} />

            {/* Public Dynamic Routes */}
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:slug" element={<EventDetailPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:slug" element={<ProjectDetailPage />} />
            <Route path="/volunteers" element={<VolunteersPage />} />
            <Route path="/donations" element={<DonationsPage />} />
            <Route path="/recurring-donation" element={<RecurringDonationPage />} />
            <Route path="/payment/result" element={<PaymentResultPage />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/page/:slug" element={<PolicyPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/api" element={<PublicAPI />} />
            <Route path="/directory/:slug" element={<DirectoryPage />} />
            <Route path="/forms/:slug" element={<FormPage />} />
            <Route path="/polls" element={<PollPage />} />

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
            <Route path="/admin/donor-crm" element={<AdminRoute><DonorCRM /></AdminRoute>} />
            <Route path="/admin/beneficiaries" element={<AdminRoute><BeneficiaryManager /></AdminRoute>} />
            <Route path="/admin/inventory" element={<AdminRoute><InventoryManager /></AdminRoute>} />
            <Route path="/admin/branches" element={<AdminRoute><BranchManager /></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute><AnalyticsEngine /></AdminRoute>} />
            <Route path="/admin/backup" element={<AdminRoute><BackupManager /></AdminRoute>} />
            <Route path="/admin/pages" element={<AdminRoute><PageManager /></AdminRoute>} />
            <Route path="/admin/newsletter" element={<AdminRoute><NewsletterManager /></AdminRoute>} />
            <Route path="/admin/sponsorships" element={<AdminRoute><SponsorshipManager /></AdminRoute>} />
            <Route path="/admin/grants" element={<AdminRoute><GrantManager /></AdminRoute>} />
            <Route path="/admin/emergency" element={<AdminRoute><EmergencyCampaign /></AdminRoute>} />
            <Route path="/admin/cases" element={<AdminRoute><CaseTracker /></AdminRoute>} />
            <Route path="/admin/volunteer-calendar" element={<AdminRoute><VolunteerCalendar /></AdminRoute>} />
            <Route path="/admin/attendance" element={<AdminRoute><AttendanceTracker /></AdminRoute>} />
            <Route path="/admin/documents" element={<AdminRoute><DocumentVault /></AdminRoute>} />
            <Route path="/admin/impact" element={<AdminRoute><ImpactDashboard /></AdminRoute>} />
            <Route path="/admin/notifications" element={<AdminRoute><NotificationQueue /></AdminRoute>} />
            <Route path="/admin/directories" element={<AdminRoute><DirectoryManager /></AdminRoute>} />
            <Route path="/admin/forms" element={<AdminRoute><FormBuilder /></AdminRoute>} />
            <Route path="/admin/polls" element={<AdminRoute><PollManager /></AdminRoute>} />
            <Route path="/admin/faq-reviews" element={<AdminRoute><FAQReviewManager /></AdminRoute>} />
            <Route path="/admin/email-templates" element={<AdminRoute><EmailTemplateManager /></AdminRoute>} />
            <Route path="/admin/webhooks" element={<AdminRoute><WebhookManager /></AdminRoute>} />
            <Route path="/admin/ab-testing" element={<AdminRoute><ABTestManager /></AdminRoute>} />
            <Route path="/admin/advanced-reports" element={<AdminRoute><AdvancedReporting /></AdminRoute>} />
            <Route path="/admin/sessions" element={<AdminRoute><SessionManager /></AdminRoute>} />

            {/* Member Routes */}
            <Route path="/member" element={<MemberRoute><MemberProfile /></MemberRoute>} />
            <Route path="/member/donations" element={<MemberRoute><MemberDonations /></MemberRoute>} />
            <Route path="/member/volunteer" element={<MemberRoute><VolunteerPanel /></MemberRoute>} />
            <Route path="/member/chat" element={<MemberRoute><ChatPage /></MemberRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          <WhatsAppFloat />
          <SupportChatWidget />
        </SiteSettingsLoader>
        </AuthProvider>
        </CurrencyProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
export default App;
