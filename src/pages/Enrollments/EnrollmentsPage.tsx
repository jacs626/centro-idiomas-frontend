import { useState, useEffect } from 'react';
import { enrollmentsApi, type Enrollment, type CreateEnrollmentDto } from '../../api/enrollments.api';
import { groupsApi, type Group } from '../../api/groups.api';
import { coursesApi, type Course } from '../../api/courses.api';
import { usersApi } from '../../api/users.api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  active: 'success',
  completed: 'info',
  dropped: 'danger',
};

const statusLabels: Record<string, string> = {
  active: 'Activo',
  completed: 'Completado',
  dropped: 'Retirado',
};

interface EnrollmentWithDetails extends Enrollment {
  courseName: string;
  courseLevel: string;
  groupName: string;
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateEnrollmentDto>({
    userId: 0,
    groupId: 0,
  });

  const { canManageGroups, isAdmin, isProfesor, user, isAlumno } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      let enrollmentsData: Enrollment[];
      
      if (isAdmin || isProfesor) {
        const response = await enrollmentsApi.getAll();
        enrollmentsData = response.data;
      } else if (user) {
        const response = await enrollmentsApi.getByUser(user.id);
        enrollmentsData = response.data;
      } else {
        enrollmentsData = [];
      }
      
      const [groupsRes, coursesRes, usersRes] = await Promise.all([
        groupsApi.getAll(),
        coursesApi.getAll(),
        usersApi.getAll(),
      ]);
      
      const groupsMap = groupsRes.data.reduce((acc, g) => {
        acc[g.id] = g;
        return acc;
      }, {} as Record<number, Group>);
      
      const coursesMap = coursesRes.data.reduce((acc, c) => {
        acc[c.id] = c;
        return acc;
      }, {} as Record<number, Course>);
      
      const enrichedEnrollments = enrollmentsData.map(e => {
        const group = groupsMap[e.groupId];
        const course = group ? coursesMap[group.courseId] : null;
        return {
          ...e,
          courseName: course?.name || 'Sin curso',
          courseLevel: course?.level || '',
          groupName: group?.name || `Grupo #${e.groupId}`,
        };
      });
      
      setEnrollments(enrichedEnrollments);
      setGroups(groupsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await enrollmentsApi.create(formData);
      setShowForm(false);
      setFormData({ userId: 0, groupId: 0 });
      loadData();
    } catch (error) {
      console.error('Error creating enrollment:', error);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await enrollmentsApi.update(id, { status });
      loadData();
    } catch (error) {
      console.error('Error updating enrollment:', error);
    }
  };

  const getUserName = (userId: number) => {
    const u = users.find(user => user.id === userId);
    return u ? u.name : `Usuario #${userId}`;
  };

  if (isAlumno && enrollments.length > 0) {
    return (
      <Navbar>
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Mis Cursos</h1>
          <p className="text-slate-500 mt-1">Tu progreso en los cursos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map((e) => (
            <Card key={e.id} hover padding="md">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-slate-800">{e.courseName}</h3>
                  <p className="text-sm text-slate-500">{e.courseLevel}</p>
                </div>
                <Badge variant={statusColors[e.status]}>{statusLabels[e.status]}</Badge>
              </div>
              
              <p className="text-sm text-slate-600 mb-3">Grupo: {e.groupName}</p>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Progreso</span>
                  <span className="font-medium text-slate-800">{e.progress}%</span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      e.progress >= 80 ? 'bg-emerald-500' : 
                      e.progress >= 50 ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${e.progress}%` }}
                  />
                </div>
              </div>
              
              {e.progress >= 80 && e.status === 'active' && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-emerald-600 font-medium">
                    ✓ Puedes solicitar tu certificado
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </Navbar>
    );
  }

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'userId', header: 'Alumno', render: (e: EnrollmentWithDetails) => isAdmin || isProfesor ? getUserName(e.userId) : 'Tú' },
    { key: 'groupId', header: 'Grupo', render: (e: EnrollmentWithDetails) => e.groupName },
    { key: 'course', header: 'Curso', render: (e: EnrollmentWithDetails) => `${e.courseName} (${e.courseLevel})` },
    { 
      key: 'progress', 
      header: 'Progreso', 
      render: (e: EnrollmentWithDetails) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${e.progress}%` }} />
          </div>
          <span className="text-sm">{e.progress}%</span>
        </div>
      )
    },
    { 
      key: 'status', 
      header: 'Estado', 
      render: (e: EnrollmentWithDetails) => (
        <Badge variant={statusColors[e.status] as 'default' | 'success' | 'warning' | 'danger' | 'info'}>
          {statusLabels[e.status]}
        </Badge>
      )
    },
    ...(canManageGroups ? [{
      key: 'actions',
      header: 'Acciones',
      render: (e: EnrollmentWithDetails) => (
        <div className="flex gap-1">
          {e.status === 'active' && (
            <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(e.id, 'completed')}>
              Completar
            </Button>
          )}
          {e.status === 'active' && (
            <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(e.id, 'dropped')}>
              Retirar
            </Button>
          )}
        </div>
      ),
    }] : []),
  ];

  return (
    <Navbar>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Matrículas</h1>
          <p className="text-slate-500 mt-1">
            {isAdmin || isProfesor ? 'Gestiona las inscripciones de alumnos' : 'Tus inscripciones'}
          </p>
        </div>
        {canManageGroups && (
          <Button onClick={() => { setShowForm(true); setFormData({ userId: 0, groupId: 0 }); }}>
            + Nueva Matrícula
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nueva Matrícula</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alumno</label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                >
                  <option value={0}>Selecciona un alumno</option>
                  {users.filter(u => u.role === 'alumno').map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Grupo</label>
                <select
                  value={formData.groupId}
                  onChange={(e) => setFormData({ ...formData, groupId: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                >
                  <option value={0}>Selecciona un grupo</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Inscribir
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card padding="none">
        <Table columns={columns} data={enrollments} isLoading={isLoading} emptyMessage="No hay matrículas" />
      </Card>
    </Navbar>
  );
}