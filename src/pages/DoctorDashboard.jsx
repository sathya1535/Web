import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { patientService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, AlertTriangle, Activity, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    moderate: 0,
    mild: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentPatients, setRecentPatients] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await patientService.getPatients(user.id);
        const patients = response.data.patients || [];
        
        const critical = patients.filter(p => 
          ['critical', 'severe'].includes(p.severity_level?.toLowerCase())
        ).length;
        
        const moderate = patients.filter(p => 
          p.severity_level?.toLowerCase() === 'moderate'
        ).length;
        
        const mild = patients.filter(p => 
          ['stable', 'mild'].includes(p.severity_level?.toLowerCase())
        ).length;

        setStats({
          total: patients.length,
          critical,
          moderate,
          mild
        });

        // Get last 5 patients
        setRecentPatients(patients.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchDashboardData();
  }, [user.id]);

  return (
    <MainLayout title={`Welcome, Dr. ${user?.name?.split(' ')[0]}`}>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard 
          icon={<Users color="#3b82f6" />} 
          label="Total Patients" 
          value={stats.total} 
          color="#eff6ff"
        />
        <StatCard 
          icon={<AlertTriangle color="#ef4444" />} 
          label="Critical Cases" 
          value={stats.critical} 
          color="#fef2f2"
        />
        <StatCard 
          icon={<Activity color="#f59e0b" />} 
          label="Moderate Cases" 
          value={stats.moderate} 
          color="#fffbeb"
        />
        <StatCard 
          icon={<CheckCircle color="#10b981" />} 
          label="Mild Cases" 
          value={stats.mild} 
          color="#ecfdf5"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Recent Patients Table */}
        <section className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Recent Patients</h3>
            <Link to="/patients" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.875rem' }}>NAME</th>
                  <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.875rem' }}>AGE/GENDER</th>
                  <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.875rem' }}>SEVERITY</th>
                  <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.875rem' }}>DATE</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.map((patient) => (
                  <tr key={patient.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>{patient.name}</td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{patient.age}Y / {patient.gender}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <SeverityBadge level={patient.severity_level} />
                    </td>
                    <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {new Date(patient.created_at || Date.now()).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {recentPatients.length === 0 && !loading && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No patients found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Quick Actions */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ background: 'var(--gradient-primary)', color: 'white', padding: '2rem' }}>
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>Report Extraction</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.9 }}>
              Instantly extract clinical data from medical reports securely.
            </p>
            <Link to="/upload-report" className="btn-primary" style={{ 
              background: 'white', 
              color: 'var(--primary-color)', 
              textDecoration: 'none', 
              display: 'inline-block',
              boxShadow: 'none'
            }}>Upload Now</Link>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Manual Analysis</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Enter vitals and clinical indicators manually for precise severity scoring.
            </p>
            <Link to="/manual-analysis" className="btn-primary" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>Manual Entry</Link>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
    <div style={{ 
      width: '56px', 
      height: '56px', 
      borderRadius: '1rem', 
      background: color, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center'
    }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{label}</p>
      <h2 style={{ margin: 0, fontSize: '1.75rem' }}>{value}</h2>
    </div>
  </div>
);

const SeverityBadge = ({ level }) => {
  const normalizedLevel = level?.toLowerCase() || 'mild';
  const colors = {
    critical: { bg: '#fee2e2', text: '#ef4444' },
    severe: { bg: '#fee2e2', text: '#ef4444' },
    moderate: { bg: '#fffbeb', text: '#f59e0b' },
    mild: { bg: '#ecfdf5', text: '#10b981' },
    stable: { bg: '#ecfdf5', text: '#10b981' }
  };
  
  const style = colors[normalizedLevel] || colors.mild;
  
  return (
    <span style={{ 
      padding: '0.25rem 0.75rem', 
      borderRadius: '2rem', 
      fontSize: '0.75rem', 
      fontWeight: '700',
      textTransform: 'uppercase',
      background: style.bg,
      color: style.text
    }}>
      {level || 'Unknown'}
    </span>
  );
};

export default DoctorDashboard;
