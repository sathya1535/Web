import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Flask backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  login: (email, password) => api.post('/login', { email, password }),
  register: (data) => api.post('/register', data),
  resetPassword: (email, new_password, confirm_password) => 
    api.post('/admin/reset-doctor-password', { email, new_password, confirm_password }),
  getProfile: (doctorId) => api.get(`/doctor/${doctorId}`),
  updateProfile: (doctorId, data) => api.put(`/update_doctor/${doctorId}`, data),
  changePassword: (data) => api.post('/change_password', data),
};

export const patientService = {
  getPatients: (doctorId) => api.get(`/patients/doctor/${doctorId}`),
  getAllPatients: () => api.get('/patients'),
  getPatientDetails: (patientId) => api.get(`/patient/${patientId}`),
  addPatient: (data) => api.post('/add_patient', data),
  updatePatient: (patientId, data) => api.put(`/update_patient/${patientId}`, data),
  getSymptoms: (patientId) => api.get(`/patient/${patientId}/symptoms`),
};

export const severityService = {
  analyzeManual: (data) => api.post('/analyze_severity', data),
  analyzeReport: (formData) => api.post('/analyze_report', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  saveResult: (data) => api.post('/save_analysis_result', data),
};

export const adminService = {
  getStats: () => api.get('/stats'),
  getDoctors: () => api.get('/doctors'),
  toggleDoctor: (doctorId) => api.post(`/toggle-doctor/${doctorId}`),
  getReports: () => api.get('/admin/reports'),
  getDailyTrend: () => api.get('/admin/daily-analysis'),
};

export const notificationService = {
  getNotifications: (role, doctorId) => 
    api.get('/notifications', { params: { role, doctor_id: doctorId } }),
  clearNotifications: (role, doctorId) => 
    api.delete('/notifications/clear', { params: { role, doctor_id: doctorId } }),
};

export default api;
