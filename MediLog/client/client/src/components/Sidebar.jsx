import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from '../styles/components/Sidebar.module.css';
import axios from 'axios';

// --- INLINE SVG ICONS ---
const FaHome = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300.11L295.63 148.26a12.19 12.19 0 0 0-15.26 0zM571.6 251.47L488 182.56V44.05c0-15.11-12.61-27.34-28.14-27.34H416c-15.53 0-28.14 12.23-28.14 27.34V120L295.63 35.74a31.93 31.93 0 0 0-40.15-.12L4.38 251.47a12 12 0 0 0-1.3 16.9l25.54 33.33a12 12 0 0 0 16.9 1.3l235.19-178.71a12.19 12.19 0 0 1 15.26 0l235.19 178.71a12 12 0 0 0 16.9-1.3l25.54-33.33a12 12 0 0 0-1.31-16.89z"></path></svg>
);
const FaUpload = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M296 384h-80c-13.3 0-24-10.7-24-24V192h-87.7c-17.8 0-26.7-21.5-14.1-34.1L242.3 5.7c7.5-7.5 19.8-7.5 27.3 0l154.1 152.1c12.6 12.6 3.7 34.1-14.1 34.1H320v168c0 13.3-10.7 24-24 24zm216-8v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h136v-32H24c-48.6 0-88 39.4-88 88v112c0 48.6 39.4 88 88 88h464c48.6 0 88-39.4 88-88V376c0-48.6-39.4-88-88-88H368v32h144c13.3 0 24 10.7 24 24z"></path></svg>
);
const FaFileAlt = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M369.9 97.9L286 14C277 5 264.8-.1 252.1-.1H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V131.9c0-12.7-5.1-25-14.1-34zM332.1 128H256V51.9l76.1 76.1zM48 464V48h160v104c0 13.3 10.7 24 24 24h104v288H48z"></path></svg>
);
const FaUser = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"></path></svg>
);
const FaCalendarAlt = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12 192h424c6.6 0 12 5.4 12 12v260c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V204c0-6.6 5.4-12 12-12zM400 64h-48V12c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v52H160V12c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v52H48C21.5 64 0 85.5 0 112v48h448v-48c0-26.5-21.5-48-48-48z"></path></svg>
);
const FaSignOutAlt = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M497 273L329 441c-15 15-41 4.5-41-17v-96H152c-13.3 0-24-10.7-24-24v-64c0-13.3 10.7-24 24-24h136V88c0-21.4 25.9-32 41-17l168 168c9.3 9.4 9.3 24.6 0 34zM192 436v-40c0-6.6-5.4-12-12-12H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h84c6.6 0 12-5.4 12-12V76c0-6.6-5.4-12-12-12H96c-53 0-96 43-96 96v192c0 53 43 96 96 96h84c6.6 0 12-5.4 12-12z"></path></svg>
);
const FaQuestionCircle = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248zM262.655 90c-54.497 0-89.255 22.957-116.549 63.758-3.536 5.27-2.296 12.468 2.973 16.004l34.892 23.38c5.27 3.536 12.468 2.296 16.004-2.973 25.644-38.354 46.12-52.418 76.68-52.418 31.21 0 48.317 11.255 48.317 32.26C325 178.92 308.827 192 284.32 192c-29.01 0-45.317 13.15-58.317 33.958-3.604 5.76-1.996 13.628 3.764 17.232l34.892 23.38c5.76 3.604 13.628 1.996 17.232-3.764 14.308-22.98 33.02-33.958 58.317-33.958 52.005 0 84.317 33.602 84.317 80.062C384 319.05 342.527 344 276.945 344c-35.973 0-51.78-10.8-62.317-22.42-4.507-4.83-12.012-4.83-16.519 0l-34.892 34.892c-4.507 4.507-4.507 12.012 0 16.519C184.473 396.317 218.05 422 276.945 422c69.292 0 120.317-57.568 120.317-124.25 0-63.42-43.7-100.86-92.655-111.74zM248 384c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24z"></path></svg>
);
// --- END INLINE SVG ICONS ---

// Use a placeholder for the default avatar to prevent build errors
const defaultAvatar = 'https://placehold.co/100x100/f1f5f9/a78bfa?text=P';

const API_BASE = "http://localhost:5000";

const Sidebar = () => {
  const [userPhoto, setUserPhoto] = useState(defaultAvatar);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserPhoto = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
        if (!token) return;

        const response = await axios.get(`${API_BASE}/api/patients/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.patient?.photo) {
          setUserPhoto(response.data.patient.photo);
          // Save in localStorage for persistence
          const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
          userInfo.photoUrl = response.data.patient.photo;
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
        }
      } catch (error) {
        console.error("Error fetching sidebar profile photo:", error);
      }
    };

    // Set photo from localStorage first for faster load
    const storedPhoto = JSON.parse(localStorage.getItem('userInfo'))?.photoUrl;
    if (storedPhoto) {
        setUserPhoto(storedPhoto);
    }
    fetchUserPhoto(); // Then fetch to check for updates
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.profilePhotoWrapper}>
        <img src={userPhoto} alt="User Profile" className={styles.profilePhoto} />
      </div>
      
      <div className={styles.menu}>
        <NavLink to="/dashboard/home" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          <FaHome />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink to="/dashboard/upload" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          <FaUpload />
          <span>Upload</span>
        </NavLink>
        
        <NavLink to="/dashboard/records" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          <FaFileAlt />
          <span>Records</span>
        </NavLink>
        
        <NavLink to="/dashboard/patient-profile" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          <FaUser />
          <span>Profile</span>
        </NavLink>
        
        <NavLink to="/dashboard/calendar" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          <FaCalendarAlt />
          <span>Calendar</span>
        </NavLink>
        
        {/*<NavLink to="/dashboard/share" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          <FaShareAlt />
          <span>Share</span>
        </NavLink> */}
      </div>

      {/* **FIXED**: Removed stray 'G' */}
      <NavLink 
        to="/dashboard/help"
        className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
        title="Help & Support"
      >
        <FaQuestionCircle />
        <span>Help</span>
      </NavLink>

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className={styles.link}
        title="Logout"
      >
        <FaSignOutAlt />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;

