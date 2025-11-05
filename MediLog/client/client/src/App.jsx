import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import PatientHelp from './pages/dashboard/PatientHelp.jsx';
import DoctorHelp from './pages/doctor/DoctorHelp.jsx';

// Patient Dashboard Pages
import DashboardHome from './pages/dashboard/DashboardHome.jsx';
import UploadRecord from './pages/dashboard/UploadRecord.jsx';
import ViewRecords from './pages/dashboard/ViewRecords.jsx';
import PatientProfile from './pages/dashboard/PatientProfile.jsx';
import Calendar from './pages/dashboard/Calendar.jsx';
import Share from './pages/dashboard/Share.jsx';

// Doctor Dashboard Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard.jsx';
import YourPatients from './pages/doctor/YourPatients.jsx';
import Appointments from './pages/doctor/Appointments.jsx';
import DoctorProfile from './pages/doctor/DoctorProfile.jsx';

// Helper function to get user info from localStorage
const getUserInfo = () => {
  try {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error("Failed to parse userInfo from localStorage", error);
    return null;
  }
};

/**
 * @desc Protected routes for Patients
 * Checks for logged-in user with role 'patient'
 */
const PatientRoutes = () => {
  const userInfo = getUserInfo();
  if (userInfo && userInfo.token && userInfo.role === 'patient') {
    return <Outlet />; // User is a patient, show the nested page
  }
  return <Navigate to="/" replace />; // Not a patient, redirect to login
};

/**
 * @desc Protected routes for Doctors
 * Checks for logged-in user with role 'doctor'
 */
const DoctorRoutes = () => {
  const userInfo = getUserInfo();
  if (userInfo && userInfo.token && userInfo.role === 'doctor') {
    return <Outlet />; // User is a doctor, show the nested page
  }
  return <Navigate to="/" replace />; // Not a doctor, redirect to login
};

/**
 * @desc Routes for logged-in users (to prevent access to login/register)
 */
const LoggedInRedirect = ({ children }) => {
  const userInfo = getUserInfo();
  if (userInfo && userInfo.token) {
    // User is logged in, redirect to their respective dashboard
    if (userInfo.role === 'doctor') {
      return <Navigate to="/doctor/dashboard" replace />;
    }
    return <Navigate to="/dashboard/home" replace />;
  }
  return children; // User is not logged in, show the page (Login/Register)
};


const App = () => {
  return (
    <Routes>
      {/* Public Routes (for logged-out users) */}
      <Route path="/" element={<LoggedInRedirect><Login /></LoggedInRedirect>} />
      <Route path="/login" element={<LoggedInRedirect><Login /></LoggedInRedirect>} />
      <Route path="/register" element={<LoggedInRedirect><Register /></LoggedInRedirect>} />
      <Route path="/forgot-password" element={<LoggedInRedirect><ForgotPassword /></LoggedInRedirect>} />
      <Route path="/reset-password" element={<LoggedInRedirect><ResetPassword /></LoggedInRedirect>} />

      {/* Patient Protected Routes */}
      <Route element={<PatientRoutes />}>
        <Route path="/dashboard/home" element={<DashboardHome />} />
        <Route path="/dashboard/upload" element={<UploadRecord />} />
        <Route path="/dashboard/records" element={<ViewRecords />} />
        <Route path="/dashboard/patient-profile" element={<PatientProfile />} />
        <Route path="/dashboard/calendar" element={<Calendar />} />
        <Route path="/dashboard/share" element={<Share />} />

        <Route path="/dashboard/help" element={<PatientHelp />} />

      </Route>

      {/* Doctor Protected Routes */}
      <Route element={<DoctorRoutes />}>
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        {/* This is the route that was causing the bug */}
        <Route path="/doctor/patients" element={<YourPatients />} />
        <Route path="/doctor/appointments" element={<Appointments />} />
        <Route path="/doctor/profile" element={<DoctorProfile />} />
        <Route path="/doctor/help" element={<DoctorHelp />} />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

