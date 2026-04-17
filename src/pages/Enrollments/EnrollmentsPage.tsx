import { useState, useEffect } from 'react';
import { enrollmentsApi, type Enrollment, type CreateEnrollmentDto } from '../../api/enrollments.api';
import { groupsApi, type Group } from '../../api/groups.api';
import { coursesApi, type Course } from '../../api/courses.api';
import { usersApi } from '../../api/users.api';
import { certificatesApi } from '../../api/certificates.api';
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
  group?: {
    id: number;
    name: string;
    courseId: number;
  };
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [allEnrollments, setAllEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateEnrollmentDto>({
    userId: 0,
    groupId: 0,
  });
  const [formCourseId, setFormCourseId] = useState<number | ''>('');
  const [filterGroup, setFilterGroup] = useState<number | ''>('');
  const [filterCourse, setFilterCourse] = useState<number | ''>('');

  const { canManageGroups, isAdmin, isProfesor, user, isAlumno } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filterGroup, filterCourse, allEnrollments]);

  const applyFilters = () => {
    let filtered = [...allEnrollments];
    
    if (filterGroup) {
      filtered = filtered.filter(e => e.groupId === filterGroup);
    }
    
    if (filterCourse) {
      filtered = filtered.filter(e => e.group?.courseId === filterCourse);
    }
    
    setEnrollments(filtered);
  };

  const loadData = async () => {
    try {
      let enrollmentsData: any[];
      let groupsData: Group[];
      
      if (isAdmin) {
        const [enrollRes, groupsRes, coursesRes, usersRes] = await Promise.all([
          enrollmentsApi.getAll(),
          groupsApi.getAll(),
          coursesApi.getAll(),
          usersApi.getAll(),
        ]);
        enrollmentsData = enrollRes.data;
        groupsData = groupsRes.data;
        setCourses(coursesRes.data);
        setUsers(usersRes.data);
      } else if (isProfesor && user) {
        const groupsRes = await groupsApi.getAll();
        groupsData = groupsRes.data.filter((g: Group) => g.teacherId === user.id);
        const groupIds = groupsData.map((g: Group) => g.id);
        
        const enrollRes = await enrollmentsApi.getAll();
        enrollmentsData = enrollRes.data.filter((e: Enrollment) => groupIds.includes(e.groupId));
        
        const courseIds = [...new Set(groupsData.map((g: Group) => g.courseId))];
        const coursesRes = await coursesApi.getAll();
        setCourses(coursesRes.data.filter((c: Course) => courseIds.includes(c.id)));
        
        const userIds = [...new Set(enrollmentsData.map((e: Enrollment) => e.userId))];
        const usersRes = await usersApi.getAll();
        setUsers(usersRes.data.filter((u: User) => userIds.includes(u.id)));
      } else if (user) {
        const response = await enrollmentsApi.getByUser(user.id);
        enrollmentsData = response.data;
        const groupsRes = await groupsApi.getAll();
        groupsData = groupsRes.data;
        const coursesRes = await coursesApi.getAll();
        setCourses(coursesRes.data);
        const usersRes = await usersApi.getAll();
        setUsers(usersRes.data);
      } else {
        enrollmentsData = [];
        groupsData = [];
      }
      
      const groupsMap = groupsData.reduce((acc, g) => {
        acc[g.id] = g;
        return acc;
      }, {} as Record<number, Group>);
      
      const coursesMap = courses.reduce((acc, c) => {
        acc[c.id] = c;
        return acc;
      }, {} as Record<number, Course>);
      
      const enrichedEnrollments = enrollmentsData.map((e: any) => {
        const groupData = groupsMap[e.groupId];
        const course = (e as any).group?.course || (groupData ? coursesMap[groupData.courseId] : null);
        return {
          ...e,
          group: groupData,
          courseName: course?.name || 'Sin curso',
          courseLevel: course?.level || '',
          groupName: groupData?.name || e.group?.name || `Grupo #${e.groupId}`,
        };
      });
      
      setAllEnrollments(enrichedEnrollments);
      setEnrollments(enrichedEnrollments);
      setGroups(groupsData);
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
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="w-full text-emerald-600 hover:text-emerald-700"
                    onClick={() => certificatesApi.viewCertificate(e.id)}
                  >
                    Ver certificado
                  </Button>
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
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Matrículas</h1>
            <p className="text-slate-500 mt-1">
              {isAdmin || isProfesor ? 'Gestiona las inscripciones de alumnos' : 'Tus inscripciones'}
            </p>
          </div>
          {canManageGroups && (
            <Button onClick={() => { setShowForm(true); setFormData({ userId: 0, groupId: 0 }); setFormCourseId(''); }}>
              + Nueva Matrícula
            </Button>
          )}
        </div>

        {(isAdmin || isProfesor) && (
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filterCourse}
              onChange={(e) => { setFilterCourse(e.target.value ? Number(e.target.value) : ''); setFilterGroup(''); }}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
            >
              <option value="">Todos los cursos</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
              ))}
            </select>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value ? Number(e.target.value) : '')}
              disabled={!filterCourse}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm disabled:opacity-50"
            >
              <option value="">Todos los grupos</option>
              {groups.filter(g => !filterCourse || g.courseId === filterCourse).map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Curso</label>
                <select
                  value={formCourseId}
                  onChange={(e) => { setFormCourseId(e.target.value ? Number(e.target.value) : ''); setFormData({ ...formData, groupId: 0 }); }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                >
                  <option value="">Selecciona un curso</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Grupo</label>
                <select
                  value={formData.groupId}
                  onChange={(e) => setFormData({ ...formData, groupId: Number(e.target.value) })}
                  disabled={!formCourseId}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:opacity-50"
                  required
                >
                  <option value={0}>Selecciona un grupo</option>
                  {groups.filter(g => !formCourseId || g.courseId === formCourseId).map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setFormCourseId(''); }}>
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