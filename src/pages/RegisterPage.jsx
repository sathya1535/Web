import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import Footer from '../components/Footer';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    specialization: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', phone: '', fullname: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  const PHONE_REGEX = /^[6-9]\d{9}$/;
  const NAME_REGEX = /^[a-zA-Z ]+$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Live validation feedback
    if (name === 'fullname') {
      setFieldErrors(prev => ({
        ...prev,
        fullname: value && !NAME_REGEX.test(value) ? 'Name should contain only letters' : ''
      }));
    }
    if (name === 'email') {
      setFieldErrors(prev => ({
        ...prev,
        email: value && !EMAIL_REGEX.test(value) ? 'Enter a valid email address' : ''
      }));
    }
    if (name === 'phone') {
      setFieldErrors(prev => ({
        ...prev,
        phone: value && !PHONE_REGEX.test(value) ? 'Enter a valid 10-digit Indian phone number' : ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate Full Name
    const trimmedName = formData.fullname.trim();
    if (!trimmedName) {
      setFieldErrors(prev => ({ ...prev, fullname: 'Full Name is required' }));
      return;
    }
    if (!NAME_REGEX.test(trimmedName)) {
      setFieldErrors(prev => ({ ...prev, fullname: 'Name should contain only letters' }));
      return;
    }

    // Validate email
    if (!EMAIL_REGEX.test(formData.email)) {
      setFieldErrors(prev => ({ ...prev, email: 'Enter a valid email address' }));
      return;
    }

    // Validate Indian phone number
    if (!PHONE_REGEX.test(formData.phone)) {
      setFieldErrors(prev => ({ ...prev, phone: 'Enter a valid 10-digit Indian phone number' }));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({
        fullname: formData.fullname,
        email: formData.email,
        phone: formData.phone,
        specialization: formData.specialization,
        password: formData.password
      });

      if (response.data.success) {
        alert('Registration successful! Please login.');
        navigate('/login');
      } else {
        setError(response.data.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Check network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="auth-container" style={{ padding: '3rem 2rem', backgroundColor: '#f8fafc' }}>
        <div className="card" style={{ width: '100%', maxWidth: '550px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <img src="/app_logo_ui.jpg" alt="MEDISEV Logo" style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover', marginBottom: '1rem' }} />
            <h2 style={{ color: 'var(--primary-color)', fontSize: '2rem', marginBottom: '0.5rem' }}>MEDISEV</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Create your professional medical account</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Full Name</label>
              <input 
                name="fullname"
                placeholder="Dr. John Doe"
                onChange={handleChange}
                required
                style={fieldErrors.fullname ? { borderColor: 'var(--danger-color)' } : {}}
              />
              {fieldErrors.fullname && (
                <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.78rem', color: 'var(--danger-color)' }}>{fieldErrors.fullname}</p>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Email Address</label>
                <input 
                  type="text"
                  name="email"
                  placeholder="doctor@example.com"
                  onChange={handleChange}
                  required
                  style={fieldErrors.email ? { borderColor: 'var(--danger-color)' } : {}}
                />
                {fieldErrors.email && (
                  <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.78rem', color: 'var(--danger-color)' }}>{fieldErrors.email}</p>
                )}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Phone Number</label>
                <input 
                  type="tel"
                  name="phone"
                  placeholder="9876543210"
                  maxLength={10}
                  onChange={handleChange}
                  required
                  style={fieldErrors.phone ? { borderColor: 'var(--danger-color)' } : {}}
                />
                {fieldErrors.phone && (
                  <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.78rem', color: 'var(--danger-color)' }}>{fieldErrors.phone}</p>
                )}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Specialization</label>
              <select name="specialization" onChange={handleChange} required>
                <option value="">Select Specialty</option>
                <option value="General Physician">General Physician</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Surgeon">Surgeon</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Password</label>
                <input 
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Confirm Password</label>
                <input 
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {error && <div style={{ color: 'var(--danger-color)', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '1rem', marginTop: '1rem' }}>
              {loading ? 'Creating Account...' : 'Register Now'}
            </button>
          </form>

          <footer style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
            <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>Login</Link>
          </footer>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterPage;
