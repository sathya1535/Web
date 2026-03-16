import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { AlertCircle, CheckCircle, Info, ArrowLeft, Download } from 'lucide-react';

const SeverityResult = () => {
  const location = useLocation();
  const { result } = location.state || { result: null };

  if (!result) {
    return (
      <MainLayout title="Analysis Result">
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <p>No analysis result found. Please perform an analysis first.</p>
          <Link to="/manual-analysis" className="btn-primary" style={{ textDecoration: 'none' }}>Go to Manual Entry</Link>
        </div>
      </MainLayout>
    );
  }

  const level = result.severity_level?.toUpperCase();
  const isCritical = level === 'CRITICAL';
  const isModerate = level === 'MODERATE';
  
  const themeColor = isCritical ? 'var(--critical-color)' : isModerate ? 'var(--moderate-color)' : 'var(--mild-color)';
  const themeBg = isCritical ? '#fef2f2' : isModerate ? '#fffbeb' : '#ecfdf5';
  const Icon = isCritical ? AlertCircle : isModerate ? Info : CheckCircle;

  return (
    <MainLayout title="Severity Analysis Result">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <section className="card" style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem', 
          borderTop: `8px solid ${themeColor}`,
          background: `linear-gradient(180deg, ${themeBg} 0%, #ffffff 100%)`
        }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: themeColor, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 2rem',
            boxShadow: `0 10px 15px -3px ${themeColor}44`
          }}>
            <Icon size={40} color="white" />
          </div>

          <h3 style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            Calculated Severity Level
          </h3>
          <h1 style={{ fontSize: '3.5rem', color: themeColor, margin: '0 0 1rem' }}>{level}</h1>
          
          <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '2.5rem' }}>
            Severity Score: <span style={{ color: themeColor }}>{result.score}</span>
          </div>

          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '1.5rem', 
            textAlign: 'left',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid #f1f5f9'
          }}>
            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={20} color="var(--primary-color)" /> Recommendations
            </h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.25rem', lineBreak: 'any' }}>
              {isCritical ? (
                <>
                  <li style={{ marginBottom: '0.8rem' }}>Immediate admission to Intensive Care Unit (ICU) required.</li>
                  <li style={{ marginBottom: '0.8rem' }}>Constant vital sign monitoring and organ support if necessary.</li>
                  <li style={{ marginBottom: '0.8rem' }}>Urgent consultation with specialized surgical/medical teams.</li>
                  <li>Intravenous stabilizing medications should be prioritized.</li>
                </>
              ) : isModerate ? (
                <>
                  <li style={{ marginBottom: '0.8rem' }}>In-patient admission to general ward for observation.</li>
                  <li style={{ marginBottom: '0.8rem' }}>Check vitals every 4-6 hours.</li>
                  <li style={{ marginBottom: '0.8rem' }}>Begin prescribed medication regimen immediately.</li>
                  <li>Perform follow-up lab tests within 24 hours.</li>
                </>
              ) : (
                <>
                  <li style={{ marginBottom: '0.8rem' }}>Out-patient monitoring or home care is suitable.</li>
                  <li style={{ marginBottom: '0.8rem' }}>Prescribe standard symptomatic treatment.</li>
                  <li style={{ marginBottom: '0.8rem' }}>Advise patient to return if symptoms worsen.</li>
                  <li>Follow-up visit in 3-5 days recommended.</li>
                </>
              )}
            </ul>
          </div>

          <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/dashboard" style={{ 
              padding: '1rem 2rem', 
              borderRadius: '0.75rem', 
              background: '#f1f5f9', 
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <ArrowLeft size={18} /> Back to Dashboard
            </Link>
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Download size={18} /> Download Full Report
            </button>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default SeverityResult;
