// src/components/Auth/LoginPage.js
import React, { useState } from 'react';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseconfig'; // Adjust path as needed
import './LoginPage.css'; // Shared CSS file

// Props from App.js: onSuccess (to close modal), onSwitchToSignUp
const LoginPage = ({ onSuccess, onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');


  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (err) {
      setError(err.message);
      console.error("Login error:", err);
    }
  };

  return (
    <div className="auth-container"> {/* Use .auth-container for styling consistency */}
      <h2>Welcome back</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="auth-button">Sign In</button>
      </form>
      <p className="auth-switch">
        Don't have an account?{' '}
        {/* MODIFIED: Use a button to call the onSwitchToSignUp prop */}
        <button type="button" onClick={onSwitchToSignUp} className="link-button">
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default LoginPage;