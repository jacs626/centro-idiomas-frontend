import { api } from './index';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

export const usersApi = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: number) => api.get<User>(`/users/${id}`),
};