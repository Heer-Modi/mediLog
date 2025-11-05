import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import styles from "/src/styles/DashboardHome.module.css"; // **FIXED**: Using absolute path
import Header from "/src/components/Header.jsx"; // **FIXED**: Using absolute path
import Sidebar from "/src/components/Sidebar.jsx"; // **FIXED**: Using absolute path
import { Avatar, Checkbox, Modal, Box, Typography, IconButton, CircularProgress } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import CloseIcon from '@mui/icons-material/Close';
import EventNoteIcon from '@mui/icons-material/EventNote';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

const API_BASE = "http://localhost:5000";

// Custom Notification Popup Component
const NotificationPopup = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`${styles.notificationPopup} ${styles[type]}`}>
      {type === 'success' ? <CheckCircleIcon /> : <SentimentVeryDissatisfiedIcon />}
      <p>{message}</p>
    </div>
  );
};

// **REDESIGNED** Component for Viewing Event Details
const EventDetailsModal = ({ event, onClose }) => {
    if (!event) return null;

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: 'none',
        borderRadius: '16px',
        boxShadow: 24,
        p: 4,
        outline: 'none',
    };

    return (
        <Modal open={true} onClose={onClose}>
            <Box sx={modalStyle}>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
                >
                    <CloseIcon />
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {event.eventType === 'medicine' ? <MedicalServicesIcon color="primary" sx={{ mr: 1 }}/> : <EventNoteIcon color="secondary" sx={{ mr: 1 }}/>}
                    <Typography variant="h6" component="h2">{event.title}</Typography>
                </Box>
                
                {/* **MODIFIED**: Show status for appointments */}
                {event.eventType === 'appointment' && (
                    <Box className={`${styles.eventStatusChip} ${styles[event.status]}`}>
                        Status: {event.status}
                    </Box>
                )}

                <Typography sx={{ mt: 2 }}>
                    <strong>Time:</strong> {new Date(event.startDate).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}
                </Typography>
                {event.eventType === 'appointment' && event.doctor && (
                     <Typography sx={{ mt: 2 }}>
                        <strong>Doctor:</strong> Dr. {event.doctor.name}
                    </Typography>
                )}
                {event.description && (
                    <Typography sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary', background: '#f8f9fa', padding: '8px', borderRadius: '8px' }}>
                        "{event.description}"
                    </Typography>
                )}
            </Box>
        </Modal>
    );
};


const DashboardHome = () => {
  const [profile, setProfile] = useState({});
  const [emergencyInfo, setEmergencyInfo] = useState({});
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recordCount, setRecordCount] = useState(0);
  const [reminders, setReminders] = useState([]);
  const [progress, setProgress] = useState(0);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [viewingReminder, setViewingReminder] = useState(null);
  const [nextAppointment, setNextAppointment] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  const getToken = () => JSON.parse(localStorage.getItem("userInfo"))?.token;

  const fetchData = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) { setLoading(false); return; }
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [profileRes, recordRes, eventRes] = await Promise.all([
        axios.get(`${API_BASE}/api/patients/profile`, config),
        axios.get(`${API_BASE}/api/records`, config),
        axios.get(`${API_BASE}/api/events`, config) 
      ]);

      if (profileRes.data?.patient) {
        setProfile(profileRes.data.patient);
        setEmergencyInfo(profileRes.data.patient.emergencyInfo || {});
        setPhotoUrl(profileRes.data.patient.photo || null);
      }

      if (Array.isArray(recordRes.data)) {
        setRecordCount(recordRes.data.length);
      }

      if (Array.isArray(eventRes.data)) {
        const sortedEvents = eventRes.data.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        setReminders(sortedEvents);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // This useEffect calculates medicine progress
  useEffect(() => {
    const now = new Date();
    const todaysMedicine = reminders.filter(event => {
        const eventDate = new Date(event.startDate);
        return event.eventType === 'medicine' && eventDate.toDateString() === now.toDateString();
    });

    if (todaysMedicine.length > 0) {
        const completedCount = todaysMedicine.filter(m => m.isCompleted).length;
        setProgress(Math.round((completedCount / todaysMedicine.length) * 100));
    } else {
        setProgress(0);
    }
  }, [reminders]);

  // **MODIFIED**: This useEffect now finds the next *approved* appointment
  useEffect(() => {
      const now = new Date();
      const upcomingAppt = reminders.find(event => 
          event.eventType === 'appointment' && 
          new Date(event.startDate) >= now &&
          event.doctor &&
          event.status === 'approved' // **MODIFIED**: Only show if approved
      );
      setNextAppointment(upcomingAppt || null);
  }, [reminders]);


  const handleToggleComplete = async (eventId, currentStatus) => {
    try {
      const token = getToken();
      if (!token) return;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const { data } = await axios.put(`${API_BASE}/api/events/${eventId}`, { isCompleted: !currentStatus }, config);
      
      setReminders(prevReminders => 
        prevReminders.map(r => (r._id === eventId ? data : r))
      );
      
      if (data.isCompleted) {
        showNotification('Great job! Keep it up!', 'success');
      }
    } catch (error) {
      console.error("Error updating reminder status:", error);
      showNotification('Could not update reminder.', 'error');
    }
  };
  
  // **MODIFIED**: Filtered list now only shows approved appointments and medicine
  const upcomingReminders = reminders.filter(event => {
      const isFuture = new Date(event.startDate) >= new Date();
      if (!isFuture) return false;
      
      // Always show medicine
      if (event.eventType === 'medicine') return true; 

      // Only show *approved* appointments
      if (event.eventType === 'appointment' && event.status === 'approved') return true;

      return false; // Hide pending/denied appointments
  });

  return (
    <div className={styles.dashboardContainer}>
      {notification.show && <NotificationPopup message={notification.message} type={notification.type} onClose={() => setNotification({ ...notification, show: false })} />}
      <Sidebar />
      <div className={styles.mainContent}>
        <Header />
        <div className={styles.contentWrapper}>
          <div className={styles.greetingBanner}>
             <div>
              <p className={styles.date}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
              <h2 className={styles.welcomeText}>Welcome back, {profile?.name || "Patient"}!</h2>
              <p className={styles.subText}>Always stay updated in your MediLog portal</p>
            </div>
            <div className={styles.avatarWrapper}>
              {photoUrl ? <Avatar src={photoUrl} alt={profile?.name || "User"} className={styles.bannerAvatar} /> : <Avatar className={styles.bannerAvatar}>{profile?.name?.charAt(0) || "P"}</Avatar>}
            </div>
          </div>

          <div className={styles.sectionRow}>
            <div className={styles.sectionCard}>
              <h3>Uploaded Documents</h3>
              {loading ? <CircularProgress size={24} /> : <p>{recordCount} {recordCount === 1 ? "Record" : "Records"}</p>}
            </div>
            <div className={styles.sectionCard}>
              <h3>Medicine Progress</h3>
              {loading ? <CircularProgress size={24} /> : <p>{progress}% Completed</p>}
            </div>
            <div className={styles.sectionCard}>
              <h3>Emergency Info</h3>
              {loading ? <CircularProgress size={24} /> : (
                <div>
                  <p><strong>Blood Group:</strong> {emergencyInfo?.bloodGroup || "Not provided"}</p>
                  <p><strong>Allergies:</strong> {emergencyInfo?.allergies || "None"}</p>
                  <p><strong>Emergency Contact:</strong> {emergencyInfo?.contactNumber || "Not provided"}</p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.sectionRow}>
            <div className={styles.noticeBoard}>
              <h3>Upcoming Reminders</h3>
              {loading ? <p>Loading reminders...</p> : (
                <ul>
                  {upcomingReminders.length > 0 ? upcomingReminders.map(reminder => {
                    const isCompleted = reminder.isCompleted;
                    const isMissed = !isCompleted && new Date(reminder.startDate) < new Date();
                    const liClass = isCompleted ? styles.completed : isMissed ? styles.missed : '';

                    return (
                        <li key={reminder._id} className={liClass}>
                            <div className={styles.reminderDetails} onClick={() => setViewingReminder(reminder)}>
                                <span>
                                    {new Date(reminder.startDate).toLocaleDateString() === new Date().toLocaleDateString()
                                        ? new Date(reminder.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : new Date(reminder.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })
                                    }
                                </span>
                                <strong>{reminder.title}</strong>
                                {reminder.eventType === 'appointment' && reminder.doctor && (
                                    <span className={styles.doctorTag}>w/ Dr. {reminder.doctor.name.split(' ').pop()}</span>
                                )}
                                {isMissed && <span className={styles.missedLabel}>Missed</span>}
                            </div>
                            {reminder.eventType === 'medicine' && (
                                <Checkbox
                                checked={isCompleted}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    handleToggleComplete(reminder._id, isCompleted);
                                }}
                                sx={{ '& .MMuiSvgIcon-root': { fontSize: 28 }, color: '#a78bfa', '&.Mui-checked': { color: '#8b5cf6' } }}
                                />
                            )}
                        </li>
                    );
                  }) : <li>No upcoming approved reminders.</li>}
                </ul>
              )}
            </div>
            
            <div className={styles.doctorPreview}>
              <h3>{nextAppointment ? "Your Next Appointment" : "Your Doctor"}</h3>
              {loading ? (
                <CircularProgress />
              ) : nextAppointment && nextAppointment.doctor ? (
                <div className={styles.doctorCard}>
                  <Avatar src={nextAppointment.doctor.photo || 'https://placehold.co/64x64/a78bfa/FFFFFF?text=DR'} alt={nextAppointment.doctor.name} className={styles.doctorImage} />
                  <div>
                    <p><strong>Dr. {nextAppointment.doctor.name}</strong></p>
                    <span>{nextAppointment.doctor.specialization || 'Specialist'}</span>
                    <p style={{marginTop: '8px', color: '#333', fontWeight: '500'}}>
                        {new Date(nextAppointment.startDate).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
              ) : (
                 <div className={styles.doctorCard}>
                    <Avatar src="https://placehold.co/64x64/e0e0e0/909090?text=DR" alt="Doctor" className={styles.doctorImage} />
                    <div>
                        <p>No upcoming approved appointments.</p>
                        <span>Book one in the Calendar tab!</span>
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {viewingReminder && <EventDetailsModal event={viewingReminder} onClose={() => setViewingReminder(null)} />}
    </div>
  );
};

export default DashboardHome;

