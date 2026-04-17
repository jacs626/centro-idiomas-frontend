import { api } from './index';

export interface Attendance {
  id: number;
  enrollmentId: number;
  date: string;
  status: 'present' | 'absent' | 'late';
}

export interface AttendanceWithCourse {
  enrollmentId: number;
  course: string;
  courseLevel: string;
  group: string;
  attendance: Attendance[];
}

export const attendanceApi = {
  getMyAttendance: () => api.get<AttendanceWithCourse[]>('/attendance/my-attendance'),
  getByEnrollment: (enrollmentId: number) => api.get<Attendance[]>(`/attendance/by-enrollment/${enrollmentId}`),
  getByGroup: (groupId: number) => api.get<Attendance[]>(`/attendance/group/${groupId}`),
  create: (data: { enrollmentId: number; date: string; status: string }) => api.post<Attendance>('/attendance', data),
  update: (id: number, data: { status?: string; date?: string }) => api.patch<Attendance>(`/attendance/${id}`, data),
};