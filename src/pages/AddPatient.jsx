import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { patientService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft } from 'lucide-react';

const AddPatient = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState('');

  const NAME_REGEX = /^[a-zA-Z ]+$/;

  const validateEmail = (email) => {
    // Strict regex: username@domain.tld
    // Ensures at least one character before @, and domain starts with alphanumeric
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9][a-zA-Z0-9-]*\.(com|org|net|edu)$/i;
    if (!emailRegex.test(email)) return false;
    
    const domain = email.split('@')[1].toLowerCase();
    // Blacklist specifically mentioned invalid/incomplete domains
    const blockedDomains = [
      'gma.cim', 'gm.com', 'gma.com', 'gmil.com', 'gmal.com', 
      'gnail.com', 'gamil.com', 'yaho.com', 'outlok.com', 'hotmal.com'
    ];
    if (blockedDomains.includes(domain)) return false;
    
    return true;
  };

  const validatePhone = (phone) => {
    return /^[6-9]\d{9}$/.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate Full Name
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setNameError('Full Name is required');
      return;
    }
    if (!NAME_REGEX.test(trimmedName)) {
      setNameError('Name should contain only letters');
      return;
    }
    setNameError('');

    // Validate email
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);

    try {
      const response = await patientService.addPatient({
        ...formData,
        doctor_id: user.id
      });
      if (response.data.success) {
        alert('Patient added successfully!');
        navigate('/patients');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add patient. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Real-time name validation
    if (name === 'name') {
      if (value && !NAME_REGEX.test(value)) {
        setNameError('Name should contain only letters');
      } else {
        setNameError('');
      }
      return;
    }

    // Real-time validation
    if (name === 'email') {
      if (value && !validateEmail(value)) {
        setError('Please enter a valid email address.');
      } else {
        setError('');
      }
    } else if (name === 'phone') {
      if (value && !validatePhone(value)) {
        setError('Please enter a valid 10-digit Indian mobile number.');
      } else {
        setError('');
      }
    }
  };

  return (
    <MainLayout title="Add New Patient">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontWeight: '600' }}
        >
          <ArrowLeft size={18} /> Back
        </button>

        <section className="card">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '50%', background: '#eff6ff', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' 
            }}>
              <UserPlus color="var(--primary-color)" size={32} />
            </div>
            <h3>Patient Registration</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Enter patient personal details to create a record</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Patient Full Name</label>
              <input
                name="name"
                placeholder="Enter name"
                value={formData.name}
                onChange={handleChange}
                required
                style={nameError ? { borderColor: 'var(--danger-color)' } : {}}
              />
              {nameError && (
                <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.78rem', color: 'var(--danger-color)' }}>{nameError}</p>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Age</label>
                <input type="number" name="age" placeholder="e.g. 45" value={formData.age} onChange={handleChange} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Contact Number</label>
                <input name="phone" placeholder="10-digit number" value={formData.phone} onChange={handleChange} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Email Address</label>
                <input type="email" name="email" placeholder="example@gmail.com" value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Address</label>
              <textarea name="address" rows="3" placeholder="Enter residential address" value={formData.address} onChange={handleChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid var(--border-color)' }} />
            </div>

            {error && <div style={{ color: 'var(--danger-color)', fontSize: '0.875rem', textAlign: 'center', fontWeight: '500' }}>{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '1rem', marginTop: '1rem' }}>
              {loading ? 'Creating Record...' : 'Register Patient'}
            </button>
          </form>
        </section>
      </div>
    </MainLayout>

  );
};

export default AddPatient;
