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
  const [error, setError] = useState('');

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

  const handleConfirmAndSave = async () => {
    if (!extractedData) return;
    
    setLoading(true);
    try {
      // Re-trigger analysis with the extracted data to calculate final severity and save to DB
      const response = await severityService.analyzeManual({
        ...extractedData,
        patient_id: parseInt(selectedPatientId),
        doctor_id: user.id
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

  return (
    <MainLayout title="Report Extraction">
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: extractedData ? '1fr 1fr' : '1fr', gap: '2rem', transition: 'all 0.4s ease' }}>
        
        {/* Upload Column */}
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
          }} onClick={() => document.getElementById('fileInput').click()}>
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
              <Cpu size={20} /> {loading ? 'Processing Report...' : 'Scan Report & Extract Data'}
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

        {/* Extracted Data Results Column */}
        {extractedData && (
          <section className="card" style={{ animation: 'slideIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, color: 'var(--success-color)' }}>Extracted Data</h3>
              <CheckCircle size={24} color="var(--success-color)" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                Review the extracted values. These will be used for severity calculation.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <DataField label="Temperature" value={extractedData.temperature} unit="°C" />
                <DataField label="Heart Rate" value={extractedData.heart_rate} unit="bpm" />
                <DataField label="SpO2" value={extractedData.spo2} unit="%" />
                <DataField label="Glucose" value={extractedData.blood_glucose} unit="mg/dL" />
                <DataField label="WBC" value={extractedData.wbc} unit="cells" />
                <DataField label="Platelets" value={extractedData.platelets} unit="lakhs" />
                <DataField label="Hemoglobin" value={extractedData.hemoglobin} unit="g/dL" />
                <DataField label="Creatinine" value={extractedData.creatinine} unit="mg/dL" />
              </div>

              <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '0.75rem', backgroundColor: '#f0f9ff', border: '1px solid #e0f2fe' }}>
                <h4 style={{ color: '#0369a1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Detected Symptoms/Risks</h4>
                <p style={{ fontSize: '0.875rem', color: '#075985' }}>
                  {extractedData.risk_factors || 'No specific symptoms identified.'}
                </p>
              </div>

              <button 
                onClick={handleConfirmAndSave} 
                className="btn-primary" 
                disabled={loading}
                style={{ width: '100%', padding: '1.25rem', marginTop: '1rem' }}
              >
                {loading ? 'Calculating...' : 'Confirm & Calculate Severity'}
              </button>
            </div>
          </section>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </MainLayout>
  );
};

const DataField = ({ label, value, unit }) => (
  <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '0.75rem' }}>
    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: '600' }}>{label}</label>
    <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>
      {value || 'N/A'} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '400' }}>{unit}</span>
    </div>
  </div>
);

export default UploadReport;
