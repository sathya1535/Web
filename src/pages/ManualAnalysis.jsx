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
  const [selectedRiskFactors, setSelectedRiskFactors] = useState([]);

  const RISK_FACTORS_LIST = [
    'Age > 60', 'Hypertension', 'Diabetes', 'Asthma',
    'Heart Disease', 'Kidney Disease', 'Pregnancy', 'Smoker', 'Alcohol Use'
  ];

  // Derive selected patient's age dynamically
  const selectedPatient = patients.find(p => String(p.id) === String(selectedPatientId));
  const patientAge = selectedPatient ? parseInt(selectedPatient.age) : null;
  
  const [formData, setFormData] = useState({
    temperature: '', heart_rate: '', respiratory_rate: '', spo2: '', blood_glucose: '',
    wbc: '', platelets: '', hemoglobin: '', crp: '', esr: '',
    creatinine: '', urea: '', bilirubin: '', ast: '', alt: '', sodium: '', potassium: '',
    map: '', troponin_positive: false, pao2_fio2: '', gcs: '', urine_output: '',
    risk_factors: '', symptoms: ''
  });

  // Auto-uncheck "Age > 60" when patient age changes to ≤ 60
  useEffect(() => {
    if (patientAge !== null && patientAge <= 60) {
      setSelectedRiskFactors(prev => prev.filter(f => f !== 'Age > 60'));
    }
  }, [patientAge]);

  const handleRiskFactorChange = (factor, checked) => {
    if (factor === 'Age > 60' && (patientAge === null || patientAge <= 60)) return;
    setSelectedRiskFactors(prev =>
      checked ? [...prev, factor] : prev.filter(f => f !== factor)
    );
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await patientService.getAllPatients();
        setPatients(response.data.patients || []);
      } catch (err) {
        console.error('Error fetching patients:', err);
      }
    };
    fetchPatients();
  }, []);

  const calculateSeverity = (data) => {
    let score = 0;
    let immediateSevere = false;
    
    const getNum = (val, def = 0) => {
      if (val === null || val === undefined || val === '' || val === 'NA') return def;
      if (typeof val === 'string' && val.includes('/')) {
        const parts = val.split('/');
        return parseFloat(parts[0]) || def;
      }
      return parseFloat(val) || def;
    };

    const temp = getNum(data.temperature);
    const hr = getNum(data.heart_rate);
    const rr = getNum(data.respiratory_rate);
    const spo2 = getNum(data.spo2);
    const bg = getNum(data.blood_glucose);
    const wbc = getNum(data.wbc);
    const platelets = getNum(data.platelets);
    const hemoglobin = getNum(data.hemoglobin);
    const crp = getNum(data.crp);
    const esr = getNum(data.esr);
    const creatinine = getNum(data.creatinine);
    const urea = getNum(data.urea);
    const bilirubin = getNum(data.bilirubin);
    const ast = getNum(data.ast);
    const alt = getNum(data.alt);
    const inr = getNum(data.inr);
    const sodium = getNum(data.sodium);
    const potassium = getNum(data.potassium);
    const map = getNum(data.map);
    const pao2_fio2 = getNum(data.pao2_fio2);
    const gcs = getNum(data.gcs, 15);
    const urine_output = getNum(data.urine_output, 1);
    const troponin = data.troponin_positive === true || data.troponin_positive === 'true';

    if (wbc > 0) {
      if (wbc > 15000 || wbc < 3000) score += 3;
      else if (wbc >= 11000) score += 2;
    }
    if (platelets > 0) {
      if (platelets < 100000) score += 3;
      else if (platelets <= 150000) score += 2;
    }
    if (hemoglobin > 0) {
      if (hemoglobin < 8) score += 3;
      else if (hemoglobin <= 11) score += 2;
    }
    if (crp > 0) {
      if (crp > 50) score += 3;
      else if (crp >= 10) score += 2;
    }
    if (esr > 40) score += 2;
    if (creatinine > 0) {
      if (creatinine > 1.8) score += 3;
      else if (creatinine >= 1.2) score += 2;
    }
    if (urea > 80) score += 2;
    if (bilirubin > 0) {
      if (bilirubin > 3) score += 3;
      else if (bilirubin >= 1.2) score += 2;
    }
    if (ast > 150 || alt > 150) score += 3;
    else if (ast >= 50 || alt >= 50) score += 2;
    if (inr > 1.5) score += 3;
    if (sodium > 0) {
      if (sodium < 125 || sodium > 150) score += 3;
      else if (sodium <= 135) score += 2;
    }
    if (potassium > 0) {
      if (potassium > 6 || potassium < 3) score += 3;
      else if (potassium >= 5) score += 2;
    }
    if (map > 0 && map < 65) score += 4;
    if (troponin) score += 4;
    if (pao2_fio2 > 0 && pao2_fio2 < 300) score += 3;
    if (gcs > 0 && gcs < 12) score += 4;
    if (urine_output > 0 && urine_output < 0.5) score += 3;

    if (data.risk_factors && typeof data.risk_factors === 'string') {
      const rf = data.risk_factors.split(',').filter(x => x.trim());
      score += rf.length;
    }

    if (temp > 0) {
      if (temp > 38.5 || temp < 35.5) score += 3;
      else if (temp > 37.5) score += 1;
    }
    if (hr > 0) {
      if (hr > 110 || hr < 50) score += 3;
      else if (hr > 100) score += 2;
    }
    if (rr > 0) {
      if (rr > 24 || rr < 10) score += 4;
      else if (rr > 20) score += 2;
    }
    if (spo2 > 0) {
      if (spo2 < 90) score += 5;
      else if (spo2 < 95) score += 3;
    }
    if (bg > 0 && (bg > 200 || bg < 60)) score += 3;

    if ((map > 0 && map < 65) || (gcs > 0 && gcs < 12) || (spo2 > 0 && spo2 < 90) || troponin) {
      immediateSevere = true;
    }

    const level = (immediateSevere || score > 25) ? "CRITICAL" : (score >= 12 ? "MODERATE" : "MILD");
    return { score, level };
  };

  const currentSeverity = calculateSeverity(formData);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = [
      'temperature', 'heart_rate', 'respiratory_rate', 'spo2', 'blood_glucose',
      'wbc', 'platelets', 'hemoglobin', 'crp', 'esr',
      'creatinine', 'urea', 'bilirubin', 'ast', 'alt', 'sodium', 'potassium',
      'map', 'pao2_fio2', 'gcs', 'urine_output'
    ];

    const missingFields = requiredFields.filter(field => !formData[field]);

    if (!selectedPatientId || missingFields.length > 0) {
      alert('All required fields must be filled');
      return;
    }

    setLoading(true);
    try {
      const response = await severityService.analyzeManual({
        ...formData,
        risk_factors: selectedRiskFactors.join(', '),
        patient_id: parseInt(selectedPatientId),
        doctor_id: user.id,
        severity_score: currentSeverity.score,
        severity_level: currentSeverity.level
      });

      if (response.data.success) {
        const selectedPatient = patients.find(p => p.id === parseInt(selectedPatientId));
        navigate('/severity-result', { 
          state: { 
            result: response.data, 
            patientId: selectedPatientId,
            patientName: selectedPatient ? selectedPatient.name : 'Unknown',
            formData: formData
          } 
        });
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
      <div style={{ position: 'sticky', top: '70px', zIndex: 10, padding: '1rem', marginBottom: '2rem', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundColor: currentSeverity.level === 'CRITICAL' ? '#fee2e2' : currentSeverity.level === 'MODERATE' ? '#fef3c7' : '#dcfce7',
        border: `2px solid ${currentSeverity.level === 'CRITICAL' ? '#ef4444' : currentSeverity.level === 'MODERATE' ? '#f59e0b' : '#10b981'}`
      }}>
        <div>
          <h4 style={{ margin: 0, color: currentSeverity.level === 'CRITICAL' ? '#991b1b' : currentSeverity.level === 'MODERATE' ? '#92400e' : '#166534' }}>Live Assessment</h4>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold', color: currentSeverity.level === 'CRITICAL' ? '#b91c1c' : currentSeverity.level === 'MODERATE' ? '#b45309' : '#15803d' }}>
            Current Status: {currentSeverity.level} | Score: {currentSeverity.score}
          </p>
        </div>
        <div style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>
          {currentSeverity.level === 'CRITICAL' ? '🚀 High Priority' : currentSeverity.level === 'MODERATE' ? '⚖️ Watch Closely' : '✅ Stable'}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Patient Selection */}
        <section className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={24} color="var(--primary-color)" /> Patient Selection
          </h3>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Target Patient <span style={{ color: 'red' }}>*</span>
            </label>
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
            <InputField label="Temperature (°C) *" name="temperature" value={formData.temperature} onChange={handleChange} placeholder="e.g. 37.5" required />
            <InputField label="Heart Rate (bpm) *" name="heart_rate" value={formData.heart_rate} onChange={handleChange} placeholder="e.g. 80" required />
            <InputField label="Resp. Rate (bpm) *" name="respiratory_rate" value={formData.respiratory_rate} onChange={handleChange} placeholder="e.g. 18" required />
            <InputField label="SpO2 (%) *" name="spo2" value={formData.spo2} onChange={handleChange} placeholder="e.g. 98" required />
            <InputField label="Blood Gluecose (mg/dL) *" name="blood_glucose" value={formData.blood_glucose} onChange={handleChange} placeholder="e.g. 110" required />
          </div>
        </section>

        {/* Lab Indicators */}
        <section className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Beaker size={24} color="#3b82f6" /> Laboratory Values
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <InputField label="WBC (cells/µL) *" name="wbc" value={formData.wbc} onChange={handleChange} placeholder="e.g. 7500" required />
            <InputField label="Platelets (Lakhs) *" name="platelets" value={formData.platelets} onChange={handleChange} placeholder="e.g. 250000" required />
            <InputField label="Hemoglobin (g/dL) *" name="hemoglobin" value={formData.hemoglobin} onChange={handleChange} placeholder="e.g. 14" required />
            <InputField label="CRP (mg/L) *" name="crp" value={formData.crp} onChange={handleChange} placeholder="e.g. 5" required />
            <InputField label="ESR (mm/hr) *" name="esr" value={formData.esr} onChange={handleChange} placeholder="e.g. 15" required />
          </div>
        </section>

        {/* Organ Indicators */}
        <section className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Heart size={24} color="#10b981" /> Organ Indicators
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <InputField label="Creatinine (mg/dL) *" name="creatinine" value={formData.creatinine} onChange={handleChange} required />
            <InputField label="Urea (mg/dL) *" name="urea" value={formData.urea} onChange={handleChange} required />
            <InputField label="Bilirubin (mg/dL) *" name="bilirubin" value={formData.bilirubin} onChange={handleChange} required />
            <InputField label="AST (U/L) *" name="ast" value={formData.ast} onChange={handleChange} required />
            <InputField label="ALT (U/L) *" name="alt" value={formData.alt} onChange={handleChange} required />
            <InputField label="Sodium (mEq/L) *" name="sodium" value={formData.sodium} onChange={handleChange} required />
            <InputField label="Potassium (mEq/L) *" name="potassium" value={formData.potassium} onChange={handleChange} required />
          </div>
        </section>

        {/* Clinical Indicators */}
        <section className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Brain size={24} color="#a855f7" /> Clinical Indicators
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <InputField label="MAP (mmHg) *" name="map" value={formData.map} onChange={handleChange} required />
            <InputField label="PaO2/FiO2 Ratio *" name="pao2_fio2" value={formData.pao2_fio2} onChange={handleChange} required />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                GCS Score (3-15) <span style={{ color: 'red' }}>*</span>
              </label>
              <input 
                type="text"
                name="gcs"
                value={formData.gcs}
                onChange={handleChange}
                placeholder="e.g. 10/15"
                required
              />
            </div>
            <InputField label="Urine Output (mL/kg/hr) *" name="urine_output" value={formData.urine_output} onChange={handleChange} required />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
              <input 
                type="checkbox" 
                name="troponin_positive" 
                checked={formData.troponin_positive} 
                onChange={handleChange}
                style={{ width: '20px', height: '20px' }}
              />
              <label style={{ fontWeight: '600' }}>
                Troponin Positive? <span style={{ color: 'red' }}>*</span>
              </label>
            </div>
          </div>
        </section>

        <section className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🩺 Symptoms</h3>
            <textarea 
              name="symptoms" 
              placeholder="e.g. Dizziness, Shortness of Breath, Chest Pain..."
              rows="4"
              value={formData.symptoms || ''}
              onChange={handleChange}
              style={{ padding: '1rem' }}
            />
          </div>
          <div>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>⚠️ Risk Factors</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {RISK_FACTORS_LIST.map(factor => {
                const isAgeDisabled = factor === 'Age > 60' && (patientAge === null || patientAge <= 60);
                return (
                  <label
                    key={factor}
                    title={isAgeDisabled ? 'Age must be above 60 to select this risk factor' : ''}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.4rem 0.5rem', borderRadius: '0.5rem',
                      opacity: isAgeDisabled ? 0.45 : 1,
                      cursor: isAgeDisabled ? 'not-allowed' : 'pointer',
                      background: selectedRiskFactors.includes(factor) ? '#eff6ff' : 'transparent',
                      border: `1px solid ${selectedRiskFactors.includes(factor) ? 'var(--primary-color)' : '#e2e8f0'}`,
                      fontSize: '0.85rem'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRiskFactors.includes(factor)}
                      disabled={isAgeDisabled}
                      onChange={e => handleRiskFactorChange(factor, e.target.checked)}
                      style={{ accentColor: 'var(--primary-color)', cursor: isAgeDisabled ? 'not-allowed' : 'pointer' }}
                    />
                    {factor}
                    {isAgeDisabled && (
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: '2px' }}>🔒</span>
                    )}
                  </label>
                );
              })}
            </div>
            {patientAge !== null && patientAge <= 60 && (
              <p style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#ef4444' }}>
                ⚠️ Age must be above 60 to select the "Age &gt; 60" risk factor.
              </p>
            )}
          </div>
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

const InputField = ({ label, name, value, onChange, placeholder, required }) => {
  const isRequired = label.endsWith(' *');
  const baseLabel = isRequired ? label.substring(0, label.length - 2) : label;

  return (
    <div>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>
        {baseLabel} {isRequired && <span style={{ color: 'red' }}>*</span>}
      </label>
      <input 
        type="number"
        step="any"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

const Users = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default ManualAnalysis;
