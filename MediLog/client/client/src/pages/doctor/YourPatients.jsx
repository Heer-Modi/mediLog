import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/DoctorSidebar'; // Corrected path
import {
    Box, Typography, CircularProgress, Accordion, AccordionSummary,
    AccordionDetails, Avatar, List, ListItem, ListItemIcon, ListItemText,
    Grid, Paper, InputAdornment, TextField
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArticleIcon from '@mui/icons-material/Article';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import WarningIcon from '@mui/icons-material/Warning';
import SearchIcon from '@mui/icons-material/Search';
import styles from '../../styles/YourPatient.module.css'; // Corrected path

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

const YourPatients = () => {
    const [patients, setPatients] = useState([]);
    const [sharedRecords, setSharedRecords] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedPatient, setExpandedPatient] = useState(null);

    // Fetch the list of patients
    useEffect(() => {
        const fetchPatients = async () => {
            setLoading(true);
            setError('');
            try {
                const token = getToken();
                if (!token) throw new Error('Not authenticated');

                const { data } = await axios.get(`${API_BASE_URL}/api/doctors/my-patients`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPatients(data);
            } catch (err) {
                setError('Failed to fetch patients.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    // Fetch shared records for a patient when their card is expanded
    const handleAccordionChange = (patientId) => async (event, isExpanded) => {
        setExpandedPatient(isExpanded ? patientId : null);
        if (isExpanded && !sharedRecords[patientId]) {
            try {
                const token = getToken();
                const { data } = await axios.get(`${API_BASE_URL}/api/doctors/my-patients/${patientId}/records`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSharedRecords(prev => ({ ...prev, [patientId]: data }));
            } catch (err) {
                setError(`Failed to fetch records for patient ${patientId}`);
            }
        }
    };
    
    // View file (same logic as ViewRecords)
    const handleViewRecord = (record) => {
        const token = getToken();
        // **SECURITY NOTE**: This token-in-URL method is okay for local dev, 
        // but for production, consider a more secure file serving method.
        const viewUrl = `${API_BASE_URL}/api/records/${record._id}/view?token=${token}`;
        window.open(viewUrl, '_blank');
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.dashboardContainer}>
            <Sidebar />
            <div className={styles.mainContent}>
                <Typography variant="h4" className={styles.headerTitle}>Your Patients</Typography>
                <Typography className={styles.headerSubtitle}>View and manage patients who have shared records with you.</Typography>

                <Paper className={styles.searchBar}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search by patient name..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Paper>

                <Box className={styles.patientListContainer}>
                    {loading ? (
                        <CircularProgress />
                    ) : error ? (
                        <Typography color="error">{error}</Typography>
                    ) : (
                        filteredPatients.map((patient) => (
                            <Accordion
                                key={patient._id}
                                className={styles.patientAccordion}
                                expanded={expandedPatient === patient._id}
                                onChange={handleAccordionChange(patient._id)}
                            >
                                <AccordionSummary expandIcon={<ExpandMoreIcon />} className={styles.patientSummary}>
                                    <Avatar src={patient.photo} className={styles.avatar} />
                                    <Typography className={styles.patientName}>{patient.name}</Typography>
                                </AccordionSummary>
                                <AccordionDetails className={styles.patientDetails}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="h6" className={styles.detailsHeader}>Patient Details</Typography>
                                            <List dense>
                                                <ListItem>
                                                    <ListItemIcon><EmailIcon /></ListItemIcon>
                                                    <ListItemText primary="Email" secondary={patient.email} />
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemIcon><PhoneIcon /></ListItemIcon>
                                                    <ListItemText primary="Phone" secondary={patient.phone || 'N/A'} />
                                                </ListItem>
                                            </List>
                                            <Typography variant="h6" className={styles.detailsHeader} sx={{mt: 2}}>Emergency Info</Typography>
                                            <List dense>
                                                <ListItem>
                                                    <ListItemIcon><BloodtypeIcon color="error" /></ListItemIcon>
                                                    <ListItemText primary="Blood Group" secondary={patient.emergencyInfo?.bloodGroup || 'N/A'} />
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemIcon><WarningIcon color="warning" /></ListItemIcon>
                                                    <ListItemText primary="Allergies" secondary={patient.emergencyInfo?.allergies || 'N/A'} />
                                                </ListItem>
                                            </List>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="h6" className={styles.detailsHeader}>Shared Records</Typography>
                                            <List dense className={styles.recordsList}>
                                                {sharedRecords[patient._id] ? (
                                                    sharedRecords[patient._id].length > 0 ? (
                                                        sharedRecords[patient._id].map(record => (
                                                            <ListItem key={record._id} button onClick={() => handleViewRecord(record)} className={styles.recordItem}>
                                                                <ListItemIcon><ArticleIcon color="primary" /></ListItemIcon>
                                                                <ListItemText 
                                                                    primary={record.title} 
                                                                    secondary={`${record.category} - ${new Date(record.date).toLocaleDateString()}`}
                                                                />
                                                            </ListItem>
                                                        ))
                                                    ) : (
                                                        <ListItem>
                                                            <ListItemText primary="No records shared by this patient." />
                                                        </ListItem>
                                                    )
                                                ) : (
                                                    <Box sx={{display: 'flex', justifyContent: 'center', p: 2}}><CircularProgress size={24} /></Box>
                                                )}
                                            </List>
                                        </Grid>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        ))
                    )}
                </Box>
            </div>
        </div>
    );
};

export default YourPatients;

