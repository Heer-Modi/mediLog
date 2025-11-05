import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from '../styles/components/Sidebar.module.css'; // Reusing the same CSS as the patient sidebar
import axios from 'axios';

// --- INLINE SVG ICONS ---
const FaTachometerAlt = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256 256-114.6 256-256S397.4 0 256 0zm0 464c-114.7 0-208-93.3-208-208S141.3 48 256 48s208 93.3 208 208-93.3 208-208 208zm101.1-128.8l-37.4-26.7c-6.1-4.4-14.8-3.6-20.1 1.8l-83.1 83.1c-4.9 4.9-12.8 4.9-17.7 0l-37.4-37.4c-4.9-4.9-4.9-12.8 0-17.7l83.1-83.1c5.4-5.4 6.1-14.1 1.8-20.1l-26.7-37.4c-4.6-6.4-13.7-7.6-20-2.8L121 271.1c-5.8 4.3-7.6 12.3-4.1 18.2l83.1 138.5c4.6 7.6 15.3 8.3 20.8 1.8l138.5-83.1c5.9-3.5 7.7-11.4 3.8-17.7zM344 248c-13.3 0-24-10.7-24-24s10.7-24 24-24 24 10.7 24 24-10.7 24-24 24z"></path></svg>
);
const FaUsers = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M96 224c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm448 0c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm32 32h-64c-17.7 0-32 14.3-32 32v128c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V288c0-17.7-14.3-32-32-32zm-320 0H64c-17.7 0-32 14.3-32 32v128c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V288c0-17.7-14.3-32-32-32zM320 256c-44.2 0-80-35.8-80-80s35.8-80 80-80 80 35.8 80 80-35.8 80-80 80zm128 32h-64c-17.7 0-32 14.3-32 32v128c0 17.7 14.3 32 32 32h64c17.7 0 32-14.3 32-32V320c0-17.7-14.3-32-32-32z"></path></svg>
);
const FaCalendarCheck = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M400 64h-48V12c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v52H160V12c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v52H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zm-6 400H54c-3.3 0-6-2.7-6-6V160h352v298c0 3.3-2.7 6-6 6zM176 232c-6.6 0-12 5.4-12 12v144c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12V244c0-6.6-5.4-12-12-12h-40zm112-20c6.6 0 12 5.4 12 12v120l-34.5-34.5c-4.7-4.7-12.3-4.7-17 0L216 341.5V224c0-6.6 5.4-12 12-12h40z"></path></svg>
);
const FaUserMd = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M313.941 313.941c-3.414 3.414-3.414 8.948 0 12.362L368 380.364V432c0 8.837 7.163 16 16 16h32c8.837 0 16-7.163 16-16v-51.636l54.059-54.059c3.414-3.414 3.414-8.948 0-12.362L313.941 313.941zM224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm-32 32h64c17.67 0 32 14.33 32 32v128c0 17.67-14.33 32-32 32h-64c-17.67 0-32-14.33-32-32V320c0-17.67 14.33-32 32-32z"></path></svg>
);
const FaSignOutAlt = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M497 273L329 441c-15 15-41 4.5-41-17v-96H152c-13.3 0-24-10.7-24-24v-64c0-13.3 10.7-24 24-24h136V88c0-21.4 25.9-32 41-17l168 168c9.3 9.4 9.3 24.6 0 34zM192 436v-40c0-6.6-5.4-12-12-12H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h84c6.6 0 12-5.4 12-12V76c0-6.6-5.4-12-12-12H96c-53 0-96 43-96 96v192c0 53 43 96 96 96h84c6.6 0 12-5.4 12-12z"></path></svg>
);
const FaQuestionCircle = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M504 256c0 136.997-111.043 248-248 248S8 392.997 8 256C8 119.083 119.043 8 256 8s248 111.083 248 248zM262.655 90c-54.497 0-89.255 22.957-116.549 63.758-3.536 5.27-2.296 12.468 2.973 16.004l34.892 23.38c5.27 3.536 12.468 2.296 16.004-2.973 25.644-38.354 46.12-52.418 76.68-52.418 31.21 0 48.317 11.255 48.317 32.26C325 178.92 308.827 192 284.32 192c-29.01 0-45.317 13.15-58.317 33.958-3.604 5.76-1.996 13.628 3.764 17.232l34.892 23.38c5.76 3.604 13.628 1.996 17.232-3.764 14.308-22.98 33.02-33.958 58.317-33.958 52.005 0 84.317 33.602 84.317 80.062C384 319.05 342.527 344 276.945 344c-35.973 0-51.78-10.8-62.317-22.42-4.507-4.83-12.012-4.83-16.519 0l-34.892 34.892c-4.507 4.507-4.507 12.012 0 16.519C184.473 396.317 218.05 422 276.945 422c69.292 0 120.317-57.568 120.317-124.25 0-63.42-43.7-100.86-92.655-111.74zM248 384c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24z"></path></svg>
);
// --- END INLINE SVG ICONS ---

// Use a placeholder image to avoid build errors with local assets
const defaultAvatar = 'https://placehold.co/100x100/a78bfa/FFFFFF?text=DR';

const API_BASE = "http://localhost:5000";

const DoctorSidebar = () => {
    const [userPhoto, setUserPhoto] = useState(defaultAvatar);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDoctorPhoto = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
                if (!token) return;

                // Fetching from the doctor's profile endpoint
                const response = await axios.get(`${API_BASE}/api/doctors/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data?.doctor?.photo) {
                    setUserPhoto(response.data.doctor.photo);
                    // Update localStorage photo if needed
                    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
                    userInfo.photoUrl = response.data.doctor.photo;
                    localStorage.setItem('userInfo', JSON.stringify(userInfo));
                }
            } catch (error) {
                console.error("Error fetching doctor profile photo:", error);
            }
        };

        fetchDoctorPhoto();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const handleHelp = () => {
        console.log('Help clicked');
    };

    return (
        <div className={styles.sidebar}>
            <div className={styles.profilePhotoWrapper}>
                <img src={userPhoto} alt="Doctor Profile" className={styles.profilePhoto} />
            </div>

            <div className={styles.menu}>
                <NavLink
                    to="/doctor/dashboard"
                    className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
                >
                    <FaTachometerAlt />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/doctor/patients"
                    className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
                >
                    <FaUsers />
                    <span>Your Patients</span>
                </NavLink>

                <NavLink
                    to="/doctor/appointments"
                    className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
                >
                    <FaCalendarCheck />
                    <span>Appointments</span>
                </NavLink>

                <NavLink
                    to="/doctor/profile"
                    className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
                >
                    <FaUserMd />
                    <span>Profile</span>
                </NavLink>
            </div>

            {/* Help Button */}
            <NavLink
                to="/doctor/help"
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

export default DoctorSidebar;

