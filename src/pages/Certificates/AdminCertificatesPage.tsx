import { useState, useEffect } from 'react';
import { certificatesApi, type Certificate } from '../../api/certificates.api';
import { groupsApi, type Group } from '../../api/groups.api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { isAdmin, isProfesor, user } = useAuth();

  useEffect(() => {
    loadData();
  }, [selectedGroup]);

  useEffect(() => {
    if (allGroups.length > 0) {
      if (isProfesor && user) {
        setFilteredGroups(allGroups.filter(g => g.teacherId === user.id));
      } else {
        setFilteredGroups(allGroups);
      }
    }
  }, [allGroups, isProfesor, user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      let certs: Certificate[];
      
      if (selectedGroup) {
        const response = await certificatesApi.getByGroup(selectedGroup);
        certs = response.data;
      } else if (isProfesor && user) {
        const myGroupIds = allGroups.filter(g => g.teacherId === user.id).map(g => g.id);
        const response = await certificatesApi.getAll();
        certs = response.data.filter((c: Certificate) => c.enrollment?.groupId && myGroupIds.includes(c.enrollment.groupId));
      } else {
        const response = await certificatesApi.getAll();
        certs = response.data;
      }
      
      setCertificates(certs);
      
      if (allGroups.length === 0) {
        const groupsRes = await groupsApi.getAll();
        setAllGroups(groupsRes.data);
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
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
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  const handleGenerate = async (enrollmentId: number) => {
    try {
      await handleDownload(enrollmentId);
      loadData();
    } catch (error) {
      console.error('Error generating certificate:', error);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getCourseName = (cert: Certificate) => {
    return cert.enrollment?.group?.course?.name || 'Sin curso';
  };

  const getGroupName = (cert: Certificate) => {
    return cert.enrollment?.group?.name || `Grupo #${cert.enrollment?.groupId}`;
  };

  const getStudentName = (cert: Certificate) => {
    return cert.enrollment?.user?.name || `Alumno #${cert.enrollment?.userId}`;
  };

  const columns = [
    { key: 'student', header: 'Alumno', render: (c: Certificate) => getStudentName(c) },
    { key: 'course', header: 'Curso', render: (c: Certificate) => getCourseName(c) },
    { key: 'group', header: 'Grupo', render: (c: Certificate) => getGroupName(c) },
    { key: 'progress', header: 'Progreso', render: (c: Certificate) => `${c.enrollment?.progress || 0}%` },
    { key: 'issuedAt', header: 'Fecha', render: (c: Certificate) => formatDate(c.issuedAt) },
    { 
      key: 'actions', 
      header: 'Acción',
      render: (c: Certificate) => (
        <Button variant="secondary" size="sm" onClick={() => handleGenerate(c.enrollmentId)}>
          Descargar
        </Button>
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
        {(isAdmin || isProfesor) && (
          <div className="flex gap-2">
            <select
              value={selectedGroup || ''}
              onChange={(e) => setSelectedGroup(e.target.value ? Number(e.target.value) : null)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
        <Table columns={columns} data={certificates} isLoading={isLoading} emptyMessage="No hay certificados" />
      </Card>
    </Navbar>
  );
}