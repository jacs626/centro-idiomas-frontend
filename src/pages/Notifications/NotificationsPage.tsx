import { useState, useEffect } from 'react';
import { notificationsApi, type Notification } from '../../api/notifications.api';
import { Card, CardContent } from '../../components/ui/Card';
import Navbar from '../../components/layout/Navbar';

const typeColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  payment: 'warning',
  certificate: 'success',
  progress: 'danger',
  enrollment: 'info',
};

const typeIcons: Record<string, string> = {
  payment: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2 3-2 3-2-3-2-2-3 2 2 2 2 2 2-2zM17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2m2-2.5V7a2 2 0 00-2-2H7a2 2 0 00-2 2v6.5',
  certificate: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 114.834 0 6.585 6.585 0 010 8.607m9.321 0a3.42 3.42 0 00-4.834 0 6.585 6.585 0 010-8.607',
  progress: 'M13 10V3L4 14h7v7l9-11h-7z',
  enrollment: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await notificationsApi.getMyNotifications();
      setNotifications(res.data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Hace un momento';
    if (hours < 24) return `Hace ${hours} hora(s)`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  if (isLoading) {
    return (
      <Navbar>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">Cargando...</p>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Notificaciones</h1>
        <p className="text-slate-500 mt-1">Mantente al día con tu progreso</p>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-center text-slate-500 py-8">
              No tienes notificaciones nuevas
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card key={notif.id} className={notif.read ? 'opacity-60' : ''}>
              <CardContent>
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    typeColors[notif.type] === 'warning' ? 'bg-amber-100' :
                    typeColors[notif.type] === 'success' ? 'bg-emerald-100' :
                    typeColors[notif.type] === 'danger' ? 'bg-red-100' :
                    'bg-indigo-100'
                  }`}>
                    <svg className={`w-5 h-5 ${
                      typeColors[notif.type] === 'warning' ? 'text-amber-600' :
                      typeColors[notif.type] === 'success' ? 'text-emerald-600' :
                      typeColors[notif.type] === 'danger' ? 'text-red-600' :
                      'text-indigo-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={typeIcons[notif.type]} />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-slate-800">{notif.title}</h3>
                      <span className="text-xs text-slate-400">{formatDate(notif.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Navbar>
  );
}