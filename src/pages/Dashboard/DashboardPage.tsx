import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const quickActions = [
  {
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    label: "Cursos",
    desc: "Gestiona los cursos",
    color: "blue",
  },
  {
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    label: "Grupos",
    desc: "Administra grupos",
    color: "purple",
  },
  {
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    label: "Estudiantes",
    desc: "Ver estudiantes",
    color: "emerald",
  },
  {
    icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0zM7 9a2 2 0 11-4 0 2 2 0 014 0z",
    label: "Matrículas",
    desc: "Inscribir alunos",
    color: "amber",
  },
  {
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    label: "Pagos",
    desc: "Ver cobros",
    color: "rose",
  },
  {
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    label: "Reportes",
    desc: "Estadísticas",
    color: "cyan",
  },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-purple-50 text-purple-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
  cyan: "bg-cyan-50 text-cyan-600",
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
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
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 font-semibold text-xs sm:text-sm">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="hidden md:block min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate max-w-[150px]">
                    {user?.email}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>
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
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Bienvenido de nuevo
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {quickActions.map((item) => (
            <button
              key={item.label}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all text-left group"
            >
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${colorMap[item.color]} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d={item.icon}
                  />
                </svg>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-800">
                {item.label}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {item.desc}
              </p>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">
            Tu información
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-slate-50 rounded-lg">
              <p className="text-xs sm:text-sm text-slate-500 mb-1">Email</p>
              <p className="text-sm font-medium text-slate-800 truncate">
                {user?.email}
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-slate-50 rounded-lg">
              <p className="text-xs sm:text-sm text-slate-500 mb-1">Rol</p>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs sm:text-sm font-medium bg-indigo-100 text-indigo-700 capitalize">
                {user?.role}
              </span>
            </div>
            <div className="p-3 sm:p-4 bg-slate-50 rounded-lg">
              <p className="text-xs sm:text-sm text-slate-500 mb-1">ID</p>
              <p className="text-sm font-medium text-slate-800">#{user?.id}</p>
            </div>
            <div className="p-3 sm:p-4 bg-slate-50 rounded-lg">
              <p className="text-xs sm:text-sm text-slate-500 mb-1">Estado</p>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs sm:text-sm font-medium bg-emerald-100 text-emerald-700">
                Activo
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
