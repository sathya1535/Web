import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { patientService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, UserPlus, Filter, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PatientList = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await patientService.getPatients(user.id);
        setPatients(response.data.patients || []);
      } catch (err) {
        console.error('Error fetching patients:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchPatients();
  }, [user.id]);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patient_id?.toString().includes(searchTerm)
  );

  return (
    <MainLayout title="Patient Management">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            style={{ paddingLeft: '3rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.75rem 1.25rem', 
            borderRadius: '0.75rem', 
            background: 'white', 
            border: '1px solid var(--border-color)',
            fontWeight: '600',
            color: 'var(--text-secondary)'
          }}>
            <Filter size={18} /> Filter
          </button>
          <Link to="/add-patient" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={18} /> Add Patient
          </Link>
        </div>
      </div>

      <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '600' }}>PATIENT ID</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '600' }}>FULL NAME</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '600' }}>AGE/GENDER</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '600' }}>SEVERITY</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '600' }}>LAST UPDATED</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '600' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>Loading patients...</td></tr>
              ) : filteredPatients.map((patient) => (
                <tr key={patient.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} className="table-row-hover">
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: '700', color: 'var(--primary-color)' }}>#{patient.id}</td>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600' }}>{patient.name}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>{patient.age}Y / {patient.gender}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <SeverityBadge level={patient.severity_level} />
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {patient.last_vitals_date ? new Date(patient.last_vitals_date).toLocaleDateString() : 'No record'}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <Link to={`/patient/${patient.id}`} style={{ 
                      color: 'var(--primary-color)', 
                      textDecoration: 'none', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem',
                      fontWeight: '700'
                    }}>
                      View <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
              {!loading && filteredPatients.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '4rem' }}>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No patients found matching your search.</div>
                    <Link to="/add-patient" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Add your first patient</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </MainLayout>
  );
};

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
      padding: '0.35rem 1rem', 
      borderRadius: '2rem', 
      fontSize: '0.75rem', 
      fontWeight: '800',
      textTransform: 'uppercase',
      background: style.bg,
      color: style.text,
      letterSpacing: '0.5px'
    }}>
      {level || 'Unknown'}
    </span>
  );
};

export default PatientList;
