import { useState, useEffect } from 'react';
import { certificatesApi } from '../../api/certificates.api';
import { groupsApi, type Group } from '../../api/groups.api';
import { coursesApi, type Course } from '../../api/courses.api';
import { enrollmentsApi, type Enrollment } from '../../api/enrollments.api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';

interface EnrollmentWithDetails extends Enrollment {
  courseName: string;
  courseLevel: string;
  groupName: string;
  hasCertificate: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export default function AdminCertificatesPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | ''>('');
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { isAdmin } = useAuth();

  useEffect(() => {
    loadData();
  }, [selectedGroup]);

  useEffect(() => {
    if (allGroups.length > 0 && isAdmin) {
      loadCourses();
    }
  }, [allGroups, isAdmin]);

  const loadCourses = async () => {
    try {
      const coursesRes = await coursesApi.getAll();
      setCourses(coursesRes.data);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId ? Number(courseId) : '');
    setSelectedGroup(null);
  };

  const filteredGroups = selectedCourse 
    ? allGroups.filter(g => g.courseId === selectedCourse)
    : allGroups;

  const loadData = async () => {
    try {
      setIsLoading(true);
      let enrollData: EnrollmentWithDetails[];
      
      const [enrollRes, groupsRes, coursesRes, certsRes] = await Promise.all([
        enrollmentsApi.getAll(),
        groupsApi.getAll(),
        coursesApi.getAll(),
        certificatesApi.getAll(),
      ]);
      
      setAllGroups(groupsRes.data);
      setCourses(coursesRes.data);
      
      const certEnrollmentIds = new Set(certsRes.data.map(c => c.enrollmentId));
      
      const allEnrollments = enrollRes.data.map(e => {
        const group = groupsRes.data.find(g => g.id === e.groupId);
        const course = coursesRes.data.find(c => c.id === group?.courseId);
        return {
          ...e,
          courseName: course?.name || '',
          courseLevel: course?.level || '',
          groupName: group?.name || '',
          hasCertificate: certEnrollmentIds.has(e.id),
        };
      });
      
      if (selectedGroup) {
        enrollData = allEnrollments.filter(e => e.groupId === selectedGroup);
      } else {
        enrollData = allEnrollments;
      }
      
      setEnrollments(enrollData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (enrollmentId: number) => {
    try {
      const response = await certificatesApi.generate(enrollmentId);
      const blob = new Blob([response.data as any], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = window.open(url, '_blank');
      if (link) {
        link.focus();
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Error downloading certificate';
      alert(message);
      console.error('Error downloading certificate:', error);
    }
  };

  const handleGenerate = async (enrollmentId: number) => {
    try {
      await handleDownload(enrollmentId);
      loadData();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Error generating certificate';
      alert(message);
      console.error('Error generating certificate:', error);
    }
  };

  const columns = [
    { key: 'user', header: 'Alumno', render: (e: EnrollmentWithDetails) => e.user?.name || `Alumno #${e.userId}` },
    { key: 'course', header: 'Curso', render: (e: EnrollmentWithDetails) => `${e.courseName} (${e.courseLevel})` },
    { key: 'group', header: 'Grupo', render: (e: EnrollmentWithDetails) => e.groupName },
    { key: 'progress', header: 'Progreso', render: (e: EnrollmentWithDetails) => `${e.progress}%` },
    { 
      key: 'eligible', 
      header: 'Estado', 
      render: (e: EnrollmentWithDetails) => (
        e.progress >= 80 ? (
          e.hasCertificate ? (
            <Badge variant="success">Certificado generado</Badge>
          ) : (
            <Badge variant="warning">Elegible (≥80%)</Badge>
          )
        ) : (
          <Badge variant="default">No elegible</Badge>
        )
      )
    },
    { 
      key: 'actions', 
      header: 'Acción',
      render: (e: EnrollmentWithDetails) => (
        e.progress >= 80 ? (
          <Button variant="secondary" size="sm" onClick={() => handleGenerate(e.id)}>
            {e.hasCertificate ? 'Descargar' : 'Generar'}
          </Button>
        ) : null
      ),
    },
  ];

  return (
    <Navbar>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Certificados</h1>
          <p className="text-slate-500 mt-1">Gestiona los certificados de los alumnos</p>
        </div>
        {(isAdmin) && (
          <div className="flex gap-2">
            <select
              value={selectedCourse}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="">Todos los cursos</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={selectedGroup || ''}
              onChange={(e) => setSelectedGroup(e.target.value ? Number(e.target.value) : null)}
              disabled={!selectedCourse}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:opacity-50"
            >
              <option value="">Todos los grupos</option>
              {filteredGroups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <Card padding="none">
        <Table columns={columns} data={enrollments} isLoading={isLoading} emptyMessage="No hay matrículas" />
      </Card>
    </Navbar>
  );
}