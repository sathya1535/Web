import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { adminService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, UserCheck, UserX, AlertCircle, FileText, Activity, Key } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, doctorsRes] = await Promise.all([
          adminService.getStats(),
          adminService.getDoctors()
        ]);
        setStats(statsRes.data.stats);
        setDoctors(doctorsRes.data.doctors || []);
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleToggleDoctor = async (doctorId) => {
    try {
      const response = await adminService.toggleDoctor(doctorId);
      if (response.data.success) {
        // Update local state
        setDoctors(doctors.map(d => 
          d.id === doctorId ? { ...d, is_active: !d.is_active } : d
        ));
      }
    } catch (err) {
      alert('Failed to update doctor status.');
    }
  };

  const handleResetPassword = async (doctorEmail) => {
    const newPass = prompt('Enter new password for this doctor:');
    if (!newPass) return;
    
    try {
      const response = await adminService.resetPassword(doctorEmail, newPass, newPass);
      if (response.data.success) {
        alert('Password reset successfully!');
      } else {
        alert(response.data.message || 'Reset failed');
      }
    } catch (err) {
      alert('Error resetting password.');
    }
  };

  const dashboardStats = [
    { label: 'Registered Doctors', value: stats?.total_doctors || 0, icon: <Users color="#3b82f6" />, color: '#eff6ff' },
    { label: 'Total Patients', value: stats?.total_patients || 0, icon: <Activity color="#10b981" />, color: '#ecfdf5' },
    { label: 'Critical Alerts', value: stats?.critical_alerts || 0, icon: <AlertCircle color="#ef4444" />, color: '#fef2f2' },
    { label: 'Total Reports', value: stats?.reports_generated || 0, icon: <FileText color="#f59e0b" />, color: '#fffbeb' },
  ];

  return (
    <MainLayout title="Administrator Dashboard">
      {/* Admin Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {dashboardStats.map((stat, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ padding: '1rem', borderRadius: '1rem', backgroundColor: stat.color }}>{stat.icon}</div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{stat.label}</p>
              <h2 style={{ margin: 0 }}>{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Doctor Management Section */}
      <section className="card" style={{ padding: '0' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Doctor Management</h3>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{doctors.length} Doctors Registered</div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <th style={{ padding: '1rem 2rem' }}>Doctor Name</th>
                <th style={{ padding: '1rem 2rem' }}>Specialization</th>
                <th style={{ padding: '1rem 2rem' }}>Contact</th>
                <th style={{ padding: '1rem 2rem' }}>Status</th>
                <th style={{ padding: '1rem 2rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1.25rem 2rem' }}>
                    <div style={{ fontWeight: '600' }}>{doctor.fullname}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{doctor.email}</div>
                  </td>
                  <td style={{ padding: '1.25rem 2rem', color: 'var(--text-secondary)' }}>{doctor.specialization}</td>
                  <td style={{ padding: '1.25rem 2rem' }}>{doctor.phone}</td>
                  <td style={{ padding: '1.25rem 2rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: '700',
                      backgroundColor: doctor.is_active ? '#ecfdf5' : '#fef2f2',
                      color: doctor.is_active ? '#10b981' : '#ef4444'
                    }}>
                      {doctor.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 2rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        title={doctor.is_active ? 'Deactivate' : 'Activate'}
                        onClick={() => handleToggleDoctor(doctor.id)}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: doctor.is_active ? '#fff1f2' : '#f0f9ff', border: 'none' }}
                      >
                        {doctor.is_active ? <UserX size={18} color="#ef4444" /> : <UserCheck size={18} color="#3b82f6" />}
                      </button>
                      <button 
                        title="Reset Password"
                        onClick={() => handleResetPassword(doctor.email)}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
                      >
                        <Key size={18} color="#64748b" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </MainLayout>
  );
};

export default AdminDashboard;
