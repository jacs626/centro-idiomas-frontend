import { useState, useEffect } from 'react';
import { attendanceApi, type AttendanceWithCourse } from '../../api/attendance.api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import Navbar from '../../components/layout/Navbar';

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState<AttendanceWithCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await attendanceApi.getMyAttendance();
      setAttendanceData(res.data || []);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusVariant = (status: string): 'success' | 'danger' | 'warning' | 'info' => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'danger';
      case 'late': return 'warning';
      default: return 'info';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present': return 'Presente';
      case 'absent': return 'Ausente';
      case 'late': return 'Tarde';
      default: return status;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (isLoading) {
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
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Mi Asistencia</h1>
        <p className="text-slate-500 mt-1">Historial de asistencia por curso</p>
      </div>

      {attendanceData.length === 0 ? (
        <Card padding="md">
          <p className="text-slate-500 text-center">No tienes cursos inscritos aún.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {attendanceData.map((item) => {
            const total = item.attendance.length;
            const present = item.attendance.filter(a => a.status === 'present').length;
            const absent = item.attendance.filter(a => a.status === 'absent').length;
            const late = item.attendance.filter(a => a.status === 'late').length;
            const percentage = total > 0 ? Math.round((present + late) / total * 100) : 0;

            return (
              <Card key={item.enrollmentId}>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">{item.course}</h2>
                    <p className="text-sm text-slate-500">
                      {item.courseLevel} · Grupo {item.group}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0 flex gap-3 text-sm">
                    <span className="text-emerald-600 font-medium">{present} presentes</span>
                    <span className="text-amber-600 font-medium">{late} tardanzas</span>
                    <span className="text-rose-600 font-medium">{absent} ausencias</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Asistencia total</span>
                    <span className="font-medium text-slate-800">{percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${percentage >= 80 ? 'bg-emerald-500' : percentage >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {total > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-t border-slate-200">
                          <th className="py-2 text-left font-medium text-slate-600">Fecha</th>
                          <th className="py-2 text-left font-medium text-slate-600">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.attendance.map((att) => (
                          <tr key={att.id} className="border-t border-slate-100">
                            <td className="py-2 text-slate-800">{formatDate(att.date)}</td>
                            <td className="py-2">
                              <Badge variant={getStatusVariant(att.status)}>
                                {getStatusLabel(att.status)}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-4">Sin registro de asistencia aún</p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </Navbar>
  );
}