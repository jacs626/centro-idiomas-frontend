import { api } from './index';

export interface Enrollment {
  id: number;
  studentId: number;
  groupId: number;
  status: 'active' | 'completed' | 'cancelled';
  enrolledAt: string;
}

export interface CreateEnrollmentDto {
  studentId: number;
  groupId: number;
}

export const enrollmentsApi = {
  getAll: () => api.get<Enrollment[]>('/enrollments'),
  getById: (id: number) => api.get<Enrollment>(`/enrollments/${id}`),
  create: (data: CreateEnrollmentDto) => api.post<Enrollment>('/enrollments', data),
  update: (id: number, data: Partial<CreateEnrollmentDto>) => api.patch<Enrollment>(`/enrollments/${id}`, data),
  delete: (id: number) => api.delete(`/enrollments/${id}`),
};