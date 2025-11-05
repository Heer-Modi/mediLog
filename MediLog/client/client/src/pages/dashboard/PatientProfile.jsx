import React, { useState, useEffect } from "react";
import axios from "axios";
import { CircularProgress } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import Sidebar from "../../components/Sidebar";
import "../../styles/PatientProfile.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PatientProfile = () => {
  const [profile, setProfile] = useState({});
  const [isEditable, setIsEditable] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
        if (!token) return;

        const response = await axios.get(`${API_BASE}/api/patients/profile`, {
          headers: { Authorization: `Bearer ${token}` },
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
      if (profile.name) formData.append("name", profile.name);
      if (profile.email) formData.append("email", profile.email);
      if (profile.phone) formData.append("phone", profile.phone);
      if (profile.address) formData.append("address", profile.address);
      if (profile.age) formData.append("age", profile.age);
      if (profile.bloodGroup) formData.append("bloodGroup", profile.bloodGroup);
      if (profile.allergies) formData.append("allergies", profile.allergies);

      if (profile.medicalHistory) {
        if (Array.isArray(profile.medicalHistory)) {
          profile.medicalHistory.forEach((mh) =>
            formData.append("medicalHistory", mh)
          );
        } else {
          formData.append("medicalHistory", profile.medicalHistory);
        }
      }

      if (profile.emergencyInfo && typeof profile.emergencyInfo === "object") {
        Object.entries(profile.emergencyInfo).forEach(([k, v]) => {
          if (v) formData.append(`emergencyInfo.${k}`, v);
        });
      }

      if (profile.photo instanceof File) {
        formData.append("photo", profile.photo);
      }

      const response = await axios.post(
        `${API_BASE}/api/patients/profile`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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

  if (loading) {
    return (
      <div className="patientProfileContainer">
        <Sidebar />
        <div className="patientMainContent">
          <div style={{ textAlign: "center", marginTop: "100px" }}>
            <CircularProgress sx={{ color: "#a78bfa" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="patientProfileContainer">
      <Sidebar />
      
      <div className="patientMainContent">
        <div className="profileCard">
          <div className="profileCardHeader">
            <h1 className="profileTitle">Patient Profile</h1>
            <p className="profileSubtitle">
              {isEditable
                ? "Edit your personal details below"
                : "View and manage your medical information"}
            </p>
          </div>

          <div className="profileCardBody">
            {/* Photo Section */}
            <div className="photoContainer">
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="profilePhoto" />
              ) : (
                <div className="profilePhoto">
                  <PersonIcon fontSize="large" />
                </div>
              )}

              {isEditable && (
                <label htmlFor="photo-upload">
                  <div className="photoEditIcon">
                    <EditIcon fontSize="small" />
                  </div>
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

              <h2 className="profileName">{name}</h2>
              <p className="profileEmail">{email}</p>
            </div>

            {isEditable ? (
              /* Edit Mode */
              <form onSubmit={handleSubmit}>
                <div className="profileFormGrid">
                  <div className="formGroup">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={name}
                      onChange={handleChange}
                      className="formInput"
                    />
                  </div>
                  <div className="formGroup">
                    <label>Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={phone}
                      onChange={handleChange}
                      className="formInput"
                    />
                  </div>
                  <div className="formGroup">
                    <label>Age</label>
                    <input
                      type="number"
                      name="age"
                      value={age}
                      onChange={handleChange}
                      className="formInput"
                    />
                  </div>
                  <div className="formGroup">
                    <label>Blood Group</label>
                    <input
                      type="text"
                      name="emergencyInfo.bloodGroup"
                      value={emergencyInfo.bloodGroup || ""}
                      onChange={handleChange}
                      className="formInput"
                    />
                  </div>
                  <div className="formGroup">
                    <label>Address</label>
                    <input
                      type="text"
                      name="address"
                      value={address}
                      onChange={handleChange}
                      className="formInput"
                    />
                  </div>
                  <div className="formGroup">
                    <label>Allergies</label>
                    <input
                      type="text"
                      name="emergencyInfo.allergies"
                      value={emergencyInfo.allergies || ""}
                      onChange={handleChange}
                      className="formInput"
                    />
                  </div>
                  <div className="formGroup">
                    <label>Medical History</label>
                    <input
                      type="text"
                      name="medicalHistory"
                      value={medicalHistory}
                      onChange={handleChange}
                      className="formInput"
                    />
                  </div>
                  <div className="formGroup">
                    <label>Emergency Contact</label>
                    <input
                      type="text"
                      name="emergencyInfo.contactNumber"
                      value={emergencyInfo?.contactNumber || ""}
                      onChange={handleChange}
                      className="formInput"
                    />
                  </div>
                </div>

                <div className="buttonContainer">
                  <button type="submit" disabled={saving} className="primaryButton">
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
                    className="dangerButton"
                  >
                    <CloseIcon fontSize="small" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              /* View Mode */
              <div>
                <div className="profileFormGrid">
                  <div className="formGroup">
                    <label>Phone</label>
                    <div className="formInput" style={{ background: '#f9fafb', color: '#374151' }}>
                      {phone || "Not provided"}
                    </div>
                  </div>
                  <div className="formGroup">
                    <label>Age</label>
                    <div className="formInput" style={{ background: '#f9fafb', color: '#374151' }}>
                      {age || "Not provided"}
                    </div>
                  </div>
                  <div className="formGroup">
                    <label>Blood Group</label>
                    <div className="formInput" style={{ background: '#f9fafb', color: '#374151' }}>
                      {emergencyInfo?.bloodGroup || "Not provided"}
                    </div>
                  </div>
                  <div className="formGroup">
                    <label>Allergies</label>
                    <div className="formInput" style={{ background: '#f9fafb', color: '#374151' }}>
                      {emergencyInfo?.allergies || "Not provided"}
                    </div>
                  </div>
                  <div className="formGroup">
                    <label>Medical History</label>
                    <div className="formInput" style={{ background: '#f9fafb', color: '#374151' }}>
                      {medicalHistory || "Not provided"}
                    </div>
                  </div>
                  <div className="formGroup">
                    <label>Address</label>
                    <div className="formInput" style={{ background: '#f9fafb', color: '#374151' }}>
                      {address || "Not provided"}
                    </div>
                  </div>
                  <div className="formGroup">
                    <label>Emergency Contact</label>
                    <div className="formInput" style={{ background: '#f9fafb', color: '#374151' }}>
                      {emergencyInfo?.contactNumber || "Not provided"}
                    </div>
                  </div>
                </div>

                <div className="buttonContainer">
                  <button onClick={() => setIsEditable(true)} className="primaryButton">
                    <EditIcon fontSize="small" />
                    Edit Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
