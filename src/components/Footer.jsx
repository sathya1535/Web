import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer" style={{
      backgroundColor: 'white',
      padding: '3rem 2rem',
      borderTop: '1px solid #e2e8f0',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2rem'
      }}>
        <div>
          <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>MEDISEV</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Medical Severity Monitoring System
          </p>
        </div>
        <div>
          <h4 style={{ marginBottom: '1rem' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none' }}>
            <li style={{ marginBottom: '0.5rem' }}><Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Home</Link></li>
            <li style={{ marginBottom: '0.5rem' }}><Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Login</Link></li>
            <li style={{ marginBottom: '0.5rem' }}><Link to="/register" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Register</Link></li>
          </ul>
        </div>
        <div>
          <h4 style={{ marginBottom: '1rem' }}>Contact</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Email: support@medisev.com<br />
            Phone: +1 234 567 890
          </p>
        </div>
      </div>
      <div style={{
        maxWidth: '1200px',
        margin: '2rem auto 0',
        paddingTop: '2rem',
        borderTop: '1px solid #f1f5f9',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.875rem'
      }}>
        © 2026 MEDISEV — Powered by SIMATS Engineering
      </div>
    </footer>
  );
};

export default Footer;
