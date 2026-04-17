import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import CoursesPage from "../pages/Courses/CoursesPage";
import GroupsPage from "../pages/Groups/GroupsPage";
import EnrollmentsPage from "../pages/Enrollments/EnrollmentsPage";
import AttendancePage from "../pages/Attendance/AttendancePage";
import ProfilePage from "../pages/Profile/ProfilePage";
import PaymentsPage from "../pages/Payments/PaymentsPage";
import CertificatesPage from "../pages/Certificates/CertificatesPage";
import AdminCertificatesPage from "../pages/Certificates/AdminCertificatesPage";
import ReportsPage from "../pages/Reports/ReportsPage";
import NotificationsPage from "../pages/Notifications/NotificationsPage";

function AdminReportsRedirect() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/dashboard" />;
  return <ReportsPage />;
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();

  if (isLoading) return <div>Cargando...</div>;
  if (!token) return <Navigate to="/login" />;

  return <>{children}</>;
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();

  if (isLoading) return <div>Cargando...</div>;
  if (token) return <Navigate to="/dashboard" />;

  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/courses",
    element: (
      <ProtectedRoute>
        <CoursesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/groups",
    element: (
      <ProtectedRoute>
        <GroupsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/enrollments",
    element: (
      <ProtectedRoute>
        <EnrollmentsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payments",
    element: (
      <ProtectedRoute>
        <PaymentsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/reports",
    element: (
      <ProtectedRoute>
        <AdminReportsRedirect />
      </ProtectedRoute>
    ),
  },
  {
    path: "/attendance",
    element: (
      <ProtectedRoute>
        <AttendancePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/certificates",
    element: (
      <ProtectedRoute>
        <CertificatesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin-certificates",
    element: (
      <ProtectedRoute>
        <AdminCertificatesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/notifications",
    element: (
      <ProtectedRoute>
        <NotificationsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/",
    element: <Navigate to="/login" />,
  },
]);