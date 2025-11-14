import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Splash from "./pages/Splash";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Welcome from "./pages/Welcome";
import RoleSelect from "./pages/RoleSelect";
import Profile from "./pages/Profile";
import LibraryDashboard from "./pages/LibraryDashboard";
import TutorDashboard from "./pages/TutorDashboard";
import TrainerDashboard from "./pages/TrainerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LibraryAdminDashboard from "./pages/LibraryAdminDashboard";
import TutorialAdminDashboard from "./pages/TutorialAdminDashboard";
import TrainingAdminDashboard from "./pages/TrainingAdminDashboard";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import TrainingRegistration from "./pages/TrainingRegistration";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/trainings/:trainingId/register" element={<TrainingRegistration />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/role-select" element={<RoleSelect />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            <Route path="/library-dashboard" element={<ProtectedRoute allowedRoles={["librarian", "super_admin"]}><LibraryDashboard /></ProtectedRoute>} />
            <Route path="/tutor-dashboard" element={<ProtectedRoute allowedRoles={["tutor", "super_admin"]}><TutorDashboard /></ProtectedRoute>} />
            <Route path="/trainer-dashboard" element={<ProtectedRoute allowedRoles={["trainer", "super_admin"]}><TrainerDashboard /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={["super_admin"]}><AdminDashboard /></ProtectedRoute>} />
            
            {/* Super Admin Sub-Dashboards */}
            <Route path="/admin/library" element={<ProtectedRoute allowedRoles={["super_admin"]}><LibraryAdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/tutorial" element={<ProtectedRoute allowedRoles={["super_admin"]}><TutorialAdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/training" element={<ProtectedRoute allowedRoles={["super_admin"]}><TrainingAdminDashboard /></ProtectedRoute>} />
            
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
