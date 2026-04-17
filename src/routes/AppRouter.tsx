import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginPage from "../pages/Login/LoginPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import CoursesPage from "../pages/Courses/CoursesPage";
import GroupsPage from "../pages/Groups/GroupsPage";
import EnrollmentsPage from "../pages/Enrollments/EnrollmentsPage";
import AttendancePage from "../pages/Attendance/AttendancePage";
import ProfilePage from "../pages/Profile/ProfilePage";

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
        <EnrollmentsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/reports",
    element: (
      <ProtectedRoute>
        <DashboardPage />
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
    path: "/",
    element: <Navigate to="/login" />,
  },
]);