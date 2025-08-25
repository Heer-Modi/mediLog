// src/pages/dashboard/ViewRecords.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import {
  Box, Typography, Card, CardContent, Button, IconButton, Grid, Modal
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import ShareIcon from "@mui/icons-material/Share";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import styles from "../../styles/ViewRecords.module.css";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchRecords = async () => {
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
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    if (location.state?.refresh) {
      fetchRecords();
      window.history.replaceState({}, document.title);
      setSuccess("New file uploaded.");
    }
  }, [location.state]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    setError(""); setSuccess("");
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

  const handleShare = (rec) => {
    if (rec.shareToken) {
      const link = `${API_BASE_URL}/api/records/shared/${rec.shareToken}/file`;
      navigator.clipboard.writeText(link);
      setSuccess("Share link copied to clipboard!");
      setTimeout(() => setSuccess(""), 2000);
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
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(activeRecord.fileUrl || "");

    return (
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%", height: "90%",
          bgcolor: "background.paper", boxShadow: 24, p: 2,
          display: "flex", flexDirection: "column"
        }}>
          <IconButton sx={{ position: 'absolute', top: 8, right: 8 }}
            onClick={() => setModalOpen(false)}>
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

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Box className={styles.contentWrapper}>
          <Typography variant="h5" gutterBottom className={styles.heading}>
            Your Medical Records
          </Typography>
          {error && <Typography color="error">{error}</Typography>}
          {success && <Typography color="primary">{success}</Typography>}

          {!selectedCategory ? (
            <Grid container spacing={3}>
              {categories.map(cat => (
                <Grid key={cat.key} xs={12} sm={6} md={4}>
                  <Card className={styles.folderCard} onClick={() => setSelectedCategory(cat.key)}>
                    <CardContent className={styles.folderCardContent}>
                      <FolderIcon className={styles.folderIcon} />
                      <Typography className={styles.folderName}>{cat.label}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box className={styles.folderContentBox}>
              <Box className={styles.folderHeader}>
                <IconButton onClick={() => setSelectedCategory('')}>←</IconButton>
                <FolderIcon className={styles.folderIconLarge} />
                <Typography className={styles.folderNameLarge}>{selectedCategory}</Typography>
              </Box>
              {loading && <Typography>Loading...</Typography>}
              <Grid container spacing={2}>
                {records.filter(r => r.category === selectedCategory).length === 0 ? (
                  <Grid xs={12}><Typography>No files found in this folder.</Typography></Grid>
                ) : (
                  records.filter(r => r.category === selectedCategory).map(rec => (
                    <Grid key={rec._id} xs={12} sm={6} md={4}>
                      <Card className={styles.recordCard}>
                        <CardContent>
                          <Typography className={styles.recordTitle}>{rec.title}</Typography>
                          <Typography variant="body2" className={styles.recordDescription}>{rec.description}</Typography>
                          <Typography variant="body2" className={styles.recordDate}>
                            {rec.date ? new Date(rec.date).toLocaleDateString() : ""}
                          </Typography>
                          <Box className={styles.actionRow}>
                            <Button onClick={() => handleView(rec)}>View</Button>
                            <IconButton onClick={() => handleShare(rec)} title="Share"><ShareIcon /></IconButton>
                            <IconButton onClick={() => handleDelete(rec._id)} title="Delete"><DeleteIcon /></IconButton>
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
        </Box>
      </div>
    </div>
  );
};

export default ViewRecords;
