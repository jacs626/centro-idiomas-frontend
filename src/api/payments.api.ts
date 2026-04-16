import { api } from './index';

export interface Payment {
  id: number;
  studentId: number;
  amount: number;
  method: 'cash' | 'card' | 'transfer' | 'mp';
  status: 'pending' | 'completed' | 'failed';
  date: string;
}

export interface CreatePaymentDto {
  studentId: number;
  amount: number;
  method: 'cash' | 'card' | 'transfer' | 'mp';
}

export const paymentsApi = {
  getAll: () => api.get<Payment[]>('/payments'),
  getById: (id: number) => api.get<Payment>(`/payments/${id}`),
  create: (data: CreatePaymentDto) => api.post<Payment>('/payments', data),
  update: (id: number, data: Partial<CreatePaymentDto>) => api.patch<Payment>(`/payments/${id}`, data),
  delete: (id: number) => api.delete(`/payments/${id}`),
};