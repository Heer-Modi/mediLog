import React, { useState, useEffect } from "react";
import axios from "axios";
import { CircularProgress } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import DoctorSidebar from "../../components/DoctorSidebar.jsx"; // **FIXED**: Corrected import path
import "../../styles/DoctorProfile.css"; // **FIXED**: Corrected import path and using new CSS file

const API_BASE = "http://localhost:5000";

const DoctorProfile = () => {
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

        const response = await axios.get(`${API_BASE}/api/doctors/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.doctor) {
          setProfile(response.data.doctor);
          setPhotoUrl(response.data.doctor.photo || null);
        }
      } catch (error) {
        console.error("Error fetching doctor profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Destructure doctor-specific fields
  const {
    name = "",
    email = "",
    phone = "",
    specialization = "",
    designation = "",
    department = "",
    experience = "",
  } = profile;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelEditing = () => {
    setIsEditable(false);
    // You might want to refetch the profile here to discard changes
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
      // Append all doctor-specific fields
      formData.append("name", profile.name);
      formData.append("email", profile.email);
      formData.append("phone", profile.phone);
      formData.append("specialization", profile.specialization);
      formData.append("designation", profile.designation);
      formData.append("department", profile.department);
      formData.append("experience", profile.experience);

      if (profile.photo instanceof File) {
        formData.append("photo", profile.photo);
      }

      const response = await axios.post(
        `${API_BASE}/api/doctors/profile`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.doctor) {
        setProfile(response.data.doctor);
        if (response.data.doctor.photo) {
          setPhotoUrl(response.data.doctor.photo);
        }
      }

      setIsEditable(false);
      alert("Profile saved successfully!");
    } catch (error) {
      console.error("Error saving doctor profile:", error);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="patientProfileContainer">
        <DoctorSidebar />
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
      <DoctorSidebar />
      
      <div className="patientMainContent">
        <div className="profileCard">
          <div className="profileCardHeader">
            <h1 className="profileTitle">Doctor Profile</h1>
            <p className="profileSubtitle">
              {isEditable
                ? "Edit your professional details below"
                : "View and manage your professional information"}
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

              <h2 className="profileName">Dr. {name}</h2>
              <p className="profileEmail">{email}</p>
            </div>

            {isEditable ? (
              /* Edit Mode */
              <form onSubmit={handleSubmit}>
                <div className="profileFormGrid">
                  <div className="formGroup">
                    <label>Full Name</label>
                    <input type="text" name="name" value={name} onChange={handleChange} className="formInput" />
                  </div>
                  <div className="formGroup">
                    <label>Phone</label>
                    <input type="text" name="phone" value={phone} onChange={handleChange} className="formInput" />
                  </div>
                   <div className="formGroup">
                    <label>Specialization</label>
                    <input type="text" name="specialization" value={specialization} onChange={handleChange} className="formInput" />
                  </div>
                   <div className="formGroup">
                    <label>Designation</label>
                    <input type="text" name="designation" value={designation} onChange={handleChange} className="formInput" />
                  </div>
                   <div className="formGroup">
                    <label>Department</label>
                    <input type="text" name="department" value={department} onChange={handleChange} className="formInput" />
                  </div>
                  <div className="formGroup">
                    <label>Experience (Years)</label>
                    <input type="number" name="experience" value={experience} onChange={handleChange} className="formInput" />
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
                  <button type="button" onClick={handleCancelEditing} className="dangerButton">
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
                    <label>Specialization</label>
                    <div className="formInput" style={{ background: '#f9fafb', color: '#374151' }}>
                      {specialization || "Not provided"}
                    </div>
                  </div>
                   <div className="formGroup">
                    <label>Designation</label>
                    <div className="formInput" style={{ background: '#f9fafb', color: '#374151' }}>
                      {designation || "Not provided"}
                    </div>
                  </div>
                   <div className="formGroup">
                    <label>Department</label>
                    <div className="formInput" style={{ background: '#f9fafb', color: '#374151' }}>
                      {department || "Not provided"}
                    </div>
                  </div>
                  <div className="formGroup">
                    <label>Experience</label>
                    <div className="formInput" style={{ background: '#f9fafb', color: '#374151' }}>
                      {experience ? `${experience} years` : "Not provided"}
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

export default DoctorProfile;

