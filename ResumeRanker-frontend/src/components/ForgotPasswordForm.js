// ForgotPasswordForm.js
import React, { useEffect, useState } from 'react';
import '../static/css/ForgotPasswordForm.css'; // Import the CSS file for styling
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const ForgotPasswordForm = ({ onClose }) => {

  const [formData, setFormData] = useState({
    email: '',
    userType: 'user',
  });

  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.userType) {
      setFormData((prevData) => ({
        ...prevData,
        userType: location.state.userType,
      }));
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const baseURL = process.env.REACT_APP_baseURL || 'http://localhost:8000';
      let response = '';
      if(formData.userType === 'recruiter'){
        response = await axios.post(`${baseURL}/recruiter/forgot-password/`, {
          email: formData.email
        });
      }else{
        response = await axios.post(`${baseURL}/user/forgot-password/`, {
          email: formData.email
        });
      }
  
      if (response.status === 200) {
        alert('A temporary password has been sent to your email.');
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Error occurred. Please try again.');
    }
  };

  return (
    <div className="forgot-password-form-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit} className="forgot-password-form">
        <label>
          Email:
          <input type="email" placeholder="Enter registered email" name="email" value={formData.email} onChange={handleInputChange} required className="form-input" />
        </label>

        <div className="user-type-radio-group m-4">
          <label className="m-2">
            <input
              type="radio"
              name="userType"
              value="user"
              checked={formData.userType === 'user'}
              onChange={handleInputChange}
            />
            User
          </label>
          <label className="m-2">
            <input
              type="radio"
              name="userType"
              value="recruiter"
              checked={formData.userType === 'recruiter'}
              onChange={handleInputChange}
            />
            Recruiter
          </label>
        </div>

        <button type="submit" className="btn btn-primary">
          Reset Password
        </button>
        <Link to={'/'} className="btn btn-secondary text-decoration-none text-center">
          Back to Home
        </Link>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
