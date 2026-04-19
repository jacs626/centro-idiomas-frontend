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
import UsersPage from "../pages/Users/UsersPage";
import StudentsPage from "../pages/Students/StudentsPage";

function AdminReportsRedirect() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/dashboard" />;
  return <ReportsPage />;
}

export function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { token, isLoading, user } = useAuth();

  if (isLoading) return <div>Cargando...</div>;
  if (!token) return <Navigate to="/login" />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

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
      <ProtectedRoute allowedRoles={['admin', 'profesor', 'alumno']}>
        <CoursesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/groups",
    element: (
      <ProtectedRoute allowedRoles={['admin', 'profesor']}>
        <GroupsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/enrollments",
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <EnrollmentsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payments",
    element: (
      <ProtectedRoute allowedRoles={['admin', 'alumno']}>
        <PaymentsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/reports",
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminReportsRedirect />
      </ProtectedRoute>
    ),
  },
  {
    path: "/attendance",
    element: (
      <ProtectedRoute allowedRoles={['admin', 'profesor', 'alumno']}>
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
      <ProtectedRoute allowedRoles={['admin', 'profesor', 'alumno']}>
        <CertificatesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin-certificates",
    element: (
      <ProtectedRoute allowedRoles={['admin', 'profesor']}>
        <AdminCertificatesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/notifications",
    element: (
      <ProtectedRoute allowedRoles={['admin', 'profesor', 'alumno']}>
        <NotificationsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/users",
    element: (
      <ProtectedRoute allowedRoles={['admin', 'profesor']}>
        <UsersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/students",
    element: (
      <ProtectedRoute allowedRoles={['admin', 'profesor']}>
        <StudentsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/",
    element: <Navigate to="/login" />,
  },
]);