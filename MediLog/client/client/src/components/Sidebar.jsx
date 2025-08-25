import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaUpload, FaFileAlt, FaUser, FaCalendarAlt, FaShareAlt } from 'react-icons/fa';
import styles from '../styles/components/Sidebar.module.css';
import defaultAvatar from '../assets/doctor_avatar.jpeg';

const Sidebar = () => {
  // Try to get user photo from localStorage (or use default)
  let userPhoto = defaultAvatar;
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.photoUrl) {
      userPhoto = userInfo.photoUrl;
    }
  } catch (e) {}

  return (
    <div className={styles.sidebar}>
      <div className={styles.profilePhotoWrapper}>
        <img src={userPhoto} alt="User Profile" className={styles.profilePhoto} />
      </div>
      <div className={styles.menu}>
        <NavLink to="/dashboard/home" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}` }>
          <FaHome />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/dashboard/upload" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}` }>
          <FaUpload />
          <span>Upload</span>
        </NavLink>
        <NavLink to="/dashboard/records" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}` }>
          <FaFileAlt />
          <span>Records</span>
        </NavLink>
        <NavLink to="/dashboard/patient-profile" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}` }>
          <FaUser />
          <span>Profile</span>
        </NavLink>
        <NavLink to="/dashboard/calendar" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}` }>
          <FaCalendarAlt />
          <span>Calendar</span>
        </NavLink>
        <NavLink to="/dashboard/share" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}` }>
          <FaShareAlt />
          <span>Share</span>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
