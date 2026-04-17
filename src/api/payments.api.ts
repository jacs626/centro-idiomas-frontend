import { api } from './index';

export interface Payment {
  id: number;
  enrollmentId: number;
  amount: number;
  type: string;
  status: 'pending' | 'paid' | 'late';
  dueDate: string;
  paidAt: string | null;
  enrollment?: {
    id: number;
    userId: number;
    groupId: number;
    group?: {
      id: number;
      name: string;
      course?: {
        id: number;
        name: string;
        level: string;
      };
    };
    user?: {
      id: number;
      name: string;
    };
  };
}

export interface CreatePaymentDto {
  enrollmentId: number;
  amount: number;
  type: string;
  status: string;
  dueDate: string;
  paidAt?: string;
}

export const paymentsApi = {
  getAll: (filters?: { userId?: number; groupId?: number; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId.toString());
    if (filters?.groupId) params.append('groupId', filters.groupId.toString());
    if (filters?.status) params.append('status', filters.status);
    return api.get<Payment[]>(`/payments?${params.toString()}`);
  },
  getById: (id: number) => api.get<Payment>(`/payments/${id}`),
  getByUser: (userId: number) => api.get<Payment[]>(`/payments/by-user?userId=${userId}`),
  getMyPayments: () => api.get<Payment[]>('/payments/my-payments'),
  create: (data: CreatePaymentDto) => api.post<Payment>('/payments', data),
  markAsPaid: (id: number) => api.patch<Payment>(`/payments/${id}/pay`),
  update: (id: number, data: Partial<CreatePaymentDto>) => api.patch<Payment>(`/payments/${id}`, data),
  delete: (id: number) => api.delete(`/payments/${id}`),
};