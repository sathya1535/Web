import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { Settings as SettingsIcon, Lock, Trash2, Mail, Phone, ChevronDown, ChevronUp, User, LogOut, Edit2 } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout, login } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  // Edit Profile States
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [profileData, setProfileData] = useState({ fullname: '', email: '', phone: '', specialization: '' });
  const [loading, setLoading] = useState(false);

  // Change Password States
  const [showPassDialog, setShowPassDialog] = useState(false);
  const [passData, setPassData] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [passError, setPassError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (!user?.id) return;
      const res = await authService.getProfile(user.id);
      if (res.data.success) {
        setProfileData({
          fullname: res.data.doctor.fullname || '',
          email: res.data.doctor.email || '',
          phone: res.data.doctor.phone || '',
          specialization: res.data.doctor.specialization || ''
        });
      }
    } catch (err) {
      console.error("Failed to load profile", err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.updateProfile(user.id, profileData);
      if (res.data.success) {
        alert("Profile updated successfully");
        setShowEditDialog(false);
        fetchProfile();
        // Update context if name changed
        if (profileData.fullname !== user.name || profileData.email !== user.email) {
          login({ ...user, name: profileData.fullname, email: profileData.email });
        }
      } else {
        alert(res.data.error || "Update failed");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    if (passData.new_password !== passData.confirm_password) {
      return setPassError("New passwords do not match");
    }
    setLoading(true);
    try {
      const res = await authService.changePassword({
        doctor_id: user.id,
        current_password: passData.current_password,
        new_password: passData.new_password
      });
      if (res.data.success) {
        alert("Password changed successfully");
        setShowPassDialog(false);
        setPassData({ current_password: '', new_password: '', confirm_password: '' });
      } else {
        setPassError(res.data.message || "Failed to change password");
      }
    } catch (err) {
      setPassError(err.response?.data?.message || err.response?.data?.error || "Error changing password");
    } finally {
      setLoading(false);
    }
  };

  // FAQs
  const baseFaqs = [
    { q: "How to add a new patient?", a: "You can add a new patient by clicking the 'Add Patient' button on the dashboard. You'll need to provide their basic info, and then you can update their vitals." },
    { q: "How to generate a severity report?", a: "Go to the patient list, select a patient, and fill in the 'Enter Vitals' and 'Enter Symptoms' forms. Once submitted, the system will calculate severity." },
    { q: "Is my data secure?", a: "Absolutely. We use industry-standard AES-256 encryption for all data storage and SSL/TLS for all communication between the app and the server." },
    { q: "What do the severity levels mean?", a: "The system classifies patients into Low, Medium, and Critical. Critical patients require immediate medical attention." }
  ];

  return (
    <MainLayout title="Settings & Profile">
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '2rem' }}>
        
        {/* Profile Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', 
              background: 'var(--gradient-primary)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 'bold' 
            }}>
              {profileData.fullname?.charAt(0) || user?.name?.charAt(0) || <User size={40} />}
            </div>
            <div>
              <h2 style={{ margin: '0 0 0.5rem', color: 'var(--primary-color)' }}>{profileData.fullname || user?.name || 'Doctor Name'}</h2>
              <p style={{ margin: '0 0 0.25rem', color: 'var(--text-secondary)' }}>{profileData.email || user?.email || 'doctor@example.com'}</p>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                <span style={{ 
                  display: 'inline-block', padding: '0.25rem 0.75rem', 
                  background: '#eff6ff', color: 'var(--primary-color)', 
                  borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '600' 
                }}>Healthcare Professional</span>
                {profileData.specialization && (
                  <span style={{ 
                    display: 'inline-block', padding: '0.25rem 0.75rem', 
                    background: '#f1f5f9', color: 'var(--text-secondary)', 
                    borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '500' 
                  }}>{profileData.specialization}</span>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowEditDialog(true)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'white', border: '1px solid #e2e8f0', color: 'var(--text-secondary)',
              padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer',
              transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <Edit2 size={16} /> Edit Profile
          </button>
        </div>

        {/* Security Settings */}
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1rem', marginLeft: '0.5rem' }}>Security Settings</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
          
          <SettingsItem 
            icon={<Lock />} 
            title="Change Password" 
            subtitle="Update your login credentials" 
            onClick={() => setShowPassDialog(true)} 
          />
          
          <div 
            onClick={() => setShowLogoutDialog(true)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', 
              borderRadius: '1rem', background: '#f8fafc', cursor: 'pointer',
              border: '1px solid #e2e8f0', transition: 'all 0.2s'
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogOut color="var(--text-secondary)" />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem', color: 'var(--primary-color)', fontSize: '1rem' }}>Logout</h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Sign out of your account securely</p>
            </div>
          </div>

          <div 
            onClick={() => setShowDeleteDialog(true)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', 
              borderRadius: '1rem', background: '#fff1f2', cursor: 'pointer',
              border: '1px solid #ffe4e6', transition: 'all 0.2s'
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fecdd3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 color="#e11d48" />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem', color: '#e11d48', fontSize: '1rem' }}>Delete Account</h4>
              <p style={{ margin: 0, color: '#fb7185', fontSize: '0.875rem' }}>Permanently remove your data from servers</p>
            </div>
          </div>
        </div>

        {/* Help & Support */}
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1rem', marginLeft: '0.5rem' }}>Help & Support</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <SupportCard icon={<Mail />} title="Email Support" content="medisevadmin@gmail.com" />
          <SupportCard icon={<Phone />} title="Call Us" content="+1 (800) 123-4567" />
        </div>

        {/* FAQs */}
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1rem', marginLeft: '0.5rem' }}>Frequently Asked Questions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {baseFaqs.map((faq, idx) => (
            <FaqItem key={idx} question={faq.q} answer={faq.a} />
          ))}
        </div>

      </div>

      {/* Delete Dialog Overlay */}
      {showDeleteDialog && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', zIndex: 1000 
        }}>
          <div className="card" style={{ maxWidth: '400px', width: '90%', padding: '2rem' }}>
            <h3 style={{ marginTop: 0, color: 'var(--primary-color)' }}>Delete Account?</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '2rem' }}>
              Are you sure you want to delete your account? This action is permanent and all your medical records and profile data will be removed forever.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowDeleteDialog(false)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', padding: '0.5rem 1rem' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowDeleteDialog(false);
                  logout();
                  navigate('/login');
                }} 
                style={{ background: '#e11d48', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Dialog Overlay */}
      {showLogoutDialog && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', zIndex: 1000 
        }}>
          <div className="card" style={{ maxWidth: '400px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ marginTop: 0, color: 'var(--primary-color)' }}>Logout Confirmation</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '2rem' }}>
              Are you sure you want to log out of your account?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowLogoutDialog(false)} 
                style={{ background: 'transparent', border: '1px solid #e2e8f0', color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', padding: '0.75rem 1.5rem', borderRadius: '0.5rem' }}
              >
                No, Cancel
              </button>
              <button 
                onClick={() => {
                  setShowLogoutDialog(false);
                  logout();
                  navigate('/login');
                }} 
                style={{ background: 'var(--danger-color)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Profile Dialog */}
      {showEditDialog && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', zIndex: 1000 
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '90%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, color: 'var(--primary-color)', marginBottom: '1.5rem' }}>Edit Profile</h3>
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Full Name *</label>
                <input 
                  value={profileData.fullname}
                  onChange={(e) => setProfileData({...profileData, fullname: e.target.value})}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Email Address *</label>
                <input 
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Phone Number</label>
                <input 
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Specialization</label>
                <input 
                  value={profileData.specialization}
                  onChange={(e) => setProfileData({...profileData, specialization: e.target.value})}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowEditDialog(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', padding: '0.5rem 1rem' }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Dialog */}
      {showPassDialog && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', zIndex: 1000 
        }}>
          <div className="card" style={{ maxWidth: '400px', width: '90%', padding: '2rem' }}>
            <h3 style={{ marginTop: 0, color: 'var(--primary-color)', marginBottom: '1.5rem' }}>Change Password</h3>
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Current Password</label>
                <input 
                  type="password"
                  value={passData.current_password}
                  onChange={(e) => setPassData({...passData, current_password: e.target.value})}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>New Password</label>
                <input 
                  type="password"
                  value={passData.new_password}
                  onChange={(e) => setPassData({...passData, new_password: e.target.value})}
                  required
                  minLength="6"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>Confirm New Password</label>
                <input 
                  type="password"
                  value={passData.confirm_password}
                  onChange={(e) => setPassData({...passData, confirm_password: e.target.value})}
                  required
                  minLength="6"
                />
              </div>
              
              {passError && <div style={{ color: 'var(--danger-color)', fontSize: '0.875rem' }}>{passError}</div>}
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => { setShowPassDialog(false); setPassError(''); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', padding: '0.5rem 1rem' }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

const SettingsItem = ({ icon, title, subtitle, onClick, isSwitch, checked, onToggle }) => (
  <div 
    onClick={!isSwitch ? onClick : undefined}
    className="card" 
    style={{ 
      display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', 
      cursor: isSwitch ? 'default' : 'pointer', transition: 'transform 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: 0
    }}
  >
    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <h4 style={{ margin: '0 0 0.25rem', color: 'var(--primary-color)', fontSize: '1rem' }}>{title}</h4>
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{subtitle}</p>
    </div>
    {isSwitch ? (
      <div 
        onClick={onToggle}
        style={{ 
          width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer',
          background: checked ? 'var(--primary-color)' : '#cbd5e1',
          position: 'relative', transition: 'background 0.3s' 
        }}
      >
        <div style={{ 
          width: '20px', height: '20px', borderRadius: '50%', background: 'white',
          position: 'absolute', top: '2px', left: checked ? '22px' : '2px',
          transition: 'left 0.3s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
        }} />
      </div>
    ) : (
      <ChevronDown style={{ transform: 'rotate(-90deg)', color: 'var(--text-secondary)' }} />
    )}
  </div>
);

const SupportCard = ({ icon, title, content }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', marginBottom: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: '0 0 0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{title}</p>
      <h4 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1rem' }}>{content}</h4>
    </div>
  </div>
);

const FaqItem = ({ question, answer }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div 
      className="card" 
      onClick={() => setExpanded(!expanded)}
      style={{ padding: '1.25rem', cursor: 'pointer', marginBottom: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--primary-color)' }}>{question}</h4>
        {expanded ? <ChevronUp color="var(--primary-color)" /> : <ChevronDown color="var(--primary-color)" />}
      </div>
      {expanded && (
        <div style={{ marginTop: '1rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.9rem' }}>
          {answer}
        </div>
      )}
    </div>
  );
};

export default Settings;
