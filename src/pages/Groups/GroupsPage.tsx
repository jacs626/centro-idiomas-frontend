import { useState, useEffect, useMemo } from 'react';
import { groupsApi, type Group } from '../../api/groups.api';
import { coursesApi, type Course } from '../../api/courses.api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import CourseGroupFilter from '../../components/filters/CourseGroupFilter';
import LevelFilter from '../../components/filters/LevelFilter';

interface Teacher {
  id: number;
  name: string;
  email: string;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    courseId: 0,
    teacherId: 0,
    startDate: '',
    endDate: '',
  });
  const [filterCourse, setFilterCourse] = useState<number | ''>('');
  const [filterLevel, setFilterLevel] = useState('');

  const { canManageGroups, isAdmin, isProfesor, user } = useAuth();

  const filteredGroups = useMemo(() => {
    let result = groups;
    if (filterLevel) {
      result = result.filter(g => {
        const course = courses.find(c => c.id === g.courseId);
        return course?.level === filterLevel;
      });
    }
    if (filterCourse) {
      result = result.filter(g => g.courseId === filterCourse);
    }
    return result;
  }, [groups, courses, filterCourse, filterLevel]);

  const filteredCourses = useMemo(() => {
    if (!filterLevel) return courses;
    return courses.filter(c => c.level === filterLevel);
  }, [courses, filterLevel]);

  const handleLevelChange = (level: string) => {
    setFilterLevel(level);
    setFilterCourse('');
  };

  const myGroups = useMemo(() => {
    if (isAdmin) return groups;
    if (isProfesor && user) {
      return groups.filter(g => g.teacherId === user.id);
    }
    return groups;
  }, [groups, isAdmin, isProfesor, user?.id]);

  useEffect(() => {
    loadData();
  }, [isAdmin, isProfesor]);

  const loadData = async () => {
    try {
      const [groupsRes, coursesRes] = await Promise.all([
        groupsApi.getAll(),
        coursesApi.getAll(),
      ]);
      setGroups(groupsRes.data);
      setCourses(coursesRes.data);
      
      if (isAdmin) {
        const teachersRes = await groupsApi.getTeachers();
        setTeachers(teachersRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        courseId: formData.courseId,
        teacherId: 1,
        startDate: formData.startDate,
        endDate: formData.endDate,
      };
      if (editingGroup) {
        await groupsApi.update(editingGroup.id, data);
      } else {
        await groupsApi.create(data);
      }
      setShowForm(false);
      setEditingGroup(null);
      setFormData({ name: '', courseId: 0, teacherId: 0, startDate: '', endDate: '' });
      loadData();
    } catch (error) {
      console.error('Error saving group:', error);
    }
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      courseId: group.courseId,
      teacherId: group.teacherId,
      startDate: group.startDate ? group.startDate.split('T')[0] : '',
      endDate: group.endDate ? group.endDate.split('T')[0] : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este grupo?')) {
      try {
        await groupsApi.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting group:', error);
      }
    }
  };

  const getCourseName = (courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : `Curso #${courseId}`;
  };

  const columns = [
    { key: 'name', header: 'Nombre' },
    { key: 'courseId', header: 'Curso', render: (g: Group) => getCourseName(g.courseId) },
    { key: 'startDate', header: 'Inicio', render: (g: Group) => g.startDate ? new Date(g.startDate).toLocaleDateString('es-MX') : '-' },
    { key: 'endDate', header: 'Fin', render: (g: Group) => g.endDate ? new Date(g.endDate).toLocaleDateString('es-MX') : '-' },
    ...(canManageGroups ? [{
      key: 'actions',
      header: 'Acciones',
      render: (g: Group) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(g)}>Editar</Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(g.id)}>Eliminar</Button>
        </div>
      ),
    }] : []),
  ];

  return (
    <Navbar>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Grupos</h1>
          <p className="text-slate-500 mt-1">
            {isAdmin ? 'Gestiona todos los grupos del centro' : 'Grupos en los que estás inscrito'}
          </p>
        </div>
        {canManageGroups && (
          <Button onClick={() => { setShowForm(true); setEditingGroup(null); setFormData({ name: '', courseId: courses[0]?.id || 0, teacherId: teachers[0]?.id || 0, startDate: '', endDate: '' }); }}>
            + Nuevo Grupo
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingGroup ? 'Editar Grupo' : 'Nuevo Grupo'}</CardTitle>
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
                  placeholder="ej: A1-01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Curso</label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                >
                  <option value="">Selecciona un curso</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.name} ({course.level})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Profesor</label>
                <select
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                >
                  <option value="">Selecciona un profesor</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de inicio</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de fin</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                />
              </div>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setEditingGroup(null); }}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingGroup ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {(isAdmin || isProfesor) && (
        <div className="flex gap-4 mb-4 flex-wrap">
          <LevelFilter
            selectedLevel={filterLevel}
            onChange={handleLevelChange}
            placeholder="Todos los niveles"
          />
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value ? Number(e.target.value) : '')}
            disabled={!filterLevel}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:opacity-50"
          >
            <option value="">Todos los cursos</option>
            {filteredCourses.map(course => (
              <option key={course.id} value={course.id}>{course.name} - {course.level}</option>
            ))}
          </select>
        </div>
      )}

      <Card padding="none">
        <Table columns={columns} data={isProfesor && !isAdmin ? filteredGroups : (isAdmin ? filteredGroups : myGroups)} isLoading={isLoading} emptyMessage="No hay grupos disponibles" />
      </Card>
    </Navbar>
  );
}