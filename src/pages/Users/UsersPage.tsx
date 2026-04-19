import { useState, useEffect, useMemo } from 'react';
import { usersApi, type User, type CreateUserDto, type UpdateUserDto } from '../../api/users.api';
import { enrollmentsApi, type StudentWithDetails } from '../../api/enrollments.api';
import { coursesApi, type Course } from '../../api/courses.api';
import { groupsApi, type Group } from '../../api/groups.api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, type BadgeVariant } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import CourseGroupFilter from '../../components/filters/CourseGroupFilter';

const roleColors: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
  admin: 'warning',
  profesor: 'info',
  alumno: 'success',
};

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  profesor: 'Profesor',
  alumno: 'Alumno',
};

const statusColors: Record<string, BadgeVariant> = {
  active: 'success',
  completed: 'info',
  dropped: 'warning',
};

export default function UsersPage() {
  const { isProfesor, isAdmin, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<StudentWithDetails[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserDto>({
    name: '',
    email: '',
    password: '',
    role: 'alumno',
  });

  useEffect(() => {
    if (isProfesor) {
      loadProfessorData();
    } else {
      loadAdminData();
    }
  }, [filterRole, filterGroup, filterCourse, isProfesor]);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [coursesRes, groupsRes] = await Promise.all([
        coursesApi.getAll(),
        groupsApi.getAll(),
      ]);
      setCourses(coursesRes.data || []);
      setGroups(groupsRes.data || []);

      if (filterCourse || filterGroup) {
        const studentsRes = await enrollmentsApi.getStudentsByFilters(
          filterGroup ? Number(filterGroup) : undefined,
          filterCourse ? Number(filterCourse) : undefined
        );
        const studentMap = new Map<number, StudentWithDetails>();
        studentsRes.data?.forEach(s => {
          if (!studentMap.has(s.userId)) {
            studentMap.set(s.userId, s);
          }
        });
        
        const usersWithEnrollment = Array.from(studentMap.values()).map(s => ({
          id: s.userId,
          name: s.userName,
          email: s.userEmail,
          role: 'alumno' as const,
          createdAt: undefined,
          deletedAt: null,
        }));
        
        const allUsers = await usersApi.getAll();
        const adminUsers = (allUsers.data || []).filter(u => u.role !== 'alumno');
        
        let filteredUsers = [...usersWithEnrollment, ...adminUsers];
        
        if (filterRole) {
          filteredUsers = filteredUsers.filter(u => u.role === filterRole);
        }
        setUsers(filteredUsers);
      } else {
        const response = await usersApi.getAll(filterRole || undefined);
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProfessorData = async () => {
    try {
      setIsLoading(true);
      const [coursesRes, groupsRes] = await Promise.all([
        coursesApi.getAll(),
        groupsApi.getAll(),
      ]);
      setCourses(coursesRes.data || []);
      setGroups(groupsRes.data || []);
      
      const studentsRes = await enrollmentsApi.getMyStudents(
        filterGroup ? Number(filterGroup) : undefined,
        filterCourse ? Number(filterCourse) : undefined
      );
      setStudents(studentsRes.data || []);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = loadAdminData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const data: UpdateUserDto = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        if (formData.password) {
          data.password = formData.password;
        }
        await usersApi.update(editingUser.id, data);
      } else {
        await usersApi.create(formData);
      }
      setShowForm(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'alumno' });
      loadData();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      await usersApi.delete(id);
      loadData();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'alumno' });
    setShowForm(true);
  };

  const columns = [
    { key: 'name', header: 'Nombre' },
    { key: 'email', header: 'Email' },
    { 
      key: 'role', 
      header: 'Rol', 
      render: (u: User) => (
        <Badge variant={roleColors[u.role]}>{roleLabels[u.role]}</Badge>
      )
    },
    { 
      key: 'createdAt', 
      header: 'Creado', 
      render: (u: User) => u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-ES') : '-' 
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (u: User) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(u)}>
            Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(u.id)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  const studentColumns = [
    { key: 'userName', header: 'Nombre' },
    { key: 'userEmail', header: 'Email' },
    { key: 'groupName', header: 'Grupo' },
    { key: 'courseName', header: 'Curso' },
    { key: 'courseLevel', header: 'Nivel' },
    { 
      key: 'progress', 
      header: 'Progreso', 
      render: (s: StudentWithDetails) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full" 
              style={{ width: `${s.progress}%` }} 
            />
          </div>
          <span className="text-xs">{s.progress}%</span>
        </div>
      )
    },
    { 
      key: 'status', 
      header: 'Estado', 
      render: (s: StudentWithDetails) => (
        <Badge variant={statusColors[s.status] || 'default'}>{s.status}</Badge>
      )
    },
  ];

  if (isProfesor) {
    const filteredGroups = useMemo(() => {
    return groups.filter(g => g.teacherId === user?.id);
  }, [groups, user?.id]);
    
    return (
      <Navbar>
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Mis Alumnos</h1>
          <p className="text-slate-500 mt-1">Alumnos de tus grupos</p>
        </div>

        <div className="mb-4">
          <CourseGroupFilter
            courses={courses}
            groups={filteredGroups}
            selectedCourse={filterCourse ? Number(filterCourse) : ''}
            selectedGroup={filterGroup ? Number(filterGroup) : ''}
            onCourseChange={(id) => setFilterCourse(String(id))}
            onGroupChange={(id) => setFilterGroup(String(id))}
          />
        </div>

        <Card padding="none">
          <Table columns={studentColumns} data={students} isLoading={isLoading} emptyMessage="No hay alumnos en tus grupos" />
        </Card>
      </Navbar>
    );
  }

  return (
    <Navbar>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Usuarios</h1>
          <p className="text-slate-500 mt-1">Gestiona los usuarios del sistema</p>
        </div>
        {isAdmin && <Button onClick={handleNew}>+ Nuevo Usuario</Button>}
      </div>

      <div className="flex gap-4 mb-4 flex-wrap">
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg"
        >
          <option value="">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="profesor">Profesor</option>
          <option value="alumno">Alumno</option>
        </select>
        {isAdmin && (
          <CourseGroupFilter
            courses={courses}
            groups={groups}
            selectedCourse={filterCourse ? Number(filterCourse) : ''}
            selectedGroup={filterGroup ? Number(filterGroup) : ''}
            onCourseChange={(id) => setFilterCourse(String(id))}
            onGroupChange={(id) => setFilterGroup(String(id))}
          />
        )}
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required={!editingUser}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                >
                  <option value="alumno">Alumno</option>
                  <option value="profesor">Profesor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setEditingUser(null); }}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingUser ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card padding="none">
        <Table columns={columns} data={users} isLoading={isLoading} emptyMessage="No hay usuarios" />
      </Card>
    </Navbar>
  );
}