import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { patientService, severityService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle, X, Cpu } from 'lucide-react';

const UploadReport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [timerCount, setTimerCount] = useState(30);
  const [error, setError] = useState('');

  useEffect(() => {
    let interval;
    if (loading && !extractedData) {
      setTimerCount(30);
      interval = setInterval(() => {
        setTimerCount((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [loading, extractedData]);

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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedPatientId || !file) {
      setError('Please select both a patient and a medical report file.');
      return;
    }

    setLoading(true);
    setExtractedData(null);
    setError('');

    const formData = new FormData();
    formData.append('report', file);
    formData.append('patient_id', selectedPatientId);

    try {
      const response = await severityService.analyzeReport(formData);
      if (response.data.success) {
        setExtractedData(response.data.data);
      } else {
        setError(response.data.error || 'Extraction failed. Please try a clearer image.');
      }
    } catch (err) {
      setError('Connection error or invalid file format. Extraction requires a clear medical report image.');
    } finally {
      setLoading(false);
    }
  };

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
    const troponin = data.troponin_positive === true || data.troponin_positive === 'true' || data.troponin_positive === 'Positive';

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

  const currentSeverity = extractedData ? calculateSeverity(extractedData) : null;

  const handleConfirmAndSave = async () => {
    if (!extractedData) return;
    
    setLoading(true);
    try {
      // Filter symptoms and risk factors to remove raw OCR text
      const filteredData = { ...extractedData };
      if (filteredData.symptoms) {
        filteredData.symptoms = filteredData.symptoms.split(',')
          .map(s => s.trim())
          .filter(s => s.length < 100 && !s.toUpperCase().includes('OCR') && !s.toUpperCase().includes('PROCESSED'))
          .join(', ');
      }
      if (filteredData.risk_factors) {
        filteredData.risk_factors = filteredData.risk_factors.split(',')
          .map(s => s.trim())
          .filter(s => s.length < 100 && !s.toUpperCase().includes('OCR') && !s.toUpperCase().includes('PROCESSED'))
          .join(', ');
      }

      const response = await severityService.analyzeManual({
        ...filteredData,
        patient_id: parseInt(selectedPatientId),
        doctor_id: user.id,
        severity_score: currentSeverity.score,
        severity_level: currentSeverity.level
      });

      if (response.data.success) {
        navigate('/severity-result', { state: { result: response.data, patientId: selectedPatientId } });
      } else {
        setError('Failed to save extracted data.');
      }
    } catch (err) {
      setError('Error saving analysis results.');
    } finally {
      setLoading(false);
    }
  };

  const isFeatureVisible = true;

  if (!isFeatureVisible) {
    return (
      <MainLayout title="Report Extraction">
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>This feature is temporarily unavailable.</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Please use the Manual Analysis feature in the dashboard.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Report Extraction">
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: extractedData ? '1fr 1.2fr' : '1fr', gap: '2rem', transition: 'all 0.4s ease' }}>
        
        {/* Upload Column */}
          {loading && !extractedData ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem 2rem', 
              backgroundColor: 'white', 
              borderRadius: '1.5rem', 
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              minHeight: '400px'
            }}>
              <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>Analyzing Medical Report...</h2>
              
              <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <p style={{ margin: 0, fontWeight: '500' }}>Your report is being scanned and analyzed.</p>
                <p style={{ margin: 0 }}>Please wait while we process the medical information.</p>
              </div>

              <div style={{ 
                backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                color: 'var(--primary-color)', 
                padding: '0.75rem 1.5rem', 
                borderRadius: '2rem', 
                fontWeight: '700',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                ⏳ {timerCount} seconds remaining
              </div>

              <div className="spinner" style={{ 
                width: '50px', 
                height: '50px', 
                border: '4px solid #f3f3f3', 
                borderTop: '4px solid var(--primary-color)', 
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          ) : (
            <section className="card" style={{ height: 'fit-content' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Upload size={24} color="var(--primary-color)" /> Report Upload
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select a patient and scan their lab report for analysis.</p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Target Patient</label>
                <select 
                  value={selectedPatientId} 
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  disabled={loading || extractedData}
                >
                  <option value="">Select Patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ 
                border: '2px dashed var(--border-color)', 
                borderRadius: '1rem', 
                padding: '3rem 2rem', 
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                position: 'relative'
              }} onClick={() => !loading && document.getElementById('fileInput').click()}>
                <input 
                  type="file" 
                  id="fileInput" 
                  hidden 
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  disabled={loading || extractedData}
                />
                {file ? (
                  <div>
                    <FileText size={48} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
                    <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{file.name}</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setFile(null); }} 
                      style={{ background: 'none', color: 'var(--danger-color)', fontWeight: '700', fontSize: '0.8rem' }}
                    >Remove File</button>
                  </div>
                ) : (
                  <div>
                    <Upload size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Click to upload or drag & drop</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Supports: JPG, PNG, PDF</p>
                  </div>
                )}
              </div>

              {error && (
                <div style={{ color: 'var(--danger-color)', backgroundColor: '#fff1f2', padding: '1rem', borderRadius: '0.75rem', marginTop: '1.5rem', display: 'flex', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              {!extractedData && (
                <button 
                  onClick={handleAnalyze} 
                  className="btn-primary" 
                  disabled={loading || !file} 
                  style={{ width: '100%', padding: '1rem', marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Cpu size={20} /> {loading ? `Analyzing... ${timerCount}s` : 'Scan Report & Extract Data'}
                </button>
              )}

              {extractedData && (
                <button 
                  onClick={() => { setExtractedData(null); setFile(null); }} 
                  style={{ width: '100%', padding: '1rem', marginTop: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', background: 'white', fontWeight: '600' }}
                >
                  Analyze Another Report
                </button>
              )}
            </section>
          )}

        {/* Extracted Data Results Column */}
        {extractedData && (
          <section className="card" style={{ animation: 'slideIn 0.5s ease', display: 'flex', flexDirection: 'column', maxHeight: '90vh', borderTop: `6px solid ${currentSeverity.level === 'CRITICAL' ? '#ef4444' : currentSeverity.level === 'MODERATE' ? '#f59e0b' : '#10b981'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexShrink: 0 }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Analysis Summary</h3>
                <span style={{ 
                  display: 'inline-block', 
                  marginTop: '0.5rem',
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '1rem', 
                  fontSize: '0.85rem', 
                  fontWeight: 'bold',
                  backgroundColor: currentSeverity.level === 'CRITICAL' ? '#fee2e2' : currentSeverity.level === 'MODERATE' ? '#fef3c7' : '#dcfce7',
                  color: currentSeverity.level === 'CRITICAL' ? '#991b1b' : currentSeverity.level === 'MODERATE' ? '#92400e' : '#166534'
                }}>
                  Live Severity: {currentSeverity.level} ({currentSeverity.score} pts)
                </span>
              </div>
              <CheckCircle size={28} color="var(--success-color)" />
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', flexShrink: 0 }}>
              Verified extracted data. Adjust values below to update severity live.
            </p>

            <div style={{ overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1.5rem', flexGrow: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <EditDataField label="BP (Systolic)" value={extractedData.blood_pressure} onChange={(v) => setExtractedData({...extractedData, blood_pressure: v})} />
                <EditDataField label="HR (bpm)" value={extractedData.heart_rate} type="number" onChange={(v) => setExtractedData({...extractedData, heart_rate: v})} />
                <EditDataField label="SpO2 (%)" value={extractedData.spo2} type="number" onChange={(v) => setExtractedData({...extractedData, spo2: v})} />
                <EditDataField label="Temp (°C)" value={extractedData.temperature} type="number" onChange={(v) => setExtractedData({...extractedData, temperature: v})} />
                <EditDataField label="Resp Rate" value={extractedData.respiratory_rate} type="number" onChange={(v) => setExtractedData({...extractedData, respiratory_rate: v})} />
                <EditDataField label="Glucose" value={extractedData.blood_glucose} type="number" onChange={(v) => setExtractedData({...extractedData, blood_glucose: v})} />
                
                <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #eee', marginTop: '0.5rem', paddingTop: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>LABS</div>
                
                <EditDataField label="WBC" value={extractedData.wbc} type="number" onChange={(v) => setExtractedData({...extractedData, wbc: v})} />
                <EditDataField label="Platelets" value={extractedData.platelets} type="number" onChange={(v) => setExtractedData({...extractedData, platelets: v})} />
                <EditDataField label="Hb (g/dL)" value={extractedData.hemoglobin} type="number" onChange={(v) => setExtractedData({...extractedData, hemoglobin: v})} />
                <EditDataField label="CRP" value={extractedData.crp} type="number" onChange={(v) => setExtractedData({...extractedData, crp: v})} />
                <EditDataField label="ESR" value={extractedData.esr} type="number" onChange={(v) => setExtractedData({...extractedData, esr: v})} />
                <EditDataField label="Creatinine" value={extractedData.creatinine} type="number" onChange={(v) => setExtractedData({...extractedData, creatinine: v})} />
                <EditDataField label="Urea" value={extractedData.urea} type="number" onChange={(v) => setExtractedData({...extractedData, urea: v})} />
                <EditDataField label="Bilirubin" value={extractedData.bilirubin} type="number" onChange={(v) => setExtractedData({...extractedData, bilirubin: v})} />
                <EditDataField label="AST" value={extractedData.ast} type="number" onChange={(v) => setExtractedData({...extractedData, ast: v})} />
                <EditDataField label="ALT" value={extractedData.alt} type="number" onChange={(v) => setExtractedData({...extractedData, alt: v})} />
                <EditDataField label="INR" value={extractedData.inr} type="number" onChange={(v) => setExtractedData({...extractedData, inr: v})} />
                
                <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #eee', marginTop: '0.5rem', paddingTop: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>ORGAN / CLINICAL</div>
                <EditDataField label="Sodium" value={extractedData.sodium} type="number" onChange={(v) => setExtractedData({...extractedData, sodium: v})} />
                <EditDataField label="Potassium" value={extractedData.potassium} type="number" onChange={(v) => setExtractedData({...extractedData, potassium: v})} />
                <EditDataField label="MAP" value={extractedData.map} type="number" onChange={(v) => setExtractedData({...extractedData, map: v})} />
                <EditDataField label="GCS Score" value={extractedData.gcs} type="text" onChange={(v) => setExtractedData({...extractedData, gcs: v})} />
                <EditDataField label="PaO2/FiO2" value={extractedData.pao2_fio2} type="number" onChange={(v) => setExtractedData({...extractedData, pao2_fio2: v})} />
                <EditDataField label="Urine Out." value={extractedData.urine_output} type="number" onChange={(v) => setExtractedData({...extractedData, urine_output: v})} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                  <input 
                    type="checkbox" 
                    id="trop_check"
                    checked={extractedData.troponin_positive === true || extractedData.troponin_positive === 'true' || extractedData.troponin_positive === 'Positive'} 
                    onChange={(e) => setExtractedData({...extractedData, troponin_positive: e.target.checked})} 
                  />
                  <label htmlFor="trop_check" style={{ fontSize: '0.7rem', fontWeight: '600' }}>Troponin Pos</label>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: '#f0f9ff', border: '1px solid #e0f2fe' }}>
                  <label style={{ color: '#0369a1', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>🩺 Extracted Symptoms</label>
                  <textarea 
                    value={extractedData.symptoms || ''} 
                    onChange={(e) => setExtractedData({...extractedData, symptoms: e.target.value})}
                    style={{ width: '100%', border: 'none', background: 'transparent', resize: 'none', fontSize: '0.85rem', color: '#075985', minHeight: '40px', marginTop: '0.25rem' }}
                    placeholder="None"
                  />
                </div>
                <div style={{ padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fee2e2' }}>
                  <label style={{ color: '#991b1b', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase' }}>⚠️ Risk Factors</label>
                  <textarea 
                    value={extractedData.risk_factors || ''} 
                    onChange={(e) => setExtractedData({...extractedData, risk_factors: e.target.value})}
                    style={{ width: '100%', border: 'none', background: 'transparent', resize: 'none', fontSize: '0.85rem', color: '#991b1b', minHeight: '40px', marginTop: '0.25rem' }}
                    placeholder="None"
                  />
                </div>
              </div>

            </div>

            <button 
              onClick={handleConfirmAndSave} 
              className="btn-primary" 
              disabled={loading}
              style={{ width: '100%', padding: '1.25rem', flexShrink: 0, fontSize: '1.1rem', fontWeight: '700' }}
            >
              {loading ? 'Processing...' : 'Save to Record & View Results'}
            </button>
          </section>
        )}
      </div>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        input:focus { border-color: var(--primary-color) !important; outline: none; }
        .spinner { animation: spin 1s linear infinite; }
      `}</style>
    </MainLayout>
  );
};

const EditDataField = ({ label, value, type = "text", onChange }) => (
  <div style={{ padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
    <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '0.15rem', fontWeight: '700', textTransform: 'uppercase' }}>{label}</label>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      <input 
        type={type} 
        value={value === null || value === undefined ? '' : value}
        onChange={(e) => onChange && onChange(type === "number" ? (e.target.value === '' ? '' : parseFloat(e.target.value)) : e.target.value)}
        onBlur={(e) => {
          if (type === "number" && (e.target.value === '' || isNaN(parseFloat(e.target.value)))) {
            onChange('NA');
          }
        }}
        style={{ 
          width: '100%', 
          border: 'none', 
          background: 'transparent', 
          fontSize: '1rem', 
          fontWeight: '700', 
          padding: 0,
          color: 'var(--text-primary)'
        }} 
      />
    </div>
  </div>
);

export default UploadReport;
