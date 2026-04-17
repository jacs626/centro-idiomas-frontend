import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { enrollmentsApi } from "../../api/enrollments.api";
import { paymentsApi } from "../../api/payments.api";
import Navbar from "../../components/layout/Navbar";

interface EnrollmentProgress {
  progress: number;
  status: string;
  group: string;
  course: string;
  courseLevel: string;
}

const quickActionsAdmin = [
  {
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    label: "Cursos",
    desc: "Gestiona los cursos",
    color: "blue",
    path: "/courses",
  },
  {
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    label: "Grupos",
    desc: "Administra grupos",
    color: "purple",
    path: "/groups",
  },
  {
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    label: "Estudiantes",
    desc: "Ver estudiantes",
    color: "emerald",
    path: "/students",
  },
  {
    icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0zM7 9a2 2 0 11-4 0 2 2 0 014 0z",
    label: "Matrículas",
    desc: "Inscribir alumnos",
    color: "amber",
    path: "/enrollments",
  },
  {
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    label: "Pagos",
    desc: "Ver cobros",
    color: "rose",
    path: "/payments",
  },
  {
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    label: "Reportes",
    desc: "Estadísticas",
    color: "cyan",
    path: "/reports",
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

function AlumnoDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentProgress[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        console.log('Cargando enrollments...');
        const enrollRes = await enrollmentsApi.getMyProgress();
        console.log('Enrollments response:', enrollRes);
        console.log('Enrollments data:', enrollRes.data);
        const payRes = await paymentsApi.getMyPayments();
        console.log('Payments response:', payRes);
        setEnrollments(enrollRes.data || []);
        setPayments(payRes.data || []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeCourses = enrollments.filter(e => e.status === "active");
  const completedCourses = enrollments.filter(e => e.status === "completed");
  const pendingPayments = payments.filter(p => p.status === "pending");

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-emerald-500";
    if (progress >= 50) return "bg-amber-500";
    return "bg-indigo-500";
  };

  if (loading) {
    return (
      <Navbar>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">Cargando...</p>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          ¡Bienvenido, {user?.name || user?.email?.split("@")[0] || "Usuario"}!
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">Tu progreso en el centro de idiomas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
        <Card padding="md">
          <p className="text-sm text-slate-500">Cursos activos</p>
          <p className="text-2xl font-bold text-slate-800">{activeCourses.length}</p>
        </Card>
        <Card padding="md">
          <p className="text-sm text-slate-500">Completados</p>
          <p className="text-2xl font-bold text-slate-800">{completedCourses.length}</p>
        </Card>
        <Card padding="md">
          <p className="text-sm text-slate-500">Pagos pendientes</p>
          <p className="text-2xl font-bold text-amber-600">{pendingPayments.length}</p>
        </Card>
        <Card padding="md">
          <p className="text-sm text-slate-500">Progreso promedio</p>
          <p className="text-2xl font-bold text-indigo-600">
            {activeCourses.length > 0
              ? Math.round(activeCourses.reduce((sum, c) => sum + c.progress, 0) / activeCourses.length)
              : 0}%
          </p>
        </Card>
      </div>

      {activeCourses.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Tus cursos activos</h2>
          <div className="space-y-4">
            {activeCourses.map((enrollment, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-800">{enrollment.course}</h3>
                    <p className="text-sm text-slate-500">
                      {enrollment.courseLevel} · Grupo {enrollment.group}
                    </p>
                  </div>
                  <Badge variant="success">Activo</Badge>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Progreso</span>
                    <span className="font-medium text-slate-800">{enrollment.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getProgressColor(enrollment.progress)}`}
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                </div>
                {enrollment.progress >= 80 && (
                  <p className="text-xs text-emerald-600 font-medium mt-2">
                    ✓ Puedes solicitar tu certificado
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {completedCourses.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Cursos completados</h2>
          <div className="space-y-3">
            {completedCourses.map((enrollment, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-slate-800">{enrollment.course}</h3>
                  <p className="text-sm text-slate-500">{enrollment.courseLevel} · Grupo {enrollment.group}</p>
                </div>
                <Badge variant="info">Completado</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {pendingPayments.length > 0 && (
        <Card className="mb-6 border-l-4 border-l-amber-500">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Pagos pendientes</h2>
          <div className="space-y-3">
            {pendingPayments.map((payment, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-slate-800">{payment.description || "Pago"}</h3>
                  <p className="text-sm text-slate-500">${Number(payment.amount)}</p>
                </div>
                <Badge variant="warning">Pendiente</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {enrollments.length === 0 && payments.length === 0 && (
        <Card padding="md">
          <p className="text-slate-500 text-center">
            No tienes cursos inscritos aún. ¡Explora nuestros cursos!
          </p>
          <Link to="/courses" className="block mt-4 text-center text-indigo-600 hover:text-indigo-700 font-medium">
            Ver cursos disponibles
          </Link>
        </Card>
      )}

      <div className="flex gap-3 mt-6">
        <Link to="/courses">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Mis Cursos
          </button>
        </Link>
        <Link to="/payments">
          <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">
            Ver Pagos
          </button>
        </Link>
      </div>
    </Navbar>
  );
}

export default function DashboardPage() {
  const { isAlumno } = useAuth();

  if (isAlumno) {
    return <AlumnoDashboard />;
  }

  return (
    <Navbar>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">Bienvenido de nuevo</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {quickActionsAdmin.map((item) => (
          <Link to={item.path} key={item.label}>
            <Card hover padding="md">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${colorMap[item.color]} flex items-center justify-center mb-3 sm:mb-4`}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-slate-800">{item.label}</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{item.desc}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card padding="md">
        <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Información</h2>
        <p className="text-slate-500">Selecciona una opción del menú o las tarjetas superiores para comenzar.</p>
      </Card>
    </Navbar>
  );
}