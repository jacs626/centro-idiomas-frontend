import { api } from './index';

export interface Course {
  id: number;
  name: string;
  description?: string;
  level: string;
  price: number;
  duration: number;
  createdAt?: string;
}

export interface CreateCourseDto {
  name: string;
  description?: string;
  level: string;
  price: number;
  duration: number;
}

export const coursesApi = {
  getAll: () => api.get<Course[]>('/courses'),
  getById: (id: number) => api.get<Course>(`/courses/${id}`),
  create: (data: CreateCourseDto) => api.post<Course>('/courses', data),
  update: (id: number, data: Partial<CreateCourseDto>) => api.patch<Course>(`/courses/${id}`, data),
  delete: (id: number) => api.delete(`/courses/${id}`),
};