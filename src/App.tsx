import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AcademicStructureProvider } from "./context/AcademicStructureContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { NotificationToast } from "./components/notifications";
import Splash from "./pages/Splash";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Welcome from "./pages/Welcome";
import RoleSelect from "./pages/RoleSelect";
import Profile from "./pages/Profile";
import DigitalLibrary from "./pages/DigitalLibrary";
import TutorDashboard from "./pages/TutorDashboard";
import TrainerDashboard from "./pages/TrainerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LibraryAdminDashboard from "./pages/LibraryAdminDashboard";
import TutorialAdminDashboard from "./pages/TutorialAdminDashboard";
import TrainingAdminDashboard from "./pages/TrainingAdminDashboard";
import ResourceAdminDashboard from "./pages/ResourceAdminDashboard";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import TrainingRegistration from "./pages/TrainingRegistration";
import TutorialRegistration from "./pages/TutorialRegistration";
import NotificationsPage from "./pages/NotificationsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <AcademicStructureProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <NotificationToast />
              <Routes>
                <Route path="/" element={<Splash />} />
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/trainings/:trainingId/register" element={<TrainingRegistration />} />
                <Route path="/tutorials/:tutorialId/register" element={<TutorialRegistration />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/role-select" element={<RoleSelect />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                
                <Route path="/digital-library/*" element={<DigitalLibrary />} />
                <Route path="/tutor-dashboard" element={<ProtectedRoute allowedRoles={["tutor", "super_admin"]}><TutorDashboard /></ProtectedRoute>} />
                <Route path="/trainer-dashboard" element={<ProtectedRoute allowedRoles={["trainer", "super_admin"]}><TrainerDashboard /></ProtectedRoute>} />
                <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={["super_admin"]}><AdminDashboard /></ProtectedRoute>} />
                
                {/* Admin Dashboards - Protected by email AND role */}
                <Route path="/admin/library" element={<ProtectedRoute adminRoute="library"><LibraryAdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/tutorial" element={<ProtectedRoute adminRoute="tutorial"><TutorialAdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/training" element={<ProtectedRoute adminRoute="training"><TrainingAdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/resources" element={<ProtectedRoute allowedRoles={["super_admin"]}><ResourceAdminDashboard /></ProtectedRoute>} />
                
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AcademicStructureProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
