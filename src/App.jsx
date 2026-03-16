import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PatientList from './pages/PatientList';
import AddPatient from './pages/AddPatient';
import ManualAnalysis from './pages/ManualAnalysis';
import UploadReport from './pages/UploadReport';
import SeverityResult from './pages/SeverityResult';
import PatientDetail from './pages/PatientDetail';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAdmin } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin()) return <Navigate to="/dashboard" />;
  
  return children;
};

const ForgotPassword = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '2rem' }}>
    <div className="card" style={{ maxWidth: '400px', textAlign: 'center' }}>
      <img src="/app_logo_ui.jpg" alt="MEDISEV Logo" style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover', marginBottom: '1rem' }} />
      <h2 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem' }}>Forgot Password</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Please contact the administrator using your registered medical email to request a password reset.
      </p>
      <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Back to Login</Link>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Doctor Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/patients" element={<ProtectedRoute><PatientList /></ProtectedRoute>} />
          <Route path="/patient/:id" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />
          <Route path="/add-patient" element={<ProtectedRoute><AddPatient /></ProtectedRoute>} />
          <Route path="/manual-analysis" element={<ProtectedRoute><ManualAnalysis /></ProtectedRoute>} />
          <Route path="/upload-report" element={<ProtectedRoute><UploadReport /></ProtectedRoute>} />
          <Route path="/severity-result" element={<ProtectedRoute><SeverityResult /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
