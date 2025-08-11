import React, { useState } from 'react';
import {
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import doctorImage from '../assets/doctor.jpg';
import './Register.css'; // Reusing the same styles

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/users/register', formData);
      setSnackbar({
        open: true,
        message: 'Registration successful!',
        severity: 'success',
      });
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Registration failed!',
        severity: 'error',
      });
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <img src={doctorImage} alt="Doctor" />
        <h1>WELCOME</h1>
        <p>Register your MediLog account to get started</p>
      </div>

      <div className="login-right">
        <div className="login-header">
          <h2>Register</h2>
          <p>Create your account to access MediLog</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group password-toggle">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              style={{
                padding: '14px 16px',
                borderRadius: '10px',
                border: '1px solid #ccc',
                fontSize: '15px',
                outline: 'none',
                background: '#fff',
              }}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          <button type="submit" className="login-button">
            Register
          </button>
        </form>

        <div className="helper-links">
          <p>Already have an account? <Link to="/">Login</Link></p>
        </div>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Register;
