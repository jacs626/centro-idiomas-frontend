import { useState, useEffect, useMemo } from 'react';
import { reportsApi, type GroupReport, type ReportSummary } from '../../api/reports.api';
import { groupsApi, type Group } from '../../api/groups.api';
import { coursesApi, type Course } from '../../api/courses.api';
import { Card, CardContent } from '../../components/ui/Card';
import Navbar from '../../components/layout/Navbar';
import CourseGroupFilter from '../../components/filters/CourseGroupFilter';

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
  const [courses, setCourses] = useState<Course[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | ''>('');
  const [selectedGroup, setSelectedGroup] = useState<number | ''>('');
  const [groupReport, setGroupReport] = useState<GroupReport | null>(null);
  const [courseReport, setCourseReport] = useState<any[]>([]);
  const [courseGroups, setCourseGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      const groupsOfCourse = allGroups.filter(g => g.courseId === selectedCourse);
      setCourseGroups(groupsOfCourse);
      loadCourseReport();
    } else {
      setCourseReport([]);
      setCourseGroups([]);
      setGroupReport(null);
    }
  }, [selectedCourse, allGroups]);

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
      const [summaryRes, coursesRes, groupsRes] = await Promise.all([
        reportsApi.getSummary(),
        coursesApi.getAll(),
        groupsApi.getAll(),
      ]);
      setSummary(summaryRes.data);
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

  const loadCourseReport = async () => {
    if (!selectedCourse) return;
    try {
      const res = await reportsApi.getCourseReport(selectedCourse);
      setCourseReport(res.data || []);
    } catch (error) {
      console.error('Error loading course report:', error);
    }
  };

  const courseSummary = useMemo(() => {
    if (courseReport.length === 0) return null;
    const totals = courseReport.reduce((acc, g) => ({
      total: acc.total + g.total,
      active: acc.active + g.active,
      completed: acc.completed + g.completed,
      dropped: acc.dropped + g.dropped,
      progressSum: acc.progressSum + (g.avgProgress * g.total),
    }), { total: 0, active: 0, completed: 0, dropped: 0, progressSum: 0 });
    
    const avgProgress = totals.total > 0 ? Math.round(totals.progressSum / totals.total) : 0;
    const retention = totals.total > 0 
      ? Math.round(((totals.active + totals.completed) / totals.total) * 100) 
      : 0;
    
    return { total: totals.total, active: totals.active, completed: totals.completed, dropped: totals.dropped, avgProgress, retention };
  }, [courseReport]);

  const handleCourseChange = (courseId: number | '') => {
    setSelectedCourse(courseId);
    setSelectedGroup('');
  };

  const handleGroupChange = (groupId: number | '') => {
    setSelectedGroup(groupId);
  };

  const filteredGroups = useMemo(() => {
    if (!selectedCourse) return allGroups;
    return allGroups.filter(g => g.courseId === selectedCourse);
  }, [allGroups, selectedCourse]);

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
            <ProgressBar value={summary.enrollments.retention} color="bg-emerald-500" />
            <p className="text-right text-sm text-slate-600 mt-1">Retención: {formatPercent(summary.enrollments.retention)}</p>
          </CardContent>
        </Card>

        {/* 💳 PAGOS */}
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Pagos</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-3xl font-bold text-slate-900">{formatCurrency(summary.payments.totalIncome)}</p>
                <p className="text-sm text-slate-500">Ingresos</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-600">{summary.payments.paid}</p>
                <p className="text-sm text-slate-500">Pagados</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-amber-600">{summary.payments.pending}</p>
                <p className="text-sm text-slate-500">Pendientes</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-500">{summary.payments.late}</p>
                <p className="text-sm text-slate-500">Vencidos</p>
              </div>
            </div>
            <ProgressBar value={summary.payments.paidPercent} color="bg-emerald-500" />
            <p className="text-right text-sm text-slate-600 mt-1">% Pagado: {formatPercent(summary.payments.paidPercent)}</p>
          </CardContent>
        </Card>
      </div>

      {/* 📅 SELECCIONAR GRUPO PARA REPORTE DETALLADO */}
      <Card className="mt-6">
        <CardContent>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Reporte por Grupo</h2>
          <div className="mb-4">
            <CourseGroupFilter
              courses={courses}
              groups={filteredGroups}
              selectedCourse={selectedCourse}
              selectedGroup={selectedGroup ? Number(selectedGroup) : ''}
              onCourseChange={handleCourseChange}
              onGroupChange={handleGroupChange}
              coursePlaceholder="Todos los cursos"
              groupPlaceholder="Selecciona un grupo"
            />
          </div>

          {selectedCourse && !selectedGroup && courseGroups.length > 0 && (
            <div className="mt-6">
              {courseSummary && (
                <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-semibold text-slate-800 mb-4">Resumen del Curso</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { label: 'Total', value: courseSummary.total, color: '' },
                      { label: 'Activos', value: courseSummary.active, color: 'text-emerald-600' },
                      { label: 'Completados', value: courseSummary.completed, color: 'text-indigo-600' },
                      { label: 'Retirados', value: courseSummary.dropped, color: 'text-red-500' },
                      { label: 'Retención', value: formatPercent(courseSummary.retention), color: 'text-emerald-600' },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className={`text-2xl font-bold ${item.color || 'text-slate-900'}`}>{item.value}</p>
                        <p className="text-xs text-slate-500">{item.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-600">Progreso Promedio: <span className="font-bold text-indigo-600">{formatPercent(courseSummary.avgProgress)}</span></p>
                  </div>
                </div>
              )}
              
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Grupos del Curso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courseGroups.map(group => (
                  <Card 
                    key={group.id} 
                    hover 
                    className="cursor-pointer"
                    onClick={() => handleGroupChange(group.id)}
                  >
                    <CardContent>
                      <h4 className="font-semibold text-slate-800">{group.name}</h4>
                      <p className="text-sm text-slate-500">{group.schedule || 'Sin horario'}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

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
              </div>

              {/* 📊 ASISTENCIA */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-700 mb-2">Asistencia</h4>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Presentes', value: groupReport.attendance.present, color: 'text-emerald-600' },
                    { label: 'Ausentes', value: groupReport.attendance.absent, color: 'text-red-500' },
                    { label: 'Tarde', value: groupReport.attendance.late, color: 'text-amber-600' },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className={`text-xl font-bold ${item.color || 'text-slate-900'}`}>{item.value}</p>
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className="text-xs text-slate-400">
                        {item.label === 'Presentes' ? `${groupReport.attendance.presentPercent}%` :
                         item.label === 'Ausentes' ? `${groupReport.attendance.absentPercent}%` :
                         `${groupReport.attendance.latePercent}%`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 💳 PAGOS DEL GRUPO */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-700 mb-2">Pagos del Grupo</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xl font-bold text-slate-900">{formatCurrency(groupReport.payments.totalIncome)}</p>
                    <p className="text-xs text-slate-500">Ingresos</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-emerald-600">{groupReport.payments.paid}</p>
                    <p className="text-xs text-slate-500">Pagados</p>
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