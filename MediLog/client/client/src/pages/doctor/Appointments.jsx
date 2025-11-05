import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DoctorSidebar from '../../components/DoctorSidebar.jsx'; // **FIXED**: Added .jsx extension
import Header from '../../components/Header.jsx'; // **FIXED**: Added .jsx extension
import {
    Box, Typography, CircularProgress, Paper, List, ListItem,
    ListItemText, ListItemAvatar, Avatar, Divider, Button, Grid
} from '@mui/material';
import styles from '../../styles/Appointments.module.css'; // This path should be correct

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

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState(null); // To show loading spinner on buttons

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = getToken();
            if (!token) throw new Error('Not authenticated');

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${API_BASE_URL}/api/doctors/appointments`, config);
            setAppointments(data);
        } catch (err) {
            setError('Failed to fetch appointments.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // **NEW**: Handle Approve/Deny
    const handleStatusUpdate = async (id, status) => {
        setUpdatingId(id);
        setError('');
        try {
            const token = getToken();
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(
                `${API_BASE_URL}/api/doctors/appointments/${id}/status`,
                { status },
                config
            );
            // Refresh the list to show the change
            fetchAppointments();
        } catch (err) {
            setError('Failed to update appointment status.');
            console.error(err);
        } finally {
            setUpdatingId(null);
        }
    };

    const pendingAppointments = appointments.filter(app => app.status === 'pending');
    const confirmedAppointments = appointments.filter(app => app.status === 'approved' && new Date(app.startDate) >= new Date());
    const pastAppointments = appointments.filter(app => app.status === 'denied' || new Date(app.startDate) < new Date());

    const renderAppointmentList = (list, isPending = false) => {
        if (list.length === 0) {
            return <Typography className={styles.noItemsText}>No appointments in this category.</Typography>;
        }
        
        return list.map((app, index) => (
            <React.Fragment key={app._id}>
                <ListItem className={`${styles.appointmentItem} ${app.status === 'denied' ? styles.deniedAppointment : ''}`}>
                    <ListItemAvatar>
                        <Avatar src={app.user.photo || `https://placehold.co/60x60/EEE/313131?text=${app.user.name.charAt(0)}`} />
                    </ListItemAvatar>
                    <ListItemText
                        primary={`Pt. ${app.user.name}`}
                        secondary={
                            <>
                                <Typography component="span" variant="body2" color="textPrimary">{app.title}</Typography>
                                {` - ${new Date(app.startDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}`}
                            </>
                        }
                    />
                    {isPending && (
                        <Box className={styles.actionButtons}>
                            <Button
                                variant="contained"
                                color="success"
                                size="small"
                                disabled={updatingId === app._id}
                                onClick={() => handleStatusUpdate(app._id, 'approved')}
                            >
                                {updatingId === app._id ? <CircularProgress size={20} color="inherit" /> : 'Approve'}
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                size="small"
                                disabled={updatingId === app._id}
                                onClick={() => handleStatusUpdate(app._id, 'denied')}
                            >
                                {updatingId === app._id ? <CircularProgress size={20} color="inherit" /> : 'Deny'}
                            </Button>
                        </Box>
                    )}
                </ListItem>
                {index < list.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
        ));
    };


    return (
        <div className={styles.dashboardContainer}>
            <DoctorSidebar />
            <div className={styles.mainContent}>
                <Header />
                <Typography variant="h4" className={styles.headerTitle}>Manage Appointments</Typography>
                <Typography className={styles.headerSubtitle}>Approve, deny, and view your appointment schedule.</Typography>

                {loading ? (
                    <Box className={styles.loadingBox}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error" align="center">{error}</Typography>
                ) : (
                    <>
                        {/* Pending Appointments */}
                        <Paper className={styles.contentCard} style={{marginBottom: '2rem'}}>
                            <Typography variant="h6" className={styles.cardTitlePending}>Pending Requests</Typography>
                            <List>
                                {renderAppointmentList(pendingAppointments, true)}
                            </List>
                        </Paper>

                        {/* Confirmed & Past Appointments */}
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper className={styles.contentCard}>
                                    <Typography variant="h6" className={styles.cardTitleConfirmed}>Confirmed & Upcoming</Typography>
                                    <List>
                                        {renderAppointmentList(confirmedAppointments)}
                                    </List>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Paper className={styles.contentCard}>
                                    <Typography variant="h6" className={styles.cardTitlePast}>Past & Denied</Typography>
                                    <List>
                                        {renderAppointmentList(pastAppointments)}
                                    </List>
                                </Paper>
                            </Grid>
                        </Grid>
                    </>
                )}
            </div>
        </div>
    );
};

export default Appointments;

