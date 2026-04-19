export const enrollmentStatusColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  active: 'success',
  completed: 'info',
  dropped: 'danger',
};

export const paymentStatusColors: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  pending: 'warning',
  paid: 'success',
  late: 'danger',
};

export const studentStatusColors: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
  active: 'success',
  completed: 'info',
  dropped: 'warning',
};

export const enrollmentStatusLabels: Record<string, string> = {
  active: 'Activo',
  completed: 'Completado',
  dropped: 'Retirado',
};

export const paymentStatusLabels: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  late: 'Vencido',
};

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export type Level = typeof LEVELS[number];

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatPercent = (value: number) => `${Math.round(value)}%`;

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);

export const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};