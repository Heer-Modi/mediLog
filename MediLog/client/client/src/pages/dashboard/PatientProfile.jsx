// src/pages/dashboard/PatientProfile.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  CssBaseline,
  Toolbar,
  Drawer,
  IconButton,
  Typography,
  Avatar,
  CircularProgress,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import Sidebar from "../../components/Sidebar";

const drawerWidth = 240;
const collapsedDrawerWidth = 70;

// Use backend base URL if provided, otherwise default to local API server
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PatientProfile = () => {
  const [profile, setProfile] = useState({});
  const [isEditable, setIsEditable] = useState(false);
  const [open, setOpen] = useState(true);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
        if (!token) return;

        const response = await axios.get(`${API_BASE}/api/patients/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: false,
        });

        if (response.data?.patient) {
          setProfile(response.data.patient);
          setPhotoUrl(response.data.patient.photo || null);
        }
      } catch (error) {
        console.error("Error fetching patient profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const {
    name = "",
    email = "",
    phone = "",
    address = "",
    age = "",
    bloodGroup = "",
    allergies = "",
    medicalHistory = "",
    emergencyInfo = {},
  } = profile;

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested emergencyInfo
    if (name.startsWith("emergencyInfo.")) {
      const field = name.split(".")[1];
      setProfile((prev) => ({
        ...prev,
        emergencyInfo: { ...(prev.emergencyInfo || {}), [field]: value },
      }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCancelEditing = () => {
    setIsEditable(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setProfile((prev) => ({ ...prev, photo: file }));

      // Preview selected image
      const reader = new FileReader();
      reader.onload = (event) => setPhotoUrl(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
      if (!token) return;

      const formData = new FormData();

      // Append flat fields the backend understands
      if (profile.name !== undefined) formData.append("name", profile.name);
      if (profile.email !== undefined) formData.append("email", profile.email);
      if (profile.phone !== undefined) formData.append("phone", profile.phone);
      if (profile.address !== undefined) formData.append("address", profile.address);
      if (profile.age !== undefined) formData.append("age", profile.age);

      // These two are supported flat OR nested by your backend
      if (profile.bloodGroup !== undefined) formData.append("bloodGroup", profile.bloodGroup);
      if (profile.allergies !== undefined) formData.append("allergies", profile.allergies);

      // medicalHistory (backend expects array; if string, it will wrap)
      if (profile.medicalHistory !== undefined) {
        if (Array.isArray(profile.medicalHistory)) {
          profile.medicalHistory.forEach((mh) => {
            if (mh !== undefined && mh !== null) formData.append("medicalHistory", mh);
          });
        } else {
          formData.append("medicalHistory", profile.medicalHistory);
        }
      }

      // nested emergencyInfo fields
      if (profile.emergencyInfo && typeof profile.emergencyInfo === "object") {
        Object.entries(profile.emergencyInfo).forEach(([k, v]) => {
          if (v !== undefined && v !== null) {
            formData.append(`emergencyInfo.${k}`, v);
          }
        });
      }

      // Only append photo if it's a File
      if (profile.photo instanceof File) {
        formData.append("photo", profile.photo);
      }

      const response = await axios.post(`${API_BASE}/api/patients/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: false,
      });

      if (response.data?.patient) {
        setProfile(response.data.patient);
        if (response.data.patient.photo) {
          setPhotoUrl(response.data.patient.photo);
        }
      }

      setIsEditable(false);
      alert("Profile saved successfully!");
    } catch (error) {
      console.error("Error saving patient profile:", error);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const toggleDrawer = () => setOpen(!open);

  const styles = {
    pageContainer: {
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "#f5f7fa",
      backgroundImage:
        "radial-gradient(circle at 25% 25%, rgba(66, 153, 225, 0.1) 0%, transparent 45%), radial-gradient(circle at 75% 75%, rgba(237, 100, 166, 0.1) 0%, transparent 45%)",
    },
    contentWrapper: { display: "flex", flexGrow: 1 },
    drawerStyled: {
      width: open ? drawerWidth : collapsedDrawerWidth,
      flexShrink: 0,
      "& .MuiDrawer-paper": {
        width: open ? drawerWidth : collapsedDrawerWidth,
        transition: "width 0.3s ease",
        overflowX: "hidden",
        backgroundColor: "white",
        boxShadow: "2px 0 10px rgba(0, 0, 0, 0.05)",
        borderRight: "none",
      },
    },
    drawerHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      padding: "8px",
      borderBottom: "1px solid #E2E8F0",
    },
    toggleButton: {
      backgroundColor: "#EBF8FF",
      color: "#3182CE",
      borderRadius: "50%",
      padding: "8px",
    },
    mainContent: {
      flexGrow: 1,
      padding: "24px",
      transition: "margin-left 0.3s ease, width 0.3s ease",
      marginLeft: 0,
      width: `calc(100% - ${open ? drawerWidth : collapsedDrawerWidth}px)`,
    },
    profileCard: {
      maxWidth: "800px",
      margin: "20px auto",
      backgroundColor: "white",
      borderRadius: "16px",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
      overflow: "hidden",
    },
    cardHeader: {
      background: "linear-gradient(135deg, #38bdf8 0%, #0c4a6e 100%)",
      color: "white",
      padding: "24px 32px",
    },
    cardTitle: { fontSize: "28px", fontWeight: "700", marginBottom: "8px" },
    cardSubtitle: { fontSize: "16px", opacity: "0.9" },
    cardBody: { padding: "32px" },
    photoContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: "30px",
      position: "relative",
    },
    photo: {
      width: "120px",
      height: "120px",
      borderRadius: "50%",
      objectFit: "cover",
      border: "4px solid white",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
      backgroundColor: "#f0f4f8",
      cursor: isEditable ? "pointer" : "default",
    },
    photoEditIcon: {
      position: "absolute",
      bottom: "0",
      right: "0",
      backgroundColor: "#3182CE",
      color: "white",
      borderRadius: "50%",
      padding: "6px",
      cursor: "pointer",
      display: isEditable ? "block" : "none",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "20px",
      marginBottom: "24px",
    },
    formGroup: { display: "flex", flexDirection: "column", gap: "6px" },
    formInput: {
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1.5px solid #E2E8F0",
      fontSize: "15px",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "center",
      gap: "16px",
      marginTop: "24px",
    },
    primaryButton: {
      backgroundColor: "#3182CE",
      color: "white",
      padding: "12px 24px",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    dangerButton: {
      backgroundColor: "#FEB2B2",
      color: "#9B2C2C",
      padding: "12px 24px",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
  };

  if (loading) {
    return (
      <Box sx={styles.pageContainer}>
        <CssBaseline />
        <Drawer variant="permanent" sx={styles.drawerStyled}>
          <Toolbar sx={styles.drawerHeader}>
            <IconButton onClick={toggleDrawer} sx={styles.toggleButton}>
              {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </Toolbar>
          <Sidebar open={open} />
        </Drawer>
        <Box
          component="main"
          sx={styles.mainContent}
          style={{
            marginLeft: open ? `${drawerWidth}px` : `${collapsedDrawerWidth}px`,
          }}
        >
          <Toolbar />
          <div style={{ textAlign: "center", marginTop: "100px" }}>
            <CircularProgress sx={{ color: "#3182CE" }} />
          </div>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={styles.pageContainer}>
      <CssBaseline />
      <Drawer variant="permanent" sx={styles.drawerStyled}>
        <Toolbar sx={styles.drawerHeader}>
          <IconButton onClick={toggleDrawer} sx={styles.toggleButton}>
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Toolbar>
        <Sidebar open={open} />
      </Drawer>

      <Box
        component="main"
        sx={styles.mainContent}
        style={{
          marginLeft: open ? `${drawerWidth}px` : `${collapsedDrawerWidth}px`,
        }}
      >
        <Toolbar />
        <Box sx={styles.profileCard}>
          <Box sx={styles.cardHeader}>
            <Typography sx={styles.cardTitle}>Patient Profile</Typography>
            <Typography sx={styles.cardSubtitle}>
              {isEditable
                ? "Edit your personal details below"
                : "View and manage your medical information"}
            </Typography>
          </Box>

          <Box sx={styles.cardBody}>
            {/* Photo Section */}
            <Box sx={styles.photoContainer}>
              {photoUrl ? (
                <Avatar src={photoUrl} sx={styles.photo} />
              ) : (
                <Avatar sx={styles.photo}>
                  <PersonIcon fontSize="large" />
                </Avatar>
              )}
              {isEditable && (
                <label htmlFor="photo-upload">
                  <Box component="span" sx={styles.photoEditIcon}>
                    <EditIcon fontSize="small" />
                  </Box>
                  <input
                    type="file"
                    id="photo-upload"
                    name="photo"
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                </label>
              )}
              <Typography sx={{ fontSize: "20px", fontWeight: "600", mt: 2 }}>
                {name}
              </Typography>
              <Typography sx={{ fontSize: "14px", color: "#718096" }}>
                {email}
              </Typography>
            </Box>

            {isEditable ? (
              /* Edit Mode */
              <form onSubmit={handleSubmit}>
                <Box sx={styles.formGrid}>
                  <Box sx={styles.formGroup}>
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={name}
                      onChange={handleChange}
                      style={styles.formInput}
                    />
                  </Box>
                  <Box sx={styles.formGroup}>
                    <label>Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={phone}
                      onChange={handleChange}
                      style={styles.formInput}
                    />
                  </Box>
                  <Box sx={styles.formGroup}>
                    <label>Age</label>
                    <input
                      type="number"
                      name="age"
                      value={age}
                      onChange={handleChange}
                      style={styles.formInput}
                    />
                  </Box>
                  <Box sx={styles.formGroup}>
                    <label>Blood Group</label>
                    <input
                      type="text"
                      name="bloodGroup"
                      value={bloodGroup}
                      onChange={handleChange}
                      style={styles.formInput}
                    />
                  </Box>
                  <Box sx={styles.formGroup}>
                    <label>Address</label>
                    <input
                      type="text"
                      name="address"
                      value={address}
                      onChange={handleChange}
                      style={styles.formInput}
                    />
                  </Box>
                  <Box sx={styles.formGroup}>
                    <label>Allergies</label>
                    <input
                      type="text"
                      name="allergies"
                      value={allergies}
                      onChange={handleChange}
                      style={styles.formInput}
                    />
                  </Box>
                  <Box sx={styles.formGroup}>
                    <label>Medical History</label>
                    <input
                      type="text"
                      name="medicalHistory"
                      value={medicalHistory}
                      onChange={handleChange}
                      style={styles.formInput}
                    />
                  </Box>
                  <Box sx={styles.formGroup}>
                    <label>Emergency Contact</label>
                    <input
                      type="text"
                      name="emergencyInfo.contactNumber"
                      value={emergencyInfo?.contactNumber || ""}
                      onChange={handleChange}
                      style={styles.formInput}
                    />
                  </Box>
                </Box>

                <Box sx={styles.buttonContainer}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={styles.primaryButton}
                  >
                    {saving ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SaveIcon fontSize="small" />
                    )}
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEditing}
                    style={styles.dangerButton}
                  >
                    <CloseIcon fontSize="small" />
                    Cancel
                  </button>
                </Box>
              </form>
            ) : (
              /* View Mode */
              <Box>
                <Box sx={styles.formGrid}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Phone
                    </Typography>
                    <Typography>{phone || "Not provided"}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Age
                    </Typography>
                    <Typography>{age || "Not provided"}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Blood Group
                    </Typography>
                    <Typography>{bloodGroup || "Not provided"}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Allergies
                    </Typography>
                    <Typography>{allergies || "Not provided"}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Medical History
                    </Typography>
                    <Typography>
                      {medicalHistory || "Not provided"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Address
                    </Typography>
                    <Typography>{address || "Not provided"}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Emergency Contact
                    </Typography>
                    <Typography>
                      {emergencyInfo?.contactNumber || "Not provided"}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={styles.buttonContainer}>
                  <button
                    onClick={() => setIsEditable(true)}
                    style={styles.primaryButton}
                  >
                    <EditIcon fontSize="small" />
                    Edit Profile
                  </button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PatientProfile;
