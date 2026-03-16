import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminService, patientService } from '../services/api';
import { Users, Activity, AlertTriangle, FileText, Plus, Bell, LogOut, Layout, ArrowLeft } from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

const MainLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px',
        background: 'white',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0
      }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/app_logo_ui.jpg" alt="Medisev Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
          <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>MEDISEV</h2>
        </div>
        
        <nav style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <SidebarLink to="/dashboard" icon={<Layout size={20} />} label="Dashboard" />
          <SidebarLink to="/patients" icon={<Users size={20} />} label="Patients" />
          <SidebarLink to="/add-patient" icon={<Plus size={20} />} label="Add Patient" />
          <SidebarLink to="/manual-analysis" icon={<FileText size={20} />} label="Manual Entry" />
          <SidebarLink to="/upload-report" icon={<Plus size={20} />} label="Report Extraction" />
          <SidebarLink to="/notifications" icon={<Bell size={20} />} label="Notifications" />
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
          <div 
            onClick={() => navigate('/settings')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', 
              cursor: 'pointer', padding: '0.5rem', borderRadius: '0.75rem', 
              transition: 'background 0.2s', ':hover': { background: '#f8fafc' } 
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              {user?.name?.charAt(0) || 'D'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Healthcare Professional</p>
            </div>
          </div>
          <button onClick={() => setShowLogoutDialog(true)} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            width: '100%', 
            padding: '0.75rem',
            borderRadius: '0.5rem',
            color: 'var(--danger-color)',
            background: '#fef2f2',
            fontWeight: '600'
          }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: '280px', flex: 1, padding: '2rem' }}>
        <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {location.pathname !== '/dashboard' && location.pathname !== '/admin' && (
              <button 
                onClick={() => navigate(-1)} 
                title="Go Back"
                style={{ 
                  background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', 
                  width: '40px', height: '40px', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)',
                  transition: 'all 0.2s'
                }}
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h1 style={{ fontSize: '1.875rem', margin: 0 }}>{title || 'Medical Dashboard'}</h1>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {children}

        <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', opacity: 0.6 }}>
          © 2026 MEDISEV — Powered by SIMATS Engineering
        </footer>
      </main>

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
                  handleLogout();
                }} 
                style={{ background: 'var(--danger-color)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SidebarLink = ({ to, icon, label }) => (
  <NavLink to={to} style={({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.875rem 1.25rem',
    borderRadius: '0.75rem',
    textDecoration: 'none',
    color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
    background: isActive ? '#eff6ff' : 'transparent',
    fontWeight: isActive ? '600' : '500',
    transition: 'all 0.2s'
  })}>
    {icon} {label}
  </NavLink>
);

export default MainLayout;
