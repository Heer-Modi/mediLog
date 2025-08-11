import React from 'react';
import styles from '../../styles/DashboardHome.module.css';
import Header from '../../components/Header'; 
import Sidebar from '../../components/Sidebar';
import doctorAvatar from '../../assets/doctor_avatar.jpeg';

const DashboardHome = () => {
  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Header />
        <div className={styles.contentWrapper}>
          <div className={styles.greetingBanner}>
            <div>
              <p className={styles.date}>August 6, 2025</p>
              <h2 className={styles.welcomeText}>Welcome back, Patient!</h2>
              <p className={styles.subText}>Always stay updated in your MediLog portal</p>
            </div>
            <img src={doctorAvatar} alt="Doctor" />

          </div>

          <div className={styles.sectionRow}>
            <div className={styles.sectionCard}>
              <h3>Uploaded Documents</h3>
              <p>5 Recent Records</p>
            </div>
            <div className={styles.sectionCard}>
              <h3>Medicine Progress</h3>
              <p>60% Completed</p>
            </div>
            <div className={styles.sectionCard}>
              <h3>Emergency Info</h3>
              <p>Blood Group: O+ | Allergies: None</p>
            </div>
          </div>

          <div className={styles.sectionRow}>
            <div className={styles.noticeBoard}>
              <h3>Reminders</h3>
              <ul>
                <li>Morning Dose: 9:00 AM ✅</li>
                <li>Doctor Appointment: 4:30 PM ⏰</li>
                <li>Evening Dose: 7:00 PM ❌</li>
              </ul>
            </div>
            <div className={styles.doctorPreview}>
              <h3>Your Doctor</h3>
              <div className={styles.doctorCard}>
                <img src="/doctor-avatar.jpg" alt="Doctor" />
                <div>
                  <p>Dr. Neha Mehta</p>
                  <span>Physician, Apollo Hospital</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
