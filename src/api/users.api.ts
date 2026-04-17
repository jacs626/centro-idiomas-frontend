import { api } from './index';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

export const usersApi = {
  getAll: (role?: string) => {
    const params = role ? `?role=${role}` : '';
    return api.get<User[]>(`/users${params}`);
  },
  getById: (id: number) => api.get<User>(`/users/${id}`),
  create: (data: CreateUserDto) => api.post<User>('/users', data),
  update: (id: number, data: Partial<UpdateUserDto>) => api.patch<User>(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};