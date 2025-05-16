// src/components/Auth/SignUpPage.js
import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom'; // Link for router navigation, not needed for modal switch
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseconfig'; // Adjust path as needed
import './LoginPage.css'; // Reusing LoginPage.css

// Props from App.js: onSuccess (to close modal), onSwitchToLogin
const SignUpPage = ({ onSuccess, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  // const navigate = useNavigate(); // Not directly navigating via router on success

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // App.js's onAuthStateChanged will detect the user and call onSuccess (which is closeModal)
      // If you need immediate feedback:
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
      console.error("Sign up error:", err);
    }
  };

  return (
    // No .auth-page div needed if this is only for modals
    <div className="auth-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
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
        <div className="form-group">
          <label htmlFor="confirm-password">Confirm Password</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="auth-button">Sign Up</button>
      </form>
      <p className="auth-switch">
        Already have an account?{' '}
        {/* MODIFIED: Use a button to call onSwitchToLogin prop */}
        <button type="button" onClick={onSwitchToLogin} className="link-button">
          Sign In
        </button>
      </p>
    </div>
  );
};

export default SignUpPage;