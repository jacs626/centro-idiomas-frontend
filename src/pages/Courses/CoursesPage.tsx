import { useState, useEffect } from 'react';
import { coursesApi, type Course } from '../../api/courses.api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    level: 'A1',
    description: '',
  });

  const { canManageCourses, isAdmin } = useAuth();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await coursesApi.getAll();
      setCourses(response.data);
    } catch (error) {
      console.error('Error loading courses:', error);
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
      loadCourses();
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
        loadCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

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
            {isAdmin ? 'Gestiona todos los cursos del centro' : 'Cursos en los que estás inscrito'}
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

      <Card padding="none">
        <Table columns={columns} data={courses} isLoading={isLoading} emptyMessage="No hay cursos disponibles" />
      </Card>
    </Navbar>
  );
}