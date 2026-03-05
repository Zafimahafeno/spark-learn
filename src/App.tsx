import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Categories from "./pages/Categories";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import MyCourses from "@/pages/dashboard/student/MyCourses";
import Certificates from "@/pages/dashboard/student/Certificates";
import PaymentHistory from "@/pages/dashboard/student/PaymentHistory";
import ProfileEdit from "@/pages/dashboard/shared/ProfileEdit";
import ManageCourses from "@/pages/dashboard/instructor/ManageCourses";
import ManageCourseContent from "@/pages/dashboard/instructor/ManageCourseContent";
import InstructorStats from "@/pages/dashboard/instructor/InstructorStats";
import InstructorReviews from "@/pages/dashboard/instructor/InstructorReviews";
import ManageQuizzes from "@/pages/dashboard/instructor/ManageQuizzes";
import CourseQuiz from "@/pages/CourseQuiz";
import UserManagement from "@/pages/dashboard/admin/UserManagement";
import CategoryManagement from "@/pages/dashboard/admin/CategoryManagement";
import CourseModeration from "@/pages/dashboard/admin/CourseModeration";
import GlobalStats from "@/pages/dashboard/admin/GlobalStats";

const queryClient = new QueryClient();

const DashboardPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <DashboardLayout>{children}</DashboardLayout>
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
            <Route path="/courses" element={<Courses />} />
            <Route path="/course/:slug" element={<CourseDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/course/:slug/quiz" element={<ProtectedRoute><CourseQuiz /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Dashboard routes */}
            <Route path="/dashboard" element={<DashboardPage><DashboardHome /></DashboardPage>} />
            <Route path="/dashboard/my-courses" element={<DashboardPage><MyCourses /></DashboardPage>} />
            <Route path="/dashboard/certificates" element={<DashboardPage><Certificates /></DashboardPage>} />
            <Route path="/dashboard/payments" element={<DashboardPage><PaymentHistory /></DashboardPage>} />
            <Route path="/dashboard/profile" element={<DashboardPage><ProfileEdit /></DashboardPage>} />
            <Route path="/dashboard/manage-courses" element={<ProtectedRoute allowedRoles={["instructor", "admin"]}><DashboardLayout><ManageCourses /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/manage-courses/:courseId/content" element={<ProtectedRoute allowedRoles={["instructor", "admin"]}><DashboardLayout><ManageCourseContent /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/stats" element={<ProtectedRoute allowedRoles={["instructor", "admin"]}><DashboardLayout><InstructorStats /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/reviews" element={<ProtectedRoute allowedRoles={["instructor", "admin"]}><DashboardLayout><InstructorReviews /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/quizzes" element={<ProtectedRoute allowedRoles={["instructor", "admin"]}><DashboardLayout><ManageQuizzes /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/users" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardLayout><UserManagement /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/manage-categories" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardLayout><CategoryManagement /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/moderate-courses" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardLayout><CourseModeration /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/global-stats" element={<ProtectedRoute allowedRoles={["admin"]}><DashboardLayout><GlobalStats /></DashboardLayout></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
