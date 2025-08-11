import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import doctorImage from '../assets/doctor.jpg';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const togglePassword = () => setShowPwd(!showPwd);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password,
      });

      // Save user info in localStorage
      localStorage.setItem('userInfo', JSON.stringify(data));

      // Redirect based on role
      if (data.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/dashboard/home');
      }
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <img src={doctorImage} alt="Doctor" />
        <h1>
          HELLO <span style={{ color: '#007bff' }}>!</span>
        </h1>
        <p>Please enter your details to continue</p>
      </div>

      <div className="login-right">
        <div className="login-header">
          <h2>MEdilog</h2>
          <p>Welcome back. Please log in to continue.</p>
        </div>

        {error && (
          <div style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>{error}</div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username or E-mail</label>
            <input
              type="email"
              placeholder="Aya_99@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group password-toggle">
            <label>Password</label>
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="toggle-eye" onClick={togglePassword}>
              {showPwd ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit" className="login-button">
            Log In
          </button>
        </form>

        <div className="helper-links">
          <p>
            <a href="#">Forgot Password?</a>
          </p>
          <p>
            Do Not Have an Account? <Link to="/register">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
