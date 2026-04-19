import { useState, useEffect } from 'react';
import { certificatesApi, type Certificate } from '../../api/certificates.api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import Navbar from '../../components/layout/Navbar';
import AdminCertificatesPage from './AdminCertificatesPage';
import { useAuth } from '../../context/AuthContext';

export default function CertificatesWrapper() {
  const { isAdmin, isProfesor, isAlumno } = useAuth();

  if (isAdmin || isProfesor) {
    return <AdminCertificatesPage />;
  }

  if (isAlumno) {
    return <StudentCertificatesPage />;
  }

  return <StudentCertificatesPage />;
}

function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await certificatesApi.getMyCertificates();
      const myCerts = (response.data || []).filter(
        (c: Certificate) => c.enrollment?.userId === user?.id
      );
      setCertificates(myCerts);
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (enrollmentId: number) => {
    try {
      const response = await certificatesApi.viewCertificate(enrollmentId);
      const blob = new Blob([response.data as any], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = window.open(url, '_blank');
      if (link) {
        link.focus();
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('No se pudo generar el certificado. Verifica que tengas al menos 80% de progreso.');
    }
  };

  const getCourseName = (cert: Certificate) => {
    return cert.enrollment?.group?.course?.name || 'Sin curso';
  };

  const getGroupName = (cert: Certificate) => {
    return cert.enrollment?.group?.name || `Grupo #${cert.enrollment?.id}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Navbar>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Mis Certificados</h1>
        <p className="text-slate-500 mt-1">Tus certificados obtenidos</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-slate-500">Cargando...</div>
      ) : certificates.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-center text-slate-500">
              No tienes certificados. Completa un curso con 80% de progreso para obtenerlo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {certificates.map((cert) => (
            <Card key={cert.id}>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-slate-800">{getCourseName(cert)}</h3>
                    <p className="text-sm text-slate-500">{getGroupName(cert)}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Emitido: {formatDate(cert.issuedAt)}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownload(cert.enrollmentId)}
                  >
                    Descargar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Navbar>
  );
}