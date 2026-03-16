import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { patientService } from '../services/api';
import { Activity, Calendar, User, Phone, MapPin, ChevronLeft, FileText } from 'lucide-react';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await patientService.getPatientDetails(id);
        setPatient(response.data.patient || response.data);
      } catch (err) {
        console.error('Error fetching patient:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [id]);

  if (loading) return <MainLayout title="Patient Details"><p>Loading...</p></MainLayout>;
  if (!patient) return <MainLayout title="Patient Details"><p>Patient not found.</p></MainLayout>;

  return (
    <MainLayout title="Medical Record">
      <button 
        onClick={() => navigate('/patients')} 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontWeight: '600' }}
      >
        <ChevronLeft size={18} /> All Patients
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Profile Card */}
        <section className="card" style={{ height: 'fit-content' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gradient-primary)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'white', fontSize: '1.5rem', fontWeight: 'bold'
            }}>
              {patient.name?.charAt(0)}
            </div>
            <h2 style={{ margin: '0 0 0.5rem' }}>{patient.name}</h2>
            <SeverityBadge level={patient.severity_level} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <InfoRow icon={<User size={18} />} label="Age / Gender" value={`${patient.age}Y / ${patient.gender}`} />
            <InfoRow icon={<Phone size={18} />} label="Phone" value={patient.phone} />
            <InfoRow icon={<MapPin size={18} />} label="Address" value={patient.address} />
            <InfoRow icon={<Calendar size={18} />} label="Registered" value={new Date(patient.created_at).toLocaleDateString()} />
          </div>

          <button style={{ width: '100%', marginTop: '2rem', padding: '1rem', borderRadius: '0.75rem', border: '1.5px solid var(--border-color)', background: 'white', fontWeight: '600' }}>
            Edit Profile
          </button>
        </section>

        {/* Clinical History & Trends */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section className="card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Activity size={24} color="var(--primary-color)" /> Current Clinical Status
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
              <VitalsBox label="Severity Score" value={patient.severity_score || '0'} color="var(--primary-color)" />
              <VitalsBox label="Last Analysis" value={patient.last_vitals_date ? new Date(patient.last_vitals_date).toLocaleDateString() : 'None'} />
              <VitalsBox label="Total Reports" value="3" />
            </div>
          </section>

          <section className="card" style={{ padding: 0 }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: 0 }}>Analysis History</h3>
            </div>
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <FileText size={48} color="#e2e8f0" style={{ marginBottom: '1rem' }} />
              <p>Clinical trend data and history will be displayed here.</p>
              <button 
                onClick={() => navigate('/manual-analysis')}
                className="btn-primary" 
                style={{ marginTop: '1rem', background: 'none', border: '1.5px solid var(--primary-color)', color: 'var(--primary-color)', boxShadow: 'none' }}
              >
                Perform New Analysis
              </button>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
    <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{icon}</div>
    <div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{label}</div>
      <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{value}</div>
    </div>
  </div>
);

const VitalsBox = ({ label, value, color }) => (
  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '1rem', textAlign: 'center' }}>
    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '600' }}>{label}</div>
    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: color || 'var(--text-primary)' }}>{value}</div>
  </div>
);

const SeverityBadge = ({ level }) => {
  const normalizedLevel = level?.toLowerCase() || 'mild';
  const colors = {
    critical: { bg: '#fee2e2', text: '#ef4444' },
    moderate: { bg: '#fffbeb', text: '#f59e0b' },
    mild: { bg: '#ecfdf5', text: '#10b981' }
  };
  const style = colors[normalizedLevel] || colors.mild;
  return (
    <span style={{ padding: '0.35rem 1rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', background: style.bg, color: style.text }}>
      {level || 'Unknown'}
    </span>
  );
};

export default PatientDetail;
