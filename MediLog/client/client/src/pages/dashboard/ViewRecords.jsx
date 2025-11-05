import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "/src/components/Sidebar.jsx"; // **FIXED**: Using absolute path
import {
    Box, Typography, Card, CardContent, Button, IconButton, Grid, Modal,
    FormControl, InputLabel, Select, MenuItem, CircularProgress
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import ShareIcon from "@mui/icons-material/Share";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import styles from "/src/styles/ViewRecords.module.css"; // **FIXED**: Using absolute path

const categories = [
    { key: "Sonography", label: "Sonography" },
    { key: "Blood Test", label: "Blood Test" },
    { key: "Regular Checkup", label: "Regular Checkup" }
];

const API_BASE_URL = "http://localhost:5000";

const getToken = () => {
    try {
        const raw = localStorage.getItem("userInfo");
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.token || null;
    } catch {
        return null;
    }
};

const ViewRecords = () => {
    const [selectedCategory, setSelectedCategory] = useState("");
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    
    // View Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [activeRecord, setActiveRecord] = useState(null);
    
    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);

    // Share Modal State
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [recordToShare, setRecordToShare] = useState(null);
    const [doctorList, setDoctorList] = useState([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState("");
    const [shareLoading, setShareLoading] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const token = getToken();
            if (!token) {
                setError("Not authenticated. Please log in.");
                setTimeout(() => navigate("/"), 1000);
                return;
            }
            const { data } = await axios.get(`${API_BASE_URL}/api/records`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRecords(data || []);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) {
                setError("Session expired. Please login again.");
                localStorage.removeItem("userInfo");
                setTimeout(() => navigate("/"), 1000);
            } else {
                setError("Failed to fetch records.");
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]); // Added navigate to dependency array

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    useEffect(() => {
        if (location.state?.refresh) {
            fetchRecords();
            window.history.replaceState({}, document.title);
            setSuccess("New file uploaded.");
        }
    }, [location.state, fetchRecords]); // Added fetchRecords

    const handleDelete = async (id) => {
        setError(""); setSuccess("");
        setDeleteModalOpen(false);
        try {
            const token = getToken();
            if (!token) {
                setError("Not authenticated.");
                return;
            }
            await axios.delete(`${API_BASE_URL}/api/records/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess("Record deleted.");
            await fetchRecords();
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) {
                setError("Session expired. Please login again.");
                localStorage.removeItem("userInfo");
                setTimeout(() => navigate("/"), 1000);
            } else {
                setError(err.response?.data?.message || "Delete failed.");
            }
        }
    };

    const handleDeleteConfirmation = (rec) => {
        setRecordToDelete(rec);
        setDeleteModalOpen(true);
    };

    const fetchDoctors = useCallback(async () => {
        if (doctorList.length > 0) return; 
        try {
            const token = getToken();
            const { data } = await axios.get(`${API_BASE_URL}/api/users/doctors`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDoctorList(data || []);
        } catch (err) {
            setError("Failed to fetch doctors list.");
        }
    }, [doctorList.length]); // Added dependency

    const openShareModal = (record) => {
        setRecordToShare(record);
        setShareModalOpen(true);
        setError(""); 
        setSuccess("");
        setSelectedDoctorId("");
        fetchDoctors();
    };

    const handleConfirmShare = async () => {
        if (!recordToShare || !selectedDoctorId) {
            setError("Please select a doctor.");
            return;
        }
        setShareLoading(true);
        setError("");
        setSuccess("");
        try {
            const token = getToken();
            await axios.post(
                `${API_BASE_URL}/api/records/${recordToShare._id}/share`,
                { doctorId: selectedDoctorId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess("Record shared successfully!");
            setShareModalOpen(false);
            setRecordToShare(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to share record.");
        } finally {
            setShareLoading(false);
        }
    };


    const handleView = (rec) => {
        setActiveRecord(rec);
        setModalOpen(true);
    };

    const renderFileModal = () => {
        if (!activeRecord) return null;
        const token = getToken();
        const viewUrl = `${API_BASE_URL}/api/records/${activeRecord._id}/view?token=${token}`;

        const isPdf = activeRecord.fileUrl?.toLowerCase().endsWith(".pdf");
        // **FIXED THE TYPO HERE**
        const isImage = /\.(jpg|jpeg|png|gif)$/i.test(activeRecord.fileUrl || "");

        return (
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Box className={styles.fileModalBox}>
                    <IconButton className={styles.modalCloseButton} onClick={() => setModalOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                    {isPdf ? (
                        <iframe src={viewUrl} title="PDF Viewer" style={{ flex: 1, border: 'none' }} />
                    ) : isImage ? (
                        <img src={viewUrl} alt="Record" style={{ maxWidth: '100%', maxHeight: '100%', margin: 'auto' }} />
                    ) : (
                        <iframe src={viewUrl} title="File Viewer" style={{ flex: 1, border: 'none' }} />
                    )}
                </Box>
            </Modal>
        );
    };

    const renderDeleteConfirmationModal = () => {
        if (!recordToDelete) return null;
        return (
            <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                <Box className={styles.confirmModalBox}>
                    <Typography variant="h6" className={styles.confirmModalTitle}>Confirm Deletion</Typography>
                    <Typography className={styles.confirmModalText}>
                        Are you sure you want to delete this record?
                    </Typography>
                    <Box className={styles.confirmModalActions}>
                        <Button
                            onClick={() => handleDelete(recordToDelete._id)}
                            className={styles.confirmButton}
                        >
                            Delete
                        </Button>
                        <Button
                            onClick={() => setDeleteModalOpen(false)}
                            className={styles.cancelButton}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>
        );
    };

    const renderShareModal = () => {
        if (!recordToShare) return null;
        return (
            <Modal open={shareModalOpen} onClose={() => setShareModalOpen(false)}>
                <Box className={styles.confirmModalBox}>
                    <Typography variant="h6" className={styles.confirmModalTitle}>Share Record</Typography>
                    <Typography className={styles.confirmModalText}>
                        Share "<b>{recordToShare.title}</b>" with a doctor.
                    </Typography>
                    <FormControl fullWidth sx={{ mt: 2, mb: 1 }}>
                        <InputLabel id="doctor-select-label">Select Doctor</InputLabel>
                        <Select
                            labelId="doctor-select-label"
                            value={selectedDoctorId}
                            label="Select Doctor"
                            onChange={(e) => setSelectedDoctorId(e.target.value)}
                        >
                            {doctorList.length > 0 ? (
                                doctorList.map((doc) => (
                                    <MenuItem key={doc._id} value={doc._id}>
                                        {doc.name} {doc.specialization && `(${doc.specialization})`}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>Loading doctors...</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                    
                    {error && <Typography color="error" sx={{fontSize: '0.9rem', mt: 1}}>{error}</Typography>}
                    {success && <Typography color="primary" sx={{fontSize: '0.9rem', mt: 1}}>{success}</Typography>}

                    <Box className={styles.confirmModalActions}>
                        <Button
                            onClick={handleConfirmShare}
                            className={styles.shareConfirmButton} // Using the correct style
                            disabled={shareLoading}
                        >
                            {shareLoading ? <CircularProgress size={24} color="inherit" /> : "Share"}
                        </Button>
                        <Button
                            onClick={() => setShareModalOpen(false)}
                            className={styles.cancelButton}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>
        );
    };


    return (
        <div className={styles.dashboardContainer}>
            <Sidebar />
            <div className={styles.mainContent}>
                <Box className={styles.contentWrapper}>
                    <Typography variant="h5" gutterBottom className={styles.heading}>
                        Your Medical Records
                    </Typography>
                    {error && <Typography color="error" sx={{mb: 2}}>{error}</Typography>}
                    {success && <Typography color="primary" sx={{mb: 2}}>{success}</Typography>}

                    {!selectedCategory ? (
                        <Box className={styles.folderGrid}>
                            {categories.map(cat => (
                                <Card key={cat.key} className={styles.folderCard} onClick={() => setSelectedCategory(cat.key)}>
                                    <CardContent className={styles.folderCardContent}>
                                        <FolderIcon className={styles.folderIcon} />
                                        <Typography className={styles.folderName}>{cat.label}</Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    ) : (
                        <Box className={styles.folderContentBox}>
                            <Box className={styles.folderHeader}>
                                <IconButton onClick={() => setSelectedCategory('')} className={styles.backButton}>←</IconButton>
                                <FolderIcon className={styles.folderIconLarge} />
                                <Typography className={styles.folderNameLarge}>{selectedCategory}</Typography>
                            </Box>
                            {loading && <Typography>Loading...</Typography>}
                            <Grid container spacing={3}>
                                {records.filter(r => r.category === selectedCategory).length === 0 ? (
                                    <Grid item xs={12}>
                                        <Typography className={styles.noRecordsText}>No files found in this folder.</Typography>
                                    </Grid>
                                ) : (
                                    records.filter(r => r.category === selectedCategory).map(rec => (
                                        <Grid item key={rec._id} xs={12} sm={6} md={4}>
                                            <Card className={styles.recordCard}>
                                                <CardContent>
                                                    <Typography className={styles.recordTitle}>{rec.title}</Typography>
                                                    <Typography variant="body2" className={styles.recordDescription}>{rec.description}</Typography>
                                                    <Typography variant="body2" className={styles.recordDate}>
                                                        {rec.date ? new Date(rec.date).toLocaleDateString() : ""}
                                                    </Typography>
                                                    <Box className={styles.actionRow}>
                                                        <Button onClick={() => handleView(rec)} className={styles.viewButton}>View</Button>
                                                        <IconButton onClick={() => openShareModal(rec)} title="Share with Doctor" className={styles.shareIconButton}><ShareIcon /></IconButton>
                                                        <IconButton onClick={() => handleDeleteConfirmation(rec)} title="Delete" className={styles.deleteIconButton}><DeleteIcon /></IconButton>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))
                                )}
                            </Grid>
                        </Box>
                    )}
                    {renderFileModal()}
                    {renderDeleteConfirmationModal()}
                    {renderShareModal()}
                </Box>
            </div>
        </div>
    );
};

export default ViewRecords;

