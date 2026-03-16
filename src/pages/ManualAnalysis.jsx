import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { patientService, severityService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, Beaker, Heart, Brain, Scissors } from 'lucide-react';

const ManualAnalysis = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  
  const [formData, setFormData] = useState({
    temperature: '', heart_rate: '', respiratory_rate: '', spo2: '', blood_glucose: '',
    wbc: '', platelets: '', hemoglobin: '', crp: '', esr: '',
    creatinine: '', urea: '', bilirubin: '', ast: '', alt: '', sodium: '', potassium: '',
    map: '', troponin_positive: false, pao2_fio2: '', gcs: '', urine_output: '',
    risk_factors: ''
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await patientService.getPatients(user.id);
        setPatients(response.data.patients || []);
      } catch (err) {
        console.error('Error fetching patients:', err);
      }
    };
    fetchPatients();
  }, [user.id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      alert('Please select a patient');
      return;
    }

    setLoading(true);
    try {
      const response = await severityService.analyzeManual({
        ...formData,
        patient_id: parseInt(selectedPatientId),
        doctor_id: user.id
      });

      if (response.data.success) {
        navigate('/severity-result', { state: { result: response.data, patientId: selectedPatientId } });
      } else {
        alert(response.data.error || 'Analysis failed');
      }
    } catch (err) {
      alert('Error during analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Manual Severity Analysis">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Patient Selection */}
        <section className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={24} color="var(--primary-color)" /> Patient Selection
          </h3>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Target Patient</label>
            <select 
              value={selectedPatientId} 
              onChange={(e) => setSelectedPatientId(e.target.value)}
              required
            >
              <option value="">Select a registered patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} (Age: {p.age})</option>
              ))}
            </select>
          </div>
        </section>

        {/* Vital Signs */}
        <section className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={24} color="#ef4444" /> Vital Signs
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <InputField label="Temperature (°C)" name="temperature" value={formData.temperature} onChange={handleChange} placeholder="e.g. 37.5" />
            <InputField label="Heart Rate (bpm)" name="heart_rate" value={formData.heart_rate} onChange={handleChange} placeholder="e.g. 80" />
            <InputField label="Resp. Rate (bpm)" name="respiratory_rate" value={formData.respiratory_rate} onChange={handleChange} placeholder="e.g. 18" />
            <InputField label="SpO2 (%)" name="spo2" value={formData.spo2} onChange={handleChange} placeholder="e.g. 98" />
            <InputField label="Blood Gluecose (mg/dL)" name="blood_glucose" value={formData.blood_glucose} onChange={handleChange} placeholder="e.g. 110" />
          </div>
        </section>

        {/* Lab Indicators */}
        <section className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Beaker size={24} color="#3b82f6" /> Laboratory Values
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <InputField label="WBC (cells/µL)" name="wbc" value={formData.wbc} onChange={handleChange} placeholder="e.g. 7500" />
            <InputField label="Platelets (Lakhs)" name="platelets" value={formData.platelets} onChange={handleChange} placeholder="e.g. 250000" />
            <InputField label="Hemoglobin (g/dL)" name="hemoglobin" value={formData.hemoglobin} onChange={handleChange} placeholder="e.g. 14" />
            <InputField label="CRP (mg/L)" name="crp" value={formData.crp} onChange={handleChange} placeholder="e.g. 5" />
            <InputField label="ESR (mm/hr)" name="esr" value={formData.esr} onChange={handleChange} placeholder="e.g. 15" />
          </div>
        </section>

        {/* Organ Indicators */}
        <section className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Heart size={24} color="#10b981" /> Organ Indicators
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <InputField label="Creatinine (mg/dL)" name="creatinine" value={formData.creatinine} onChange={handleChange} />
            <InputField label="Urea (mg/dL)" name="urea" value={formData.urea} onChange={handleChange} />
            <InputField label="Bilirubin (mg/dL)" name="bilirubin" value={formData.bilirubin} onChange={handleChange} />
            <InputField label="AST (U/L)" name="ast" value={formData.ast} onChange={handleChange} />
            <InputField label="ALT (U/L)" name="alt" value={formData.alt} onChange={handleChange} />
            <InputField label="Sodium (mEq/L)" name="sodium" value={formData.sodium} onChange={handleChange} />
            <InputField label="Potassium (mEq/L)" name="potassium" value={formData.potassium} onChange={handleChange} />
          </div>
        </section>

        {/* Clinical Indicators */}
        <section className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Brain size={24} color="#a855f7" /> Clinical Indicators
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <InputField label="MAP (mmHg)" name="map" value={formData.map} onChange={handleChange} />
            <InputField label="PaO2/FiO2 Ratio" name="pao2_fio2" value={formData.pao2_fio2} onChange={handleChange} />
            <InputField label="GCS Score (3-15)" name="gcs" value={formData.gcs} onChange={handleChange} />
            <InputField label="Urine Output (mL/kg/hr)" name="urine_output" value={formData.urine_output} onChange={handleChange} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
              <input 
                type="checkbox" 
                name="troponin_positive" 
                checked={formData.troponin_positive} 
                onChange={handleChange}
                style={{ width: '20px', height: '20px' }}
              />
              <label style={{ fontWeight: '600' }}>Troponin Positive?</label>
            </div>
          </div>
        </section>

        <section className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>Symptoms & Risk Factors</h3>
          <textarea 
            name="risk_factors" 
            placeholder="e.g. Hypertension, Diabetes, Smoker, Cough, Chest Pain..."
            rows="4"
            value={formData.risk_factors}
            onChange={handleChange}
            style={{ padding: '1rem' }}
          />
        </section>

        <button 
          type="submit" 
          className="btn-primary" 
          disabled={loading}
          style={{ padding: '1.25rem', fontSize: '1.1rem', marginBottom: '4rem' }}
        >
          {loading ? 'Performing Analysis...' : 'Perform Severity Analysis'}
        </button>
      </form>
    </MainLayout>
  );
};

const InputField = ({ label, name, value, onChange, placeholder }) => (
  <div>
    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>{label}</label>
    <input 
      type="number"
      step="any"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  </div>
);

const Users = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default ManualAnalysis;
