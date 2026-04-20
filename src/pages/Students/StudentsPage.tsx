import { useState, useEffect } from 'react';
import { enrollmentsApi, type StudentWithDetails } from '../../api/enrollments.api';
import { coursesApi, type Course } from '../../api/courses.api';
import { groupsApi, type Group } from '../../api/groups.api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import CourseGroupFilter from '../../components/filters/CourseGroupFilter';

const statusColors: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
  active: 'success',
  completed: 'info',
  dropped: 'warning',
};

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentWithDetails[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterGroup, setFilterGroup] = useState<number | ''>('');
  const [filterCourse, setFilterCourse] = useState<number | ''>('');

  useEffect(() => {
    loadData();
  }, [filterGroup, filterCourse]);

  const loadData = async () => {
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
      const allStudents = (studentsRes?.data || []).filter((s: StudentWithDetails) => s.userId !== user?.id);
      setStudents(allStudents);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
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

  const filteredGroups = groups.filter(g => g.teacherId === user?.id);

  return (
    <Navbar>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Mis Alumnos
        </h1>
        <p className="text-slate-500 mt-1">
          Alumnos de tus grupos
        </p>
      </div>

      <div className="mb-4">
        <CourseGroupFilter
          courses={courses}
          groups={filteredGroups}
          selectedCourse={filterCourse ? Number(filterCourse) : ''}
          selectedGroup={filterGroup ? Number(filterGroup) : ''}
          onCourseChange={(id) => setFilterCourse(id)}
          onGroupChange={(id) => setFilterGroup(id)}
        />
      </div>

      <Card padding="none">
        <Table columns={columns} data={students} isLoading={isLoading} emptyMessage="No hay alumnos en tus grupos" />
      </Card>
    </Navbar>
  );
}