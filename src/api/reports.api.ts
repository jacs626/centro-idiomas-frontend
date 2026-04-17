import { api } from './index';

export interface ReportSummary {
  enrollments: {
    total: number;
    active: number;
    completed: number;
    dropped: number;
    retention: number;
  };
  payments: {
    total: number;
    paid: number;
    pending: number;
    late: number;
    paidPercent: number;
    pendingPercent: number;
    latePercent: number;
    totalIncome: number;
  };
}

export interface GroupReport {
  groupId: number;
  groupName: string;
  courseName: string;
  enrollments: {
    total: number;
    active: number;
    completed: number;
    dropped: number;
    retention: number;
  };
  avgProgress: number;
  attendance: {
    present: number;
    absent: number;
    late: number;
    presentPercent: number;
    absentPercent: number;
    latePercent: number;
  };
  payments: {
    total: number;
    paid: number;
    pending: number;
    late: number;
    paidPercent: number;
    pendingPercent: number;
    latePercent: number;
    totalIncome: number;
  };
}

export interface GroupsSummary {
  groupId: number;
  groupName: string;
  courseName: string;
  total: number;
  active: number;
  completed: number;
  dropped: number;
  retention: number;
  avgProgress: number;
}

export const reportsApi = {
  getSummary: () => api.get<ReportSummary>('/reports/summary'),
  getGroupsSummary: () => api.get<GroupsSummary[]>('/reports/groups'),
  getGroupReport: (groupId: number) => api.get<GroupReport>(`/reports/group/${groupId}`),
};