import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';

// Patient Dashboard Pages
import DashboardHome from './pages/dashboard/DashboardHome';
import UploadRecord from './pages/dashboard/UploadRecord';
import ViewRecords from './pages/dashboard/ViewRecords';
import PatientProfile from './pages/dashboard/PatientProfile';
import Calendar from './pages/dashboard/Calendar';
import Share from './pages/dashboard/Share';

// Doctor Dashboard Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import ViewPatients from './pages/doctor/ViewPatients';
import Appointments from './pages/doctor/Appointments';

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Patient Dashboard Pages */}
      <Route path="/dashboard/home" element={<DashboardHome />} />
      <Route path="/dashboard/upload" element={<UploadRecord />} />
      <Route path="/dashboard/records" element={<ViewRecords />} />
      <Route path="/dashboard/patient-profile" element={<PatientProfile />} />
      <Route path="/dashboard/calendar" element={<Calendar />} />
      <Route path="/dashboard/share" element={<Share />} />

      {/* Doctor Dashboard Pages */}
      <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
      <Route path="/doctor/patients" element={<ViewPatients />} />
      <Route path="/doctor/appointments" element={<Appointments />} />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
