import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    CssBaseline,
    Typography,
    Avatar,
    CircularProgress,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import Header from "../components/Sidebar";
import Sidebar from "../components/Header";

const PatientProfile = ({ refreshProfilePhoto }) => {
    const [profile, setProfile] = useState({});
    const [isEditable, setIsEditable] = useState(false);
    const [photoUrl, setPhotoUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                const storedPhotoUrl = localStorage.getItem("profilePhoto");
                if (storedPhotoUrl) setPhotoUrl(storedPhotoUrl);

                const response = await axios.get("/api/patients/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setProfile(response.data.patient);
                if (response.data.photo && !storedPhotoUrl) setPhotoUrl(response.data.photo);
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
        age = "",
        email = "",
        phone = "",
        address = "",
        photo = "",
        bloodGroup = "",
        allergies = "",
        medicalHistory = "",
    } = profile;

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "phone" && (!/^\d*$/.test(value) || value.length > 10)) return;
        setProfile({ ...profile, [name]: value });
    };

    const handleCancelEditing = () => setIsEditable(false);

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setProfile({ ...profile, photo: e.target.files[0] });
            const reader = new FileReader();
            reader.onload = (event) => setPhotoUrl(event.target.result);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (profile.phone.length !== 10) {
            alert("Phone number must be exactly 10 digits.");
            return;
        }
        setSaving(true);
        const { _id } = profile;
        const formData = new FormData();
        for (const key in profile) formData.append(key, profile[key]);
        formData.append("_id", _id);
        try {
            const response = await axios.post("/api/patients/profile", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (response.data?.patient?.photo) {
                const newPhotoUrl = response.data.patient.photo;
                localStorage.setItem("profilePhoto", newPhotoUrl);
                setPhotoUrl(newPhotoUrl);
                if (typeof refreshProfilePhoto === "function") refreshProfilePhoto(newPhotoUrl);
            }
            setIsEditable(false);
            showToast("Profile saved successfully!");
        } catch (error) {
            console.error("Error saving profile:", error);
            showToast("Failed to save profile", "error");
        } finally {
            setSaving(false);
        }
    };

    const showToast = (message, type = "success") => alert(message);

    const styles = {
        pageContainer: {
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: '#f5f7fa',
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(66, 153, 225, 0.1) 0%, transparent 45%), radial-gradient(circle at 75% 75%, rgba(237, 100, 166, 0.1) 0%, transparent 45%)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        },
        contentWrapper: {
            display: 'flex',
            flexGrow: 1,
            transition: 'all 0.3s ease',
        },
        drawerStyled: {
            width: open ? drawerWidth : collapsedDrawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
                width: open ? drawerWidth : collapsedDrawerWidth,
                transition: 'width 0.3s ease',
                overflowX: 'hidden',
                backgroundColor: 'white',
                boxShadow: '2px 0 10px rgba(0, 0, 0, 0.05)',
                borderRight: 'none',
            },
        },
        drawerHeader: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '8px',
            borderBottom: '1px solid #E2E8F0',
        },
        toggleButton: {
            backgroundColor: '#EBF8FF',
            color: '#3182CE',
            borderRadius: '50%',
            padding: '8px',
            '&:hover': {
                backgroundColor: '#BEE3F8',
            },
        },
        mainContent: {
            flexGrow: 1,
            padding: '24px',
            transition: 'margin-left 0.3s ease, width 0.3s ease',
            marginLeft: 0,
            width: `calc(100% - ${open ? drawerWidth : collapsedDrawerWidth}px)`,
        },
        profileCard: {
            maxWidth: '800px',
            width: '100%',
            margin: '0 auto',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
            marginTop: '20px',
            marginBottom: '40px',
        },
        cardHeader: {
            background: 'linear-gradient(135deg, #38bdf8 0%, #0c4a6e 100%)',
            color: 'white',
            padding: '24px 32px',
            borderBottom: '1px solid #E2E8F0',
        },
        cardTitle: {
            fontSize: '28px',
            fontWeight: '700',
            marginBottom: '8px',
        },
        cardSubtitle: {
            fontSize: '16px',
            opacity: '0.9',
        },
        cardBody: {
            padding: '32px',
        },
        photoContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '30px',
            position: 'relative',
        },
        photoWrapper: {
            position: 'relative',
            marginBottom: '12px',
        },
        photo: {
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '4px solid white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
            backgroundColor: '#f0f4f8',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: isEditable ? 'pointer' : 'default',
        },
        photoEditIcon: {
            position: 'absolute',
            bottom: '0',
            right: '0',
            backgroundColor: '#3182CE',
            color: 'white',
            borderRadius: '50%',
            padding: '6px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
            cursor: 'pointer',
            zIndex: 1,
            display: isEditable ? 'block' : 'none',
        },
        profileName: {
            fontSize: '20px',
            fontWeight: '600',
            color: '#1a365d',
            marginBottom: '4px',
            textAlign: 'center',
        },
        profileDetail: {
            fontSize: '14px',
            color: '#718096',
            marginBottom: '4px',
            textAlign: 'center',
        },
        form: {
            marginTop: '24px',
        },
        formGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px',
            marginBottom: '24px',
            '@media (max-width: 768px)': {
                gridTemplateColumns: '1fr',
            },
        },
        formGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
        },
        formLabel: {
            fontSize: '14px',
            fontWeight: '500',
            color: '#4A5568',
            marginBottom: '4px',
        },
        formInput: {
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1.5px solid #E2E8F0',
            fontSize: '15px',
            transition: 'all 0.3s ease',
            outline: 'none',
            width: '100%',
            '&:focus': {
                borderColor: '#3182CE',
                boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.15)',
            },
            '&:disabled': {
                backgroundColor: '#F7FAFC',
                color: '#4A5568',
                cursor: 'not-allowed',
            },
        },
        viewField: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            marginBottom: '16px',
        },
        viewLabel: {
            fontSize: '14px',
            fontWeight: '500',
            color: '#718096',
        },
        viewValue: {
            fontSize: '16px',
            color: '#1a365d',
            fontWeight: '500',
        },
        divider: {
            height: '1px',
            backgroundColor: '#E2E8F0',
            margin: '24px 0',
        },
        buttonContainer: {
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '24px',
        },
        primaryButton: {
            backgroundColor: '#3182CE',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            '&:hover': {
                backgroundColor: '#2B6CB0',
                transform: 'translateY(-2px)',
            },
        },
        secondaryButton: {
            backgroundColor: '#E2E8F0',
            color: '#4A5568',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            '&:hover': {
                backgroundColor: '#CBD5E0',
            },
        },
        dangerButton: {
            backgroundColor: '#FEB2B2',
            color: '#9B2C2C',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            '&:hover': {
                backgroundColor: '#FC8181',
            },
        },
        loadingWrapper: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px',
        },
        infoSection: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px',
            '@media (max-width: 768px)': {
                gridTemplateColumns: '1fr',
            },
        },
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
                <CssBaseline />
                <Sidebar />
                <Box sx={{ flexGrow: 1 }}>
                    <Header />
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
                        <CircularProgress sx={{ color: '#3182CE' }} />
                    </Box>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
            <CssBaseline />
            <Sidebar />
            <Box sx={{ flexGrow: 1 }}>
                <Header />
                <Box sx={{ maxWidth: "900px", margin: "32px auto", background: "white", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                    <Box sx={{ background: "linear-gradient(135deg, #38bdf8 0%, #0c4a6e 100%)", color: "white", padding: "24px 32px", borderBottom: "1px solid #E2E8F0" }}>
                        <Typography sx={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>Patient Information</Typography>
                        <Typography sx={{ fontSize: "16px", opacity: "0.9" }}>
                            {isEditable ? "Edit your personal details below" : "View and manage your personal information"}
                        </Typography>
                    </Box>
                    <Box sx={{ padding: "32px" }}>
                        {/* Photo Section */}
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "30px", position: "relative" }}>
                            <Box sx={{ position: "relative", marginBottom: "12px" }}>
                                {photoUrl ? (
                                    <Avatar src={photoUrl} sx={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "4px solid white", boxShadow: "0 4px 12px rgba(0,0,0,0.12)", backgroundColor: "#f0f4f8", display: "flex", justifyContent: "center", alignItems: "center" }} />
                                ) : (
                                    <Avatar sx={{ width: "120px", height: "120px", borderRadius: "50%", backgroundColor: "#f0f4f8" }}>
                                        <PersonIcon fontSize="large" />
                                    </Avatar>
                                )}
                                {isEditable && (
                                    <label htmlFor="photo-upload">
                                        <Box component="span" sx={{ position: "absolute", bottom: 0, right: 0, backgroundColor: "#3182CE", color: "white", borderRadius: "50%", padding: "6px", boxShadow: "0 2px 6px rgba(0,0,0,0.2)", cursor: "pointer", zIndex: 1 }}>
                                            <EditIcon fontSize="small" />
                                        </Box>
                                        <input
                                            type="file"
                                            id="photo-upload"
                                            name="photo"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                )}
                            </Box>
                            <Typography sx={{ fontSize: "20px", fontWeight: "600", color: "#1a365d", marginBottom: "4px", textAlign: "center" }}>{name}</Typography>
                            <Typography sx={{ fontSize: "14px", color: "#718096", marginBottom: "4px", textAlign: "center" }}>Age: {age} • Email: {email}</Typography>
                        </Box>

                        {isEditable ? (
                            <form onSubmit={handleSubmit}>
                                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", marginBottom: "24px" }}>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        <label style={{ fontSize: "14px", fontWeight: "500", color: "#4A5568", marginBottom: "4px" }}>Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={name}
                                            onChange={handleChange}
                                            style={{ padding: "12px 16px", borderRadius: "8px", border: "1.5px solid #E2E8F0", fontSize: "15px", outline: "none", width: "100%" }}
                                            required
                                        />
                                    </Box>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        <label style={{ fontSize: "14px", fontWeight: "500", color: "#4A5568", marginBottom: "4px" }}>Age</label>
                                        <input
                                            type="number"
                                            name="age"
                                            value={age}
                                            onChange={handleChange}
                                            style={{ padding: "12px 16px", borderRadius: "8px", border: "1.5px solid #E2E8F0", fontSize: "15px", outline: "none", width: "100%" }}
                                            required
                                            min={0}
                                        />
                                    </Box>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        <label style={{ fontSize: "14px", fontWeight: "500", color: "#4A5568", marginBottom: "4px" }}>Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={email}
                                            onChange={handleChange}
                                            style={{ padding: "12px 16px", borderRadius: "8px", border: "1.5px solid #E2E8F0", fontSize: "15px", outline: "none", width: "100%" }}
                                            required
                                        />
                                    </Box>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        <label style={{ fontSize: "14px", fontWeight: "500", color: "#4A5568", marginBottom: "4px" }}>Phone Number</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={phone}
                                            onChange={handleChange}
                                            style={{ padding: "12px 16px", borderRadius: "8px", border: "1.5px solid #E2E8F0", fontSize: "15px", outline: "none", width: "100%" }}
                                            required
                                            placeholder="10-digit number"
                                            maxLength={10}
                                        />
                                    </Box>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        <label style={{ fontSize: "14px", fontWeight: "500", color: "#4A5568", marginBottom: "4px" }}>Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={address}
                                            onChange={handleChange}
                                            style={{ padding: "12px 16px", borderRadius: "8px", border: "1.5px solid #E2E8F0", fontSize: "15px", outline: "none", width: "100%" }}
                                            required
                                        />
                                    </Box>
                                </Box>

                                {/* Emergency Info Box */}
                                <Box sx={{ background: "#f7fafc", borderRadius: "12px", padding: "24px", marginTop: "32px" }}>
                                    <Typography sx={{ fontSize: "22px", fontWeight: "700", color: "#3182CE", marginBottom: "16px" }}>Emergency Info</Typography>
                                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                            <label style={{ fontSize: "14px", fontWeight: "500", color: "#4A5568", marginBottom: "4px" }}>Blood Group</label>
                                            <input
                                                type="text"
                                                name="bloodGroup"
                                                value={bloodGroup}
                                                onChange={handleChange}
                                                style={{ padding: "12px 16px", borderRadius: "8px", border: "1.5px solid #E2E8F0", fontSize: "15px", outline: "none", width: "100%" }}
                                                required
                                            />
                                        </Box>
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                            <label style={{ fontSize: "14px", fontWeight: "500", color: "#4A5568", marginBottom: "4px" }}>Allergies</label>
                                            <input
                                                type="text"
                                                name="allergies"
                                                value={allergies}
                                                onChange={handleChange}
                                                style={{ padding: "12px 16px", borderRadius: "8px", border: "1.5px solid #E2E8F0", fontSize: "15px", outline: "none", width: "100%" }}
                                            />
                                        </Box>
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                            <label style={{ fontSize: "14px", fontWeight: "500", color: "#4A5568", marginBottom: "4px" }}>Medical History</label>
                                            <input
                                                type="text"
                                                name="medicalHistory"
                                                value={medicalHistory}
                                                onChange={handleChange}
                                                style={{ padding: "12px 16px", borderRadius: "8px", border: "1.5px solid #E2E8F0", fontSize: "15px", outline: "none", width: "100%" }}
                                            />
                                        </Box>
                                    </Box>
                                </Box>

                                <Box sx={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "24px" }}>
                                    <button type="submit" disabled={saving} style={{ backgroundColor: "#3182CE", color: "white", padding: "12px 24px", borderRadius: "8px", border: "none", fontSize: "16px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                                        {saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon fontSize="small" />}
                                        Save Changes
                                    </button>
                                    <button type="button" onClick={handleCancelEditing} style={{ backgroundColor: "#FEB2B2", color: "#9B2C2C", padding: "12px 24px", borderRadius: "8px", border: "none", fontSize: "16px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <CloseIcon fontSize="small" />
                                        Cancel
                                    </button>
                                </Box>
                            </form>
                        ) : (
                            <Box>
                                <Box sx={{ height: "1px", backgroundColor: "#E2E8F0", margin: "24px 0" }} />
                                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "16px" }}>
                                        <Typography sx={{ fontSize: "14px", fontWeight: "500", color: "#718096" }}>Full Name</Typography>
                                        <Typography sx={{ fontSize: "16px", color: "#1a365d", fontWeight: "500" }}>{name || "Not provided"}</Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "16px" }}>
                                        <Typography sx={{ fontSize: "14px", fontWeight: "500", color: "#718096" }}>Age</Typography>
                                        <Typography sx={{ fontSize: "16px", color: "#1a365d", fontWeight: "500" }}>{age || "Not provided"}</Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "16px" }}>
                                        <Typography sx={{ fontSize: "14px", fontWeight: "500", color: "#718096" }}>Email</Typography>
                                        <Typography sx={{ fontSize: "16px", color: "#1a365d", fontWeight: "500" }}>{email || "Not provided"}</Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "16px" }}>
                                        <Typography sx={{ fontSize: "14px", fontWeight: "500", color: "#718096" }}>Phone Number</Typography>
                                        <Typography sx={{ fontSize: "16px", color: "#1a365d", fontWeight: "500" }}>{phone || "Not provided"}</Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "16px" }}>
                                        <Typography sx={{ fontSize: "14px", fontWeight: "500", color: "#718096" }}>Address</Typography>
                                        <Typography sx={{ fontSize: "16px", color: "#1a365d", fontWeight: "500" }}>{address || "Not provided"}</Typography>
                                    </Box>
                                </Box>

                                {/* Emergency Info Box */}
                                <Box sx={{ background: "#f7fafc", borderRadius: "12px", padding: "24px", marginTop: "32px" }}>
                                    <Typography sx={{ fontSize: "22px", fontWeight: "700", color: "#3182CE", marginBottom: "16px" }}>Emergency Info</Typography>
                                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "16px" }}>
                                            <Typography sx={{ fontSize: "14px", fontWeight: "500", color: "#718096" }}>Blood Group</Typography>
                                            <Typography sx={{ fontSize: "16px", color: "#1a365d", fontWeight: "500" }}>{bloodGroup || "Not provided"}</Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "16px" }}>
                                            <Typography sx={{ fontSize: "14px", fontWeight: "500", color: "#718096" }}>Allergies</Typography>
                                            <Typography sx={{ fontSize: "16px", color: "#1a365d", fontWeight: "500" }}>{allergies || "Not provided"}</Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "16px" }}>
                                            <Typography sx={{ fontSize: "14px", fontWeight: "500", color: "#718096" }}>Medical History</Typography>
                                            <Typography sx={{ fontSize: "16px", color: "#1a365d", fontWeight: "500" }}>{medicalHistory || "Not provided"}</Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                <Box sx={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "24px" }}>
                                    <button onClick={() => setIsEditable(true)} style={{ backgroundColor: "#3182CE", color: "white", padding: "12px 24px", borderRadius: "8px", border: "none", fontSize: "16px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
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