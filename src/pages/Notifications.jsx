import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { notificationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCircle, AlertTriangle, Info, Trash2 } from 'lucide-react';

const Notifications = () => {
  const { user, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const role = isAdmin() ? 'admin' : 'doctor';
      const response = await notificationService.getNotifications(role, user.id);
      if (response.data && response.data.notifications) {
        setNotifications(response.data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = async () => {
    try {
      const role = isAdmin() ? 'admin' : 'doctor';
      await notificationService.clearNotifications(role, user.id);
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  return (
    <MainLayout title="Notifications">
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bell size={24} color="var(--primary-color)" /> Recent Activity
          </h3>
          {notifications.length > 0 && (
            <button 
              onClick={clearAll} 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid #e2e8f0', background: 'white', color: 'var(--danger-color)', cursor: 'pointer', fontWeight: '500', fontSize: '0.875rem' }}
            >
              <Trash2 size={16} /> Clear All
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
            <div style={{ background: '#f8fafc', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Bell size={32} color="#94a3b8" />
            </div>
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500', color: '#64748b' }}>No new notifications</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>You're all caught up!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                style={{ 
                  padding: '1.25rem', 
                  borderRadius: '0.75rem', 
                  background: notif.is_read ? '#f8fafc' : '#eff6ff', 
                  borderLeft: `4px solid ${notif.title?.includes('Alert') ? 'var(--danger-color)' : 'var(--primary-color)'}`,
                  display: 'flex',
                  gap: '1rem'
                }}
              >
                <div>
                  {notif.title?.includes('Alert') ? <AlertTriangle size={20} color="var(--danger-color)" /> : <Info size={20} color="var(--primary-color)" />}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', color: '#1e293b' }}>{notif.title || 'Notification'}</h4>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{notif.message}</p>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                  {new Date(notif.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Notifications;
