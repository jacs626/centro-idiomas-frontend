import { useState, useEffect } from 'react';
import { reportsApi, type GroupsSummary, type GroupReport, type ReportSummary } from '../../api/reports.api';
import { groupsApi, type Group } from '../../api/groups.api';
import { coursesApi, type Course } from '../../api/courses.api';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import Navbar from '../../components/layout/Navbar';

function ProgressBar({ value, max = 100, color = 'bg-indigo-500' }: { value: number; max?: number; color?: string }) {
  const percent = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }} />
    </div>
  );
}

export default function ReportsPage() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [groupsSummary, setGroupsSummary] = useState<GroupsSummary[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | ''>('');
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [groupReport, setGroupReport] = useState<GroupReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadGroupReport(selectedGroup);
    } else {
      setGroupReport(null);
    }
  }, [selectedGroup]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [summaryRes, groupsSummaryRes, coursesRes, groupsRes] = await Promise.all([
        reportsApi.getSummary(),
        reportsApi.getGroupsSummary(),
        coursesApi.getAll(),
        groupsApi.getAll(),
      ]);
      setSummary(summaryRes.data);
      setGroupsSummary(groupsSummaryRes.data);
      setCourses(coursesRes.data);
      setAllGroups(groupsRes.data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGroupReport = async (groupId: number) => {
    try {
      const res = await reportsApi.getGroupReport(groupId);
      setGroupReport(res.data);
    } catch (error) {
      console.error('Error loading group report:', error);
    }
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId ? Number(courseId) : '');
    setSelectedGroup(null);
};

  const filteredGroups = selectedCourse 
    ? allGroups.filter(g => g.courseId === selectedCourse)
    : allGroups;

  const formatPercent = (value: number) => `${Math.round(value)}%`;
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);

  if (isLoading || !summary) {
    return (
      <Navbar>
        <div className="text-center py-8 text-slate-500">Cargando...</div>
      </Navbar>
    );
  }

  return (
    <Navbar>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Reportes</h1>
        <p className="text-slate-500 mt-1">Resumen general del sistema</p>
      </div>

      {/* 📊 RESUMEN GENERAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 🎯 INSCRIPCIONES */}
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Inscripciones</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-3xl font-bold text-slate-900">{summary.enrollments.total}</p>
                <p className="text-sm text-slate-500">Total</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-600">{summary.enrollments.active}</p>
                <p className="text-sm text-slate-500">Activos</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-indigo-600">{summary.enrollments.completed}</p>
                <p className="text-sm text-slate-500">Completados</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-500">{summary.enrollments.dropped}</p>
                <p className="text-sm text-slate-500">Retirados</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Retención</span>
                <span className="font-semibold">{formatPercent(summary.enrollments.retention)}</span>
              </div>
              <ProgressBar value={summary.enrollments.retention} color="bg-emerald-500" />
            </div>
          </CardContent>
        </Card>

        {/* 💰 PAGOS */}
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Pagos</h2>
            <div className="mb-4">
              <p className="text-3xl font-bold text-emerald-600">{formatCurrency(summary.payments.totalIncome)}</p>
              <p className="text-sm text-slate-500">Ingresos totales</p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Pagado', value: summary.payments.paidPercent, color: 'bg-emerald-500' },
                { label: 'Pendiente', value: summary.payments.pendingPercent, color: 'bg-amber-500' },
                { label: 'Vencido', value: summary.payments.latePercent, color: 'bg-red-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-semibold">{formatPercent(item.value)}</span>
                  </div>
                  <ProgressBar value={item.value} color={item.color} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 📅 SELECCIONAR GRUPO PARA REPORTE DETALLADO */}
      <Card className="mt-6">
        <CardContent>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Reporte por Grupo</h2>
          <div className="flex flex-wrap gap-4 mb-4">
            <select
              value={selectedCourse}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Todos los cursos</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={selectedGroup || ''}
              onChange={(e) => setSelectedGroup(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Selecciona un grupo</option>
              {filteredGroups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          {groupReport && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-800">{groupReport.groupName}</h3>
                <p className="text-sm text-slate-500">{groupReport.courseName}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'Total', value: groupReport.enrollments.total },
                  { label: 'Activos', value: groupReport.enrollments.active, color: 'text-emerald-600' },
                  { label: 'Completados', value: groupReport.enrollments.completed, color: 'text-indigo-600' },
                  { label: 'Retirados', value: groupReport.enrollments.dropped, color: 'text-red-500' },
                  { label: 'Retención', value: formatPercent(groupReport.enrollments.retention), color: 'text-emerald-600' },
                ].map((item) => (
                  <div key={item.label}>
                    <p className={`text-2xl font-bold ${item.color || 'text-slate-900'}`}>{item.value}</p>
                    <p className="text-xs text-slate-500">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* 📊 PROMEDIO PROGRESO */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-700 mb-2">Progreso Promedio</h4>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-indigo-600">{formatPercent(groupReport.avgProgress)}</span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={groupReport.avgProgress} color="bg-indigo-500" />
                </div>
              </div>

              {/* 👨‍🎓 ASISTENCIA */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Presente', value: groupReport.attendance.presentPercent, color: 'bg-emerald-500' },
                  { label: 'Ausente', value: groupReport.attendance.absentPercent, color: 'bg-red-500' },
                  { label: 'Tarde', value: groupReport.attendance.latePercent, color: 'bg-amber-500' },
                ].map((item) => (
                  <div key={item.label} className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xl font-bold text-slate-800">{formatPercent(item.value)}</div>
                    <div className="text-sm text-slate-500">{item.label}</div>
                  </div>
                ))}
              </div>

              {/* 💰 PAGOS DEL GRUPO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-xl font-bold text-emerald-600">{formatCurrency(groupReport.payments.totalIncome)}</div>
                  <div className="text-sm text-slate-500">Ingresos del grupo</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-sm text-slate-500 mb-2">Estado de Pagos</div>
                  <ProgressBar value={groupReport.payments.paidPercent} color="bg-emerald-500" />
                  <div className="flex justify-between text-xs mt-1">
                    <span>Pagado: {formatPercent(groupReport.payments.paidPercent)}</span>
                    <span>Pendiente: {formatPercent(groupReport.payments.pendingPercent)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Navbar>
  );
}