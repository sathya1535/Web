import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { adminService, authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, UserCheck, UserX, AlertCircle, FileText, Activity, Key, 
  TrendingUp, BarChart3, ShieldCheck, Settings, UsersRound, ClipboardList
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
      const response = await authService.resetPassword(doctorEmail, newPass, newPass);
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
    { label: 'Total Doctors', value: stats?.total_doctors || 0, icon: <Users color="#6366f1" />, color: '#eef2ff' },
    { label: 'Total Patients', value: stats?.total_patients || 0, icon: <Activity color="#3b82f6" />, color: '#eff6ff' },
    { label: 'Critical Alerts', value: stats?.critical_alerts || 0, icon: <AlertCircle color="#ef4444" />, color: '#fef2f2' },
    { label: 'System Reports', value: stats?.reports_generated || 0, icon: <FileText color="#f59e0b" />, color: '#fffbeb' },
  ];

  const severityData = stats?.severity_distribution || { mild: 0, moderate: 0, critical: 0 };
  const maxSeverity = Math.max(severityData.mild, severityData.moderate, severityData.critical, 1);

  return (
    <MainLayout title="Admin Control Center">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Top Management Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ margin: 0, color: '#1e293b' }}>System Overview</h2>
            <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Welcome back, Admin. System is running healthy.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => navigate('/settings')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', background: 'white', fontWeight: '600', cursor: 'pointer' }}>
              <Settings size={18} /> Settings
            </button>
            <button onClick={() => navigate('/notifications')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '0.75rem', background: 'var(--primary-color)', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
              <ShieldCheck size={18} /> Security Logs
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {dashboardStats.map((stat, i) => (
            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem', border: '1px solid #f1f5f9' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {React.cloneElement(stat.icon, { size: 28 })}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>{stat.label}</p>
                <h2 style={{ margin: '0.1rem 0 0 0', fontSize: '1.75rem', fontWeight: '800' }}>{stat.value}</h2>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {/* Severity Distribution Chart - Matching Mobile */}
          <section className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <BarChart3 size={22} color="var(--primary-color)" /> Patient Severity Distribution
              </h3>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', fontWeight: '600' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><i style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }} /> Mild</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><i style={{ width: '8px', height: '8px', background: '#f59e0b', borderRadius: '50%' }} /> Moderate</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><i style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }} /> Critical</span>
              </div>
            </div>
            
            <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '3rem', padding: '0 2rem' }}>
              <SeverityBar label="Mild" count={severityData.mild} max={maxSeverity} color="#10b981" />
              <SeverityBar label="Moderate" count={severityData.moderate} max={maxSeverity} color="#f59e0b" />
              <SeverityBar label="Critical" count={severityData.critical} max={maxSeverity} color="#ef4444" />
            </div>
          </section>

          {/* Administrative Actions - Matching Mobile Buttons */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <ActionCard 
              title="User Management" 
              subtitle="Approve doctor accounts and records"
              icon={<UsersRound size={24} color="#6366f1" />}
              color="#eef2ff"
              onClick={() => navigate('/patients')}
            />
            <ActionCard 
              title="Medical Reports" 
              subtitle="View all system-wide patient data"
              icon={<ClipboardList size={24} color="#f59e0b" />}
              color="#fffbeb"
              onClick={() => navigate('/admin-reports')}
            />
            <ActionCard 
              title="Activity Logs" 
              subtitle="Monitor system access and changes"
              icon={<TrendingUp size={24} color="#10b981" />}
              color="#ecfdf5"
              onClick={() => navigate('/notifications')}
            />
          </section>
        </div>

        {/* Doctor Management Table */}
        <section className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Registered Medical Professionals</h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b', background: '#f8fafc', padding: '0.4rem 0.8rem', borderRadius: '2rem', fontWeight: '600' }}>
              {doctors.length} Doctors
            </span>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '1rem 2rem' }}>Doctor Profile</th>
                  <th style={{ padding: '1rem 2rem' }}>Specialization</th>
                  <th style={{ padding: '1rem 2rem' }}>Verification</th>
                  <th style={{ padding: '1rem 2rem' }}>Control</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1.25rem 2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {doctor.fullname.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: '#1e293b' }}>{doctor.fullname}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{doctor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 2rem' }}>
                      <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>{doctor.specialization}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{doctor.phone}</div>
                    </td>
                    <td style={{ padding: '1.25rem 2rem' }}>
                      <span style={{ 
                        padding: '0.4rem 0.8rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: '700',
                        backgroundColor: doctor.is_active ? '#ecfdf5' : '#fef2f2',
                        color: doctor.is_active ? '#10b981' : '#ef4444',
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
                      }}>
                        {doctor.is_active ? <UserCheck size={14} /> : <UserX size={14} />}
                        {doctor.is_active ? 'VERIFIED' : 'PENDING'}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 2rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button 
                          title={doctor.is_active ? 'Deactivate Account' : 'Activate Account'}
                          onClick={() => handleToggleDoctor(doctor.id)}
                          style={{ 
                            width: '36px', height: '36px', borderRadius: '10px', 
                            backgroundColor: doctor.is_active ? '#fff1f2' : '#f0f9ff', 
                            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                          }}
                        >
                          {doctor.is_active ? <UserX size={18} color="#ef4444" /> : <UserCheck size={18} color="#3b82f6" />}
                        </button>
                        <button 
                          title="Reset Security Key"
                          onClick={() => handleResetPassword(doctor.email)}
                          style={{ 
                            width: '36px', height: '36px', borderRadius: '10px', 
                            backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', 
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                          }}
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
      </div>
    </MainLayout>
  );
};

const SeverityBar = ({ label, count, max, color }) => {
  const height = (count / max) * 100;
  return (
    <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
      <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>{count}</div>
      <div style={{ 
        width: '100%', 
        height: `${height}%`, 
        backgroundColor: color, 
        borderRadius: '8px 8px 0 0',
        minHeight: count > 0 ? '5px' : '0',
        transition: 'height 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }} />
      <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>{label}</div>
    </div>
  );
};

const ActionCard = ({ title, subtitle, icon, color, onClick }) => (
  <div 
    onClick={onClick}
    style={{ 
      padding: '1.25rem', borderRadius: '1.25rem', backgroundColor: 'white', border: '1px solid #f1f5f9',
      display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.05)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
  >
    <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icon}
    </div>
    <div style={{ flexGrow: 1 }}>
      <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.95rem' }}>{title}</div>
      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{subtitle}</div>
    </div>
  </div>
);

export default AdminDashboard;

