import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DoctorSidebar from '../../components/DoctorSidebar'; // **FIXED**: Importing DoctorSidebar
import Header from '../../components/Header'; // **FIXED**: Corrected import path
import {
    Box, Typography, Grid, Paper, Avatar, List, ListItem,
    ListItemIcon, ListItemText, CircularProgress, Link, Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ArticleIcon from '@mui/icons-material/Article';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import styles from '../../styles/DoctorDashboard.module.css'; // **FIXED**: Corrected import path

const API_BASE_URL = "http://localhost:5000";

const getToken = () => {
    try {
        const raw = localStorage.getItem("userInfo");
        if (!raw) return null;
        return JSON.parse(raw)?.token || null;
    } catch {
        return null;
    }
};

const DoctorDashboard = () => {
    const [stats, setStats] = useState({ totalPatients: 0, todaysAppointments: 0, recentConsultations: 0 });
    const [appointments, setAppointments] = useState([]);
    const [records, setRecords] = useState([]);
    const [doctorName, setDoctorName] = useState('Doctor');
    const [doctorPhoto, setDoctorPhoto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = getToken();
            if (!token) {
                navigate('/login');
                return;
            }
            
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            // Set doctor's name from localStorage
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            if (userInfo) {
                setDoctorName(userInfo.name || 'Doctor');
                setDoctorPhoto(userInfo.photoUrl || null); // Use photoUrl from login/sidebar fetch
            }

            try {
                setLoading(true);
                setError('');
                // Run all fetches in parallel
                const [statsRes, apptRes, recordsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/doctors/dashboard/stats`, config),
                    axios.get(`${API_BASE_URL}/api/doctors/dashboard/appointments`, config),
                    axios.get(`${API_BASE_URL}/api/doctors/dashboard/records`, config)
                ]);

                setStats(statsRes.data);
                setAppointments(apptRes.data);
                setRecords(recordsRes.data);

            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError('Failed to load dashboard data. Please try again.');
                if (err.response?.status === 401) {
                     localStorage.removeItem("userInfo");
                     navigate("/login");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);
    
    // View file (same logic as ViewRecords)
    const handleViewRecord = (record) => {
        const token = getToken();
        const viewUrl = `${API_BASE_URL}/api/records/${record._id}/view?token=${token}`;
        window.open(viewUrl, '_blank');
    };

    if (loading) {
        return (
            <div className={styles.dashboardContainer}>
                <DoctorSidebar />
                <div className={styles.loadingContainer}>
                    <CircularProgress />
                    <Typography>Loading Dashboard...</Typography>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            <DoctorSidebar /> {/* **FIXED**: Using DoctorSidebar */}
            <div className={styles.mainContent}>
                <Header />
                <Box className={styles.contentWrapper}>
                    {/* Welcome Banner */}
                    <Paper className={styles.welcomeBanner}>
                        <div>
                            <Typography variant="h5" className={styles.welcomeText}>
                                Welcome back, Dr. {doctorName}!
                            </Typography>
                            <Typography className={styles.welcomeSubText}>
                                {new Date().toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </Typography>
                        </div>
                        <Avatar src={doctorPhoto || '/default-avatar.jpg'} className={styles.bannerAvatar} />
                    </Paper>
                    
                    {error && <Typography color="error" align="center" sx={{mb: 2}}>{error}</Typography>}

                    {/* Stat Cards */}
                    <Grid container spacing={3} className={styles.statGrid}>
                        <Grid item xs={12} md={4}>
                            <Paper className={`${styles.statCard} ${styles.stat1}`}>
                                <PeopleIcon className={styles.statIcon} />
                                <Typography className={styles.statValue}>{stats.totalPatients}</Typography>
                                <Typography className={styles.statLabel}>Total Patients</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper className={`${styles.statCard} ${styles.stat2}`}>
                                <EventIcon className={styles.statIcon} />
                                <Typography className={styles.statValue}>{stats.todaysAppointments}</Typography>
                                <Typography className={styles.statLabel}>Today's Appointments</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper className={`${styles.statCard} ${styles.stat3}`}>
                                <AssessmentIcon className={styles.statIcon} />
                                <Typography className={styles.statValue}>{stats.recentConsultations}</Typography>
                                <Typography className={styles.statLabel}>Recent Consultations</Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Bottom Cards */}
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        {/* Upcoming Appointments */}
                        <Grid item xs={12} lg={6}>
                            <Paper className={styles.contentCard}>
                                <Typography variant="h6" className={styles.cardTitle}>Upcoming Appointments</Typography>
                                <List dense>
                                    {appointments.length > 0 ? appointments.map(appt => (
                                        <ListItem key={appt._id} className={styles.listItem}>
                                            <Avatar src={appt.user.photo} sx={{ mr: 2 }} />
                                            <ListItemText 
                                                primary={appt.user.name} 
                                                secondary={new Date(appt.startDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                            />
                                            <Chip label="Video Call" icon={<VideoCameraFrontIcon />} size="small" className={styles.videoChip} />
                                        </ListItem>
                                    )) : (
                                        <Typography className={styles.noItemsText}>No upcoming appointments.</Typography>
                                    )}
                                </List>
                            </Paper>
                        </Grid>

                        {/* Patient Records Hub */}
                        <Grid item xs={12} lg={6}>
                            <Paper className={styles.contentCard}>
                                <Typography variant="h6" className={styles.cardTitle}>Patient Records Hub</Typography>
                                <List dense>
                                    {records.length > 0 ? records.map(record => (
                                        <ListItem key={record._id} secondaryAction={
                                            <Button size="small" onClick={() => handleViewRecord(record)}>View</Button>
                                        } className={styles.listItem}>
                                            <ListItemIcon><ArticleIcon color="primary" /></ListItemIcon>
                                            <ListItemText 
                                                primary={record.title} 
                                                secondary={`Patient: ${record.user.name}`}
                                            />
                                        </ListItem>
                                    )) : (
                                        <Typography className={styles.noItemsText}>No new records shared.</Typography>
                                    )}
                                </List>
                                <Box sx={{textAlign: 'center', mt: 2}}>
                                    <Button variant="contained" className={styles.viewAllButton} onClick={() => navigate('/doctor/patients')}>
                                        View All Records
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </div>
        </div>
    );
};

// Simple chip component for demo
const Chip = ({ label, icon, size, className }) => (
    <div className={className}>
        {icon}
        <span>{label}</span>
    </div>
);

export default DoctorDashboard;

