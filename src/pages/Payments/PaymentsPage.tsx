import { useState, useEffect } from 'react';
import { paymentsApi, type Payment } from '../../api/payments.api';
import { groupsApi, type Group } from '../../api/groups.api';
import { coursesApi, type Course } from '../../api/courses.api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  pending: 'warning',
  paid: 'success',
  late: 'danger',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  late: 'Vencido',
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ courseId: '', groupId: '', status: '' });

  const { isAdmin, isAlumno, user } = useAuth();

  useEffect(() => {
    loadData();
    if (isAdmin) loadCourses();
  }, [filters]);

  const loadCourses = async () => {
    try {
      const response = await coursesApi.getAll();
      setCourses(response.data);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadGroups = async (courseId: number) => {
    try {
      const response = await groupsApi.getByCourse(courseId);
      setGroups(response.data);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const handleCourseChange = (courseId: string) => {
    setFilters(prev => ({ ...prev, courseId, groupId: '' }));
    if (courseId) {
      loadGroups(Number(courseId));
    } else {
      setGroups([]);
    }
  };

  const loadData = async () => {
    try {
      let paymentsData: Payment[];

      if (isAlumno && user) {
        const response = await paymentsApi.getMyPayments();
        paymentsData = response.data;
      } else if (isAdmin) {
        const filterParams: any = {};
        if (filters.groupId) filterParams.groupId = Number(filters.groupId);
        if (filters.status) filterParams.status = filters.status;
        const response = await paymentsApi.getAll(filterParams);
        paymentsData = response.data;
      } else {
        paymentsData = [];
      }

      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleMarkAsPaid = async (id: number) => {
    try {
      await paymentsApi.markAsPaid(id);
      loadData();
    } catch (error) {
      console.error('Error marking payment as paid:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCourseName = (payment: Payment) => {
    return payment.enrollment?.group?.course?.name || 'Sin curso';
  };

  const getGroupName = (payment: Payment) => {
    return payment.enrollment?.group?.name || `Grupo #${payment.enrollment?.groupId}`;
  };

  const getStudentName = (payment: Payment) => {
    return payment.enrollment?.user?.name || `Alumno #${payment.enrollment?.userId}`;
  };

  if (isAlumno && payments.length > 0) {
    const totalPending = payments
      .filter(p => p.status === 'pending' || p.status === 'late')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const totalPaid = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    return (
      <Navbar>
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Mis Pagos</h1>
          <p className="text-slate-500 mt-1">Resumen de tus pagos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent>
              <p className="text-sm text-slate-500">Total Pagado</p>
              <p className="text-2xl font-bold text-emerald-600">{formatAmount(totalPaid)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-slate-500">Pendiente</p>
              <p className="text-2xl font-bold text-amber-600">{formatAmount(totalPending)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          {payments.map((payment) => (
            <Card key={payment.id}>
              <CardContent>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-800">{getCourseName(payment)}</h3>
                    <p className="text-sm text-slate-500">{getGroupName(payment)}</p>
                  </div>
                  <Badge variant={statusColors[payment.status]}>
                    {statusLabels[payment.status]}
                  </Badge>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <p className="text-lg font-bold text-slate-800">{formatAmount(payment.amount)}</p>
                    <p className="text-xs text-slate-500">
                      Vence: {formatDate(payment.dueDate)}
                    </p>
                  </div>
                  {payment.paidAt && (
                    <p className="text-xs text-emerald-600">
                      Pagado: {formatDate(payment.paidAt)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {payments.length === 0 && !isLoading && (
          <Card>
            <CardContent>
              <p className="text-center text-slate-500">No tienes pagos registrados</p>
            </CardContent>
          </Card>
        )}
      </Navbar>
    );
  }

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'student', header: 'Alumno', render: (p: Payment) => getStudentName(p) },
    { key: 'course', header: 'Curso', render: (p: Payment) => getCourseName(p) },
    { key: 'group', header: 'Grupo', render: (p: Payment) => getGroupName(p) },
    { key: 'amount', header: 'Monto', render: (p: Payment) => formatAmount(p.amount) },
    { key: 'type', header: 'Tipo', render: (p: Payment) => p.type },
    { key: 'dueDate', header: 'Vence', render: (p: Payment) => formatDate(p.dueDate) },
    { 
      key: 'status', 
      header: 'Estado', 
      render: (p: Payment) => (
        <Badge variant={statusColors[p.status] as 'default' | 'success' | 'warning' | 'danger'}>
          {statusLabels[p.status]}
        </Badge>
      )
    },
    ...((isAdmin) ? [{
      key: 'actions',
      header: 'Acciones',
      render: (p: Payment) => (
        p.status !== 'paid' && (
          <Button variant="ghost" size="sm" onClick={() => handleMarkAsPaid(p.id)}>
            Marcar Pagado
          </Button>
        )
      ),
    }] : []),
  ];

  return (
    <Navbar>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Pagos</h1>
          <p className="text-slate-500 mt-1">
            {isAdmin ? 'Gestiona los pagos de los alumnos' : 'Tus pagos'}
          </p>
        </div>
      </div>

      {isAdmin && (
        <div className="flex flex-wrap gap-4 mb-4 p-4 bg-white rounded-lg border border-slate-200">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Curso</label>
            <select
              value={filters.courseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm"
            >
              <option value="">Todos los cursos</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Grupo</label>
            <select
              value={filters.groupId}
              onChange={(e) => handleFilterChange('groupId', e.target.value)}
              disabled={!filters.courseId}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm disabled:opacity-50"
            >
              <option value="">Todos los grupos</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm"
            >
              <option value="">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="paid">Pagado</option>
              <option value="late">Vencido</option>
            </select>
          </div>
        </div>
      )}

      <Card padding="none">
        <Table columns={columns} data={payments} isLoading={isLoading} emptyMessage="No hay pagos" />
      </Card>
    </Navbar>
  );
}