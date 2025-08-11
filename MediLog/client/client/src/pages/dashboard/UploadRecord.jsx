// src/pages/dashboard/UploadRecord.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import {
  Box, Typography, TextField, Button, Card, CardContent, IconButton
} from '@mui/material';
import Grid from '@mui/material/Grid';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FolderIcon from '@mui/icons-material/Folder';
import axios from 'axios';
import styles from '../../styles/UploadRecord.module.css';

const categories = [
  { key: 'Sonography', label: 'Sonography' },
  { key: 'Blood Test', label: 'Blood Test' },
  { key: 'Regular Checkup', label: 'Regular Checkup' }
];

// ✅ Helper to get token
const getToken = () => {
  try {
    const raw = localStorage.getItem('userInfo');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch {
    return null;
  }
};

const UploadRecord = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef();
  const navigate = useNavigate();

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setDate('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    setError('');
    setSuccess('');
    const token = getToken();
    if (!token) {
      setError('You are not logged in. Please login again.');
      setTimeout(() => navigate('/'), 1200);
      return;
    }
    if (!file || !title || !selectedCategory || !date) {
      setError('Please fill all required fields: file, title, category and date.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    // ✅ Append text fields first so Multer's fileFilter sees category
    formData.append('category', selectedCategory);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('date', date);
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5000/api/records', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Uploaded successfully!');
      resetForm();
      setTimeout(() => {
        navigate('/dashboard/records', { state: { refresh: true } });
      }, 1000);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('userInfo');
        setTimeout(() => navigate('/'), 1000);
      } else {
        setError(err.response?.data?.message || 'Upload failed.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Box className={styles.contentWrapper}>
          <Typography variant="h5" gutterBottom className={styles.heading}>
            Upload Medical Record
          </Typography>

          {!selectedCategory && (
            <Grid container spacing={3}>
              {categories.map(cat => (
                <Grid key={cat.key} xs={12} sm={6} md={4}>
                  <Card
                    className={styles.folderCard}
                    onClick={() => setSelectedCategory(cat.key)}
                  >
                    <CardContent className={styles.folderCardContent}>
                      <FolderIcon className={styles.folderIcon} />
                      <Typography className={styles.folderName}>
                        {cat.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {selectedCategory && (
            <Box className={styles.uploadFormBox}>
              <Box className={styles.folderHeader}>
                <IconButton onClick={() => setSelectedCategory('')}>←</IconButton>
                <FolderIcon className={styles.folderIconLarge} />
                <Typography className={styles.folderNameLarge}>
                  {selectedCategory}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid xs={12} sm={4}>
                  <TextField
                    label="File Name"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid xs={12} sm={4}>
                  <TextField
                    label="Description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    fullWidth
                    multiline
                    minRows={1}
                  />
                </Grid>
                <Grid xs={12} sm={4}>
                  <TextField
                    label="Date"
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid xs={12} sm={6}>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    disabled={uploading}
                  >
                    {file ? file.name : 'Choose File'}
                    <input
                      type="file"
                      hidden
                      ref={fileInputRef}
                      onChange={e => setFile(e.target.files[0])}
                    />
                  </Button>
                </Grid>
                <Grid xs={12} sm={6}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleUpload}
                    disabled={!file || !title || !date || uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </Grid>
                <Grid xs={12}>
                  {error && <Typography color="error">{error}</Typography>}
                  {success && <Typography color="primary">{success}</Typography>}
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </div>
    </div>
  );
};

export default UploadRecord;
