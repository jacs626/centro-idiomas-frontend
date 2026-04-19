import { useState, useEffect, useMemo } from 'react';
import { enrollmentsApi } from '../../api/enrollments.api';
import { coursesApi, type Course } from '../../api/courses.api';
import { groupsApi } from '../../api/groups.api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import LevelFilter from '../../components/filters/LevelFilter';

interface CourseWithProgress extends Course {
  progress?: number;
  status?: string;
  groupName?: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [filterLevel, setFilterLevel] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    level: 'A1',
    description: '',
  });

  const { canManageCourses, isAdmin, isProfesor, isAlumno, user } = useAuth();

  const filteredCourses = useMemo(() => {
    if (!filterLevel) return courses;
    return courses.filter(c => c.level === filterLevel);
  }, [courses, filterLevel]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      let coursesWithProgress: CourseWithProgress[] = [];

      if (isAlumno && user) {
        const myProgress = await enrollmentsApi.getMyProgress();
        const coursesRes = await coursesApi.getAll();
        
        coursesWithProgress = coursesRes.data.map(course => {
          const enrollment = myProgress.data.find((e: any) => e.courseId === course.id);
          if (enrollment) {
            return {
              ...course,
              progress: enrollment.progress,
              status: enrollment.status,
              groupName: enrollment.group,
            };
          }
          return course;
        });
      } else if (isProfesor && user) {
        const groupsRes = await groupsApi.getAll();
        const myGroups = groupsRes.data.filter((g: any) => g.teacherId === user.id);
        
        const coursesRes = await coursesApi.getAll();
        const teacherCourses = coursesRes.data.filter((c: any) => 
          myGroups.some((g: any) => g.courseId === c.id)
        );
        
        coursesWithProgress = teacherCourses.map(course => {
          const group = myGroups.find((g: any) => g.courseId === course.id);
          return { ...course, groupName: group?.name };
        });
      } else if (isAdmin) {
        const coursesRes = await coursesApi.getAll();
        coursesWithProgress = coursesRes.data;
      }

      setCourses(coursesWithProgress);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await coursesApi.update(editingCourse.id, formData);
      } else {
        await coursesApi.create(formData);
      }
      setShowForm(false);
      setEditingCourse(null);
      setFormData({ name: '', level: 'A1', description: '' });
      loadData();
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      level: course.level,
      description: course.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este curso?')) {
      try {
        await coursesApi.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const statusColors: Record<string, 'success' | 'info' | 'danger'> = {
    active: 'success',
    completed: 'info',
    dropped: 'danger',
  };

  const statusLabels: Record<string, string> = {
    active: 'Activo',
    completed: 'Completado',
    dropped: 'Retirado',
  };

  if (isAlumno) {
    const enrolledCourses = courses.filter(c => c.progress !== undefined);
    const availableCourses = courses.filter(c => c.progress === undefined);

    return (
      <Navbar>
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Mis Cursos</h1>
          <p className="text-slate-500 mt-1">Tu progreso en cada curso</p>
        </div>

        {enrolledCourses.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Cursos en progreso</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {enrolledCourses.map((c) => (
                <Card key={c.id} hover padding="md">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-800">{c.name}</h3>
                      <p className="text-sm text-slate-500">{c.level}</p>
                    </div>
                    {c.status && <Badge variant={statusColors[c.status]}>{statusLabels[c.status]}</Badge>}
                  </div>
                  
                  {c.groupName && (
                    <p className="text-sm text-slate-600 mb-3">Grupo: {c.groupName}</p>
                  )}
                  
                  {c.progress !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Progreso</span>
                        <span className="font-medium text-slate-800">{c.progress}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            c.progress >= 80 ? 'bg-emerald-500' : 
                            c.progress >= 50 ? 'bg-amber-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${c.progress}%` }}
                        />
                      </div>
                      {c.progress >= 80 && c.status === 'active' && (
                        <p className="text-xs text-emerald-600 font-medium mt-2">
                          ✓ Puedes solicitar tu certificado
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </>
        )}

        {availableCourses.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Cursos disponibles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableCourses.map((c) => (
                <Card key={c.id} padding="md">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-800">{c.name}</h3>
                      <p className="text-sm text-slate-500">{c.level}</p>
                    </div>
                    <Badge variant="info">{c.level}</Badge>
                  </div>
                  {c.description && (
                    <p className="text-sm text-slate-500 mt-2">{c.description}</p>
                  )}
                </Card>
              ))}
            </div>
          </>
        )}

        {courses.length === 0 && (
          <Card padding="md">
            <p className="text-slate-500 text-center">No hay cursos disponibles</p>
          </Card>
        )}
      </Navbar>
    );
  }

  const columns = [
    { key: 'name', header: 'Nombre' },
    { key: 'level', header: 'Nivel', render: (c: Course) => <Badge variant="info">{c.level}</Badge> },
    ...(canManageCourses ? [{
      key: 'actions',
      header: 'Acciones',
      render: (c: Course) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}>Editar</Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(c.id)}>Eliminar</Button>
        </div>
      ),
    }] : []),
  ];

  return (
    <Navbar>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Cursos</h1>
          <p className="text-slate-500 mt-1">
            {isAdmin ? 'Gestiona todos los cursos del centro' : 'Cursos disponibles'}
          </p>
        </div>
        {canManageCourses && (
          <Button onClick={() => { setShowForm(true); setEditingCourse(null); setFormData({ name: '', level: 'A1', description: '' }); }}>
            + Nuevo Curso
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingCourse ? 'Editar Curso' : 'Nuevo Curso'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="ej: A1 Speaking"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nivel</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="A1">A1 - Principiante</option>
                  <option value="A2">A2 - Básico</option>
                  <option value="B1">B1 - Intermedio</option>
                  <option value="B2">B2 - Intermedio Alto</option>
                  <option value="C1">C1 - Avanzado</option>
                  <option value="C2">C2 - Maestría</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setEditingCourse(null); }}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCourse ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isAdmin && (
        <div className="mb-4">
          <LevelFilter
            selectedLevel={filterLevel}
            onChange={setFilterLevel}
          />
        </div>
      )}

      <Card padding="none">
        <Table columns={columns} data={filteredCourses} isLoading={isLoading} emptyMessage="No hay cursos disponibles" />
      </Card>
    </Navbar>
  );
}