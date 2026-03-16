import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { Activity, Shield, Cpu, BarChart3 } from 'lucide-react';

const LandingPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header/Nav */}
      <nav style={{
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'white',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/app_logo_ui.jpg" alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
          <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>MEDISEV</h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" className="btn-primary" style={{ textDecoration: 'none' }}>Login</Link>
          <Link to="/register" style={{ 
            padding: '0.75rem 1.5rem', 
            borderRadius: '0.75rem', 
            color: 'var(--primary-color)',
            textDecoration: 'none',
            border: '1px solid var(--primary-color)'
          }}>Create Account</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '6rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)'
      }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', color: '#1e293b' }}>
          Medical Severity <br />
          <span style={{ color: 'var(--primary-color)' }}>Monitoring System</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto 2.5rem' }}>
          Advanced clinical monitoring and AI-powered severity detection for healthcare professionals. 
          Monitor patient health in real-time with precise analysis.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          <Link to="/register" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', textDecoration: 'none' }}>Get Started</Link>
        </div>
      </section>

      {/* About Section */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Innovative Healthcare Solutions</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              MEDISEV is a comprehensive medical monitoring platform designed to help doctors assess patient severity levels using both manual clinical data and AI-extracted medical reports.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              Our system integrates vital signs, laboratory values, and clinical indicators to provide accurate severity scoring (Mild, Moderate, or Critical).
            </p>
          </div>
          <div style={{ background: 'var(--gradient-primary)', borderRadius: '2rem', height: '400px', opacity: 0.1 }}></div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '5rem 2rem', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '4rem' }}>Platform Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <FeatureCard 
              icon={<Cpu color="white" />} 
              title="Report Extraction" 
              desc="Extract clinical parameters automatically from medical images and PDFs."
            />
            <FeatureCard 
              icon={<Activity color="white" />} 
              title="Patient Monitoring" 
              desc="Comprehensive tracking of vitals, lab values, and symptoms for every patient."
            />
            <FeatureCard 
              icon={<Shield color="white" />} 
              title="Severity Detection" 
              desc="Advanced algorithm-based scoring to identify critical cases requiring immediate attention."
            />
            <FeatureCard 
              icon={<BarChart3 color="white" />} 
              title="Clinical Data Analysis" 
              desc="Visual representation of patient status and trends for better clinical decision making."
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '4rem' }}>How It Works</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
          <StepCard number="1" title="Register" desc="Create your professional doctor account" />
          <StepCard number="2" title="Input Data" desc="Add patient vitals or upload medical reports" />
          <StepCard number="3" title="Analyze" desc="Get real-time severity scoring and data extraction" />
          <StepCard number="4" title="Monitor" desc="Track patient health and receive critical alerts" />
        </div>
      </section>

      <Footer />
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="card" style={{ textAlign: 'left', padding: '2.5rem' }}>
    <div style={{ 
      background: 'var(--gradient-primary)', 
      width: '50px', 
      height: '50px', 
      borderRadius: '1rem', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      marginBottom: '1.5rem'
    }}>
      {icon}
    </div>
    <h3 style={{ marginBottom: '1rem' }}>{title}</h3>
    <p style={{ color: 'var(--text-secondary)' }}>{desc}</p>
  </div>
);

const StepCard = ({ number, title, desc }) => (
  <div style={{ flex: '1 1 200px', padding: '1rem' }}>
    <div style={{ 
      fontSize: '2rem', 
      fontWeight: '800', 
      color: 'var(--primary-color)', 
      opacity: 0.2,
      marginBottom: '-1.5rem'
    }}>{number}</div>
    <h3 style={{ marginBottom: '0.5rem', position: 'relative' }}>{title}</h3>
    <p style={{ color: 'var(--text-secondary)' }}>{desc}</p>
  </div>
);

export default LandingPage;
