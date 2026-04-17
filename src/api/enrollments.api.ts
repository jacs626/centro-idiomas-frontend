import { api } from './index';

export interface Enrollment {
  id: number;
  userId: number;
  groupId: number;
  progress: number;
  status: 'active' | 'completed' | 'dropped';
  createdAt: string;
}

export interface CreateEnrollmentDto {
  userId: number;
  groupId: number;
}

export interface EnrollmentProgress {
  progress: number;
  status: string;
  group: string;
  course: string;
  courseLevel: string;
}

export const enrollmentsApi = {
  getAll: () => api.get<Enrollment[]>('/enrollments'),
  getByUser: (userId: number) => api.get<Enrollment[]>(`/enrollments/by-user?userId=${userId}`),
  getByGroup: (groupId: number) => api.get<Enrollment[]>(`/enrollments/by-group?groupId=${groupId}`),
  getProgress: (userId: number, groupId: number) => 
    api.get<EnrollmentProgress>(`/enrollments/progress/${groupId}?userId=${userId}`),
  getMyProgress: () => api.get<EnrollmentProgress[]>('/enrollments/my-progress'),
  create: (data: CreateEnrollmentDto) => api.post<Enrollment>('/enrollments', data),
  update: (id: number, data: { progress?: number; status?: string }) => api.patch<Enrollment>(`/enrollments/${id}`, data),
};