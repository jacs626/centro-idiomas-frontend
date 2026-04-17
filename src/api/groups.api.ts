import { api } from './index';

export interface Group {
  id: number;
  name: string;
  courseId: number;
  teacherId: number;
  startDate: string;
  endDate?: string;
}

export interface CreateGroupDto {
  name: string;
  courseId: number;
  teacherId: number;
  startDate: string;
  endDate: string;
}

export const groupsApi = {
  getAll: () => api.get<Group[]>('/groups'),
  getById: (id: number) => api.get<Group>(`/groups/${id}`),
  getByCourse: (courseId: number) => api.get<Group[]>(`/groups/by-course?courseId=${courseId}`),
  getTeachers: () => api.get<any[]>('/groups/teachers'),
  create: (data: CreateGroupDto) => api.post<Group>('/groups', data),
  update: (id: number, data: Partial<CreateGroupDto>) => api.patch<Group>(`/groups/${id}`, data),
  delete: (id: number) => api.delete(`/groups/${id}`),
};