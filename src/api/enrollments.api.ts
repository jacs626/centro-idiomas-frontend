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

export interface StudentWithDetails {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userRole?: string;
  groupId: number;
  groupName: string;
  courseId: number;
  courseName: string;
  courseLevel: string;
  progress: number;
  status: string;
  payments?: any[];
  attendance?: any[];
}

export const enrollmentsApi = {
  getAll: () => api.get<Enrollment[]>('/enrollments'),
  getByUser: (userId: number) => api.get<Enrollment[]>(`/enrollments/by-user?userId=${userId}`),
  getByGroup: (groupId: number) => api.get<Enrollment[]>(`/enrollments/by-group?groupId=${groupId}`),
  getProgress: (userId: number, groupId: number) => 
    api.get<EnrollmentProgress>(`/enrollments/progress/${groupId}?userId=${userId}`),
  getMyProgress: () => api.get<EnrollmentProgress[]>('/enrollments/my-progress'),
  getMyStudents: (groupId?: number, courseId?: number) => {
    const params = new URLSearchParams();
    if (groupId) params.append('groupId', String(groupId));
    if (courseId) params.append('courseId', String(courseId));
    return api.get<StudentWithDetails[]>(`/enrollments/my-students?${params.toString()}`);
  },
  getStudentsByFilters: (groupId?: number, courseId?: number) => {
    const params = new URLSearchParams();
    if (groupId) params.append('groupId', String(groupId));
    if (courseId) params.append('courseId', String(courseId));
    return api.get<StudentWithDetails[]>(`/enrollments/students?${params.toString()}`);
  },
  create: (data: CreateEnrollmentDto) => api.post<Enrollment>('/enrollments', data),
  update: (id: number, data: { progress?: number; status?: string }) => api.patch<Enrollment>(`/enrollments/${id}`, data),
};