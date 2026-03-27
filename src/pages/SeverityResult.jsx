import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { AlertCircle, CheckCircle, Info, ArrowLeft, Download } from 'lucide-react';

const SeverityResult = () => {
  const location = useLocation();
  const { result, patientName, formData } = location.state || { result: null, patientName: '', formData: {} };

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

  const recommendations = isCritical
    ? [
        'Immediate admission to Intensive Care Unit (ICU) required.',
        'Constant vital sign monitoring and organ support if necessary.',
        'Urgent consultation with specialized surgical/medical teams.',
        'Intravenous stabilizing medications should be prioritized.',
      ]
    : isModerate
    ? [
        'In-patient admission to general ward for observation.',
        'Check vitals every 4–6 hours.',
        'Begin prescribed medication regimen immediately.',
        'Perform follow-up lab tests within 24 hours.',
      ]
    : [
        'Out-patient monitoring or home care is suitable.',
        'Prescribe standard symptomatic treatment.',
        'Advise patient to return if symptoms worsen.',
        'Follow-up visit in 3–5 days recommended.',
      ];

  const labelMap = {
    temperature: 'Temperature (°C)',
    heart_rate: 'Heart Rate (bpm)',
    respiratory_rate: 'Respiratory Rate (bpm)',
    spo2: 'SpO2 (%)',
    blood_glucose: 'Blood Glucose (mg/dL)',
    wbc: 'WBC (cells/µL)',
    platelets: 'Platelets',
    hemoglobin: 'Hemoglobin (g/dL)',
    crp: 'CRP (mg/L)',
    esr: 'ESR (mm/hr)',
    creatinine: 'Creatinine (mg/dL)',
    urea: 'Urea (mg/dL)',
    bilirubin: 'Bilirubin (mg/dL)',
    ast: 'AST (U/L)',
    alt: 'ALT (U/L)',
    sodium: 'Sodium (mEq/L)',
    potassium: 'Potassium (mEq/L)',
    map: 'MAP (mmHg)',
    troponin_positive: 'Troponin',
    pao2_fio2: 'PaO2/FiO2 Ratio',
    gcs: 'GCS Score',
    urine_output: 'Urine Output (mL/kg/hr)',
    risk_factors: 'Risk Factors',
    symptoms: 'Symptoms',
  };

  const handleDownload = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const levelColor = isCritical ? '#dc2626' : isModerate ? '#d97706' : '#16a34a';
    const levelBg = isCritical ? '#fef2f2' : isModerate ? '#fffbeb' : '#f0fdf4';

    const formatValue = (key, val) => {
      if (val === '' || val === null || val === undefined) return 'N/A';
      if (key === 'troponin_positive') return val === true || val === 'true' ? 'Positive' : 'Negative';
      return val;
    };

    const paramRows = Object.entries(labelMap)
      .filter(([key]) => formData && formData[key] !== undefined)
      .map(([key, label]) => `
        <tr>
          <td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;color:#374151;font-size:13px;">${label}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #f1f5f9;font-weight:600;color:#111827;font-size:13px;">${formatValue(key, formData[key])}</td>
        </tr>
      `).join('');

    const recList = recommendations.map(r => `<li style="margin-bottom:6px;color:#374151;font-size:13px;">${r}</li>`).join('');

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>MEDISEV Clinical Report - ${patientName || 'Patient'}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #111827; background: #fff; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { margin: 15mm 18mm; size: A4; }
          }
          .page { padding: 24px; max-width: 780px; margin: auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1d4ed8; padding-bottom: 16px; margin-bottom: 20px; }
          .brand { display: flex; align-items: center; gap: 10px; }
          .brand-icon { width: 44px; height: 44px; background: #1d4ed8; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
          .brand-icon svg { width: 26px; height: 26px; fill: white; }
          .brand-name { font-size: 22px; font-weight: 800; color: #1d4ed8; }
          .brand-sub { font-size: 11px; color: #6b7280; margin-top: 2px; }
          .meta { text-align: right; font-size: 12px; color: #6b7280; }
          .meta strong { display: block; color: #111827; font-size: 13px; }
          .result-banner { background: ${levelBg}; border: 2px solid ${levelColor}; border-radius: 12px; padding: 20px 24px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .result-left h2 { font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
          .result-left .level { font-size: 36px; font-weight: 800; color: ${levelColor}; line-height: 1; }
          .result-right { text-align: right; }
          .score-box { background: white; border: 1.5px solid ${levelColor}; border-radius: 8px; padding: 10px 18px; }
          .score-box .score-label { font-size: 11px; color: #6b7280; text-transform: uppercase; }
          .score-box .score-val { font-size: 28px; font-weight: 800; color: ${levelColor}; }
          .section { margin-bottom: 18px; }
          .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #1d4ed8; border-bottom: 1.5px solid #dbeafe; padding-bottom: 6px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; }
          .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
          .info-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
          .info-label { color: #6b7280; }
          .info-val { font-weight: 600; }
          ul { padding-left: 18px; }
          .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; }
          .confidential { background: #fef9c3; border: 1px solid #fde68a; border-radius: 6px; padding: 8px 14px; font-size: 11px; color: #92400e; margin-bottom: 18px; }
        </style>
      </head>
      <body>
        <div class="page">
          <!-- Header -->
          <div class="header">
            <div class="brand">
              <div class="brand-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                </svg>
              </div>
              <div>
                <div class="brand-name">MEDISEV</div>
                <div class="brand-sub">Clinical Severity Analysis Report</div>
              </div>
            </div>
            <div class="meta">
              <strong>Report Date</strong>${dateStr} at ${timeStr}
              <br/><br/>
              <strong>Patient Name</strong>${patientName || 'N/A'}
            </div>
          </div>

          <!-- Confidential Notice -->
          <div class="confidential">
            ⚠️ <strong>CONFIDENTIAL:</strong> This report contains protected health information. Authorized personnel only.
          </div>

          <!-- Severity Banner -->
          <div class="result-banner">
            <div class="result-left">
              <h2>Calculated Severity Level</h2>
              <div class="level">${level}</div>
            </div>
            <div class="result-right">
              <div class="score-box">
                <div class="score-label">Severity Score</div>
                <div class="score-val">${result.score}</div>
              </div>
            </div>
          </div>

          <!-- Clinical Parameters — Two sections side by side -->
          <div class="two-col">
            <!-- Vital Signs + Labs -->
            <div>
              <div class="section">
                <div class="section-title">Vital Signs</div>
                <table>
                  <tr><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;color:#6b7280;font-size:13px;">Temperature (°C)</td><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;font-weight:600;font-size:13px;">${formatValue('temperature', formData?.temperature)}</td></tr>
                  <tr><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;color:#6b7280;font-size:13px;">Heart Rate (bpm)</td><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;font-weight:600;font-size:13px;">${formatValue('heart_rate', formData?.heart_rate)}</td></tr>
                  <tr><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;color:#6b7280;font-size:13px;">Respiratory Rate (bpm)</td><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;font-weight:600;font-size:13px;">${formatValue('respiratory_rate', formData?.respiratory_rate)}</td></tr>
                  <tr><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;color:#6b7280;font-size:13px;">SpO2 (%)</td><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;font-weight:600;font-size:13px;">${formatValue('spo2', formData?.spo2)}</td></tr>
                  <tr><td style="padding:5px 8px;color:#6b7280;font-size:13px;">Blood Glucose (mg/dL)</td><td style="padding:5px 8px;font-weight:600;font-size:13px;">${formatValue('blood_glucose', formData?.blood_glucose)}</td></tr>
                </table>
              </div>
              <div class="section">
                <div class="section-title">Laboratory Values</div>
                <table>
                  <tr><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;color:#6b7280;font-size:13px;">WBC (cells/µL)</td><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;font-weight:600;font-size:13px;">${formatValue('wbc', formData?.wbc)}</td></tr>
                  <tr><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;color:#6b7280;font-size:13px;">Platelets</td><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;font-weight:600;font-size:13px;">${formatValue('platelets', formData?.platelets)}</td></tr>
                  <tr><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;color:#6b7280;font-size:13px;">Hemoglobin (g/dL)</td><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;font-weight:600;font-size:13px;">${formatValue('hemoglobin', formData?.hemoglobin)}</td></tr>
                  <tr><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;color:#6b7280;font-size:13px;">CRP (mg/L)</td><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;font-weight:600;font-size:13px;">${formatValue('crp', formData?.crp)}</td></tr>
                  <tr><td style="padding:5px 8px;color:#6b7280;font-size:13px;">ESR (mm/hr)</td><td style="padding:5px 8px;font-weight:600;font-size:13px;">${formatValue('esr', formData?.esr)}</td></tr>
                </table>
              </div>
            </div>

            <!-- Organ Indicators + Clinical -->
            <div>
              <div class="section">
                <div class="section-title">Organ Indicators</div>
                <table>
                  <tr><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;color:#6b7280;font-size:13px;">Creatinine (mg/dL)</td><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;font-weight:600;font-size:13px;">${formatValue('creatinine', formData?.creatinine)}</td></tr>
                  <tr><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;color:#6b7280;font-size:13px;">Urea (mg/dL)</td><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;font-weight:600;font-size:13px;">${formatValue('urea', formData?.urea)}</td></tr>
                  <tr><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;color:#6b7280;font-size:13px;">Bilirubin (mg/dL)</td><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;font-weight:600;font-size:13px;">${formatValue('bilirubin', formData?.bilirubin)}</td></tr>
                  <tr><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;color:#6b7280;font-size:13px;">AST (U/L)</td><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;font-weight:600;font-size:13px;">${formatValue('ast', formData?.ast)}</td></tr>
                  <tr><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;color:#6b7280;font-size:13px;">ALT (U/L)</td><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;font-weight:600;font-size:13px;">${formatValue('alt', formData?.alt)}</td></tr>
                  <tr><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;color:#6b7280;font-size:13px;">Sodium (mEq/L)</td><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;font-weight:600;font-size:13px;">${formatValue('sodium', formData?.sodium)}</td></tr>
                  <tr><td style="padding:5px 8px;color:#6b7280;font-size:13px;">Potassium (mEq/L)</td><td style="padding:5px 8px;font-weight:600;font-size:13px;">${formatValue('potassium', formData?.potassium)}</td></tr>
                </table>
              </div>
              <div class="section">
                <div class="section-title">Clinical Indicators</div>
                <table>
                  <tr><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;color:#6b7280;font-size:13px;">MAP (mmHg)</td><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;font-weight:600;font-size:13px;">${formatValue('map', formData?.map)}</td></tr>
                  <tr><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;color:#6b7280;font-size:13px;">PaO2/FiO2 Ratio</td><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;font-weight:600;font-size:13px;">${formatValue('pao2_fio2', formData?.pao2_fio2)}</td></tr>
                  <tr><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;color:#6b7280;font-size:13px;">GCS Score</td><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;font-weight:600;font-size:13px;">${formatValue('gcs', formData?.gcs)}</td></tr>
                  <tr><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;color:#6b7280;font-size:13px;">Urine Output (mL/kg/hr)</td><td style="padding:5px 8px;border-bottom:1px solid #f1f5f9;font-weight:600;font-size:13px;">${formatValue('urine_output', formData?.urine_output)}</td></tr>
                  <tr><td style="padding:5px 8px;color:#6b7280;font-size:13px;">Troponin</td><td style="padding:5px 8px;font-weight:600;font-size:13px;">${formatValue('troponin_positive', formData?.troponin_positive)}</td></tr>
                </table>
              </div>
            </div>
          </div>

          <!-- Symptoms & Risk Factors -->
          ${(formData?.symptoms || formData?.risk_factors) ? `
          <div class="two-col" style="margin-bottom:18px;">
            ${formData?.symptoms ? `
            <div class="section">
              <div class="section-title">Symptoms</div>
              <p style="font-size:13px;color:#374151;">${formData.symptoms || 'None reported'}</p>
            </div>` : ''}
            ${formData?.risk_factors ? `
            <div class="section">
              <div class="section-title">Risk Factors</div>
              <p style="font-size:13px;color:#374151;">${formData.risk_factors || 'None reported'}</p>
            </div>` : ''}
          </div>` : ''}

          <!-- Recommendations -->
          <div class="section">
            <div class="section-title">Clinical Recommendations</div>
            <ul style="margin-top:6px;">${recList}</ul>
          </div>

          <!-- Footer -->
          <div class="footer">
            <span>Generated by MEDISEV Clinical Decision Support System</span>
            <span>Report Date: ${dateStr} — CONFIDENTIAL</span>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

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
              {recommendations.map((rec, idx) => (
                <li key={idx} style={{ marginBottom: idx < recommendations.length - 1 ? '0.8rem' : 0 }}>{rec}</li>
              ))}
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
            <button
              id="download-report-btn"
              className="btn-primary"
              onClick={handleDownload}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Download size={18} /> Download Full Report
            </button>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default SeverityResult;
