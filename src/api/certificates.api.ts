import { api } from './index';

export interface Certificate {
  id: number;
  enrollmentId: number;
  fileUrl: string;
  issuedAt: string;
  enrollment?: {
    id: number;
    userId: number;
    status: string;
    progress: number;
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

export const certificatesApi = {
  getMyCertificates: () => api.get<Certificate[]>('/certificates/my-certificates'),
  viewCertificate: (enrollmentId: number) => api.get(`/certificates/view/${enrollmentId}`, { responseType: 'blob' }),
  downloadCertificate: (enrollmentId: number) => api.get(`/certificates/download/${enrollmentId}`, { responseType: 'blob' }),
  getAll: () => api.get<Certificate[]>('/certificates'),
  getByGroup: (groupId: number) => api.get<Certificate[]>(`/certificates/by-group/${groupId}`),
  getByEnrollment: (enrollmentId: number) => api.get<Certificate>(`/certificates/enrollment/${enrollmentId}`),
  checkCertificate: (enrollmentId: number) => api.get<{ exists: boolean; enrollmentId: number }>(`/certificates/check/${enrollmentId}`),
  generate: (enrollmentId: number) => api.get(`/certificates/generate/enrollment/${enrollmentId}`, { responseType: 'blob' }),
  downloadById: (id: number) => api.get(`/certificates/download/${id}`, { responseType: 'blob' }),
};