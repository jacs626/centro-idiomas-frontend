import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  notificationsApi,
  type Notification,
} from "../../api/notifications.api";

const STORAGE_KEY = "seenNotifications";

const allNavItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    roles: [],
  },
  {
    path: "/courses",
    label: "Mis Cursos",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    roles: [],
  },
  {
    path: "/attendance",
    label: "Asistencia",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    roles: [],
  },
  {
    path: "/notifications",
    label: "Notificaciones",
    icon: "M15 17h5m-3-4V5a2 2 0 00-2-2H8l-2 2v4l-2 2v4a2 2 0 002 2h6m4 0V10m0 0h2m-2-2l2 2m-2-2l-2-2V7a2 2 0 012-2h2",
    roles: [],
  },
  {
    path: "/payments",
    label: "Pagos",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    roles: [],
  },
  {
    path: "/certificates",
    label: "Certificados",
    icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 114.834 0 6.585 6.585 0 010 8.607m9.321 0a3.42 3.42 0 00-4.834 0 6.585 6.585 0 010-8.607",
    roles: ["alumno", "admin", "profesor"],
  },
  {
    path: "/groups",
    label: "Grupos",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    roles: ["admin", "profesor"],
  },
  {
    path: "/enrollments",
    label: "Matrículas",
    icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0zM7 9a2 2 0 11-4 0 2 2 0 014 0z",
    roles: ["admin", "profesor"],
  },
  {
    path: "/reports",
    label: "Reportes",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    roles: ["admin"],
  },
];

interface NavbarProps {
  children: React.ReactNode;
}

export default function Navbar({ children }: NavbarProps) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const getSeenIds = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const getUnseenNotifications = () => {
    const seenIds = getSeenIds();
    return notifications.filter((n) => !seenIds.includes(n.id));
  };

  const markAsSeen = (id: string) => {
    const seenIds = getSeenIds();
    if (!seenIds.includes(id)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...seenIds, id]));
      setNotifications([...notifications]);
    }
  };

  const markAllAsSeen = () => {
    const ids = notifications.map((n) => n.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    setNotifications([...notifications]);
  };

  useEffect(() => {
    const loadNotifs = async () => {
      try {
        const res = await notificationsApi.getMyNotifications();
        setNotifications(res.data || []);
      } catch (e) {
        console.error("Error loading notifs:", e);
      }
    };
    loadNotifs();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getVisibleNavItems = () => {
    return allNavItems.filter((item) => {
      if (!item.roles || item.roles.length === 0) return true;
      if (isAdmin) return true;
      return item.roles.includes(user?.role || "");
    });
  };

  const navItems = getVisibleNavItems();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    />
                  </svg>
                </div>
                <span className="text-lg font-bold text-slate-800 hidden sm:block">
                  Centro de Idiomas
                </span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Notificaciones"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5m-3-4V5a2 2 0 00-2-2H8l-2 2v4l-2 2v4a2 2 0 002 2h6m4 0V10m0 0h2m-2-2l2 2m-2-2l-2-2V7a2 2 0 012-2h2"
                    />
                  </svg>
                  {getUnseenNotifications().length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {getUnseenNotifications().length}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-50">
                    <div className="p-3 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-semibold text-slate-800">
                        Notificaciones
                      </h3>
                      {getUnseenNotifications().length > 0 && (
                        <button
                          onClick={markAllAsSeen}
                          className="text-xs text-indigo-600 hover:text-indigo-700"
                        >
                          Marcar todo visto
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-sm text-slate-500 text-center">
                          Sin notificaciones
                        </p>
                      ) : (
                        notifications.slice(0, 10).map((n) => {
                          const isSeen = getSeenIds().includes(n.id);
                          return (
                            <div
                              key={n.id}
                              className={`p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer ${!isSeen ? "bg-indigo-50/30" : ""}`}
                              onClick={() => {
                                markAsSeen(n.id);
                                navigate("/notifications");
                                setIsNotifOpen(false);
                              }}
                            >
                              <div className="flex items-start gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                    n.type === "payment"
                                      ? "bg-amber-500"
                                      : n.type === "certificate"
                                        ? "bg-emerald-500"
                                        : n.type === "progress"
                                          ? "bg-red-500"
                                          : "bg-indigo-500"
                                  }`}
                                />
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-sm ${!isSeen ? "font-semibold" : ""} text-slate-800`}
                                  >
                                    {n.title}
                                  </p>
                                  <p className="text-xs text-slate-500 truncate">
                                    {n.message}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/profile"
                className="flex items-center gap-2 sm:gap-3 hover:bg-slate-50 p-1 -m-1 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 font-semibold text-xs sm:text-sm">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="hidden lg:block min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate max-w-[150px]">
                    {user?.email}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {user?.role}
                  </p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>

              <button
                className="md:hidden p-2 text-slate-600"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav className="md:hidden border-t border-slate-200 px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === item.path
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
