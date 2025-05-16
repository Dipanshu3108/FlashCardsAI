// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import FlashForm from './components/FlashForm';
import FlashcardDisplay from './components/FlashcardDisplay';
import MyDecksPage from './components/MyDecksPage';

import LoginPage from './components/Auth/LoginPage';
import SignUpPage from './components/Auth/SignUpPage';
import Modal from './components/Modal/Modal';
import ProtectedRoute from './ProtectedRoute';
import { auth } from './firebaseconfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function App() {
  const [authUser, setAuthUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const navigate = useNavigate();

  const accountButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [activeModal, setActiveModal] = useState(null); // For login/signup modals

  // "Login or Skip" modal state and callback were already removed in your provided code.

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setLoadingAuth(false);
      if (user) {
        setActiveModal(null); // Close login/signup modals if user logs in
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showAuthDropdown &&
        accountButtonRef.current && !accountButtonRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setShowAuthDropdown(false);
      }
    };
    if (showAuthDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAuthDropdown]);

  const openAuthModal = (modalType) => {
    setActiveModal(modalType);
    setShowAuthDropdown(false);
  };

  const closeAuthModal = () => {
    setActiveModal(null);
  };

  const switchToAuthModal = (modalType) => {
    setActiveModal(modalType);
  };

  // "Login or Skip" related functions were already removed.

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
      console.log("User signed out");
    } catch (error){
      console.error("Error signing out:", error);
    }
  };

  if (loadingAuth) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="header-left">
            <h1>
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                Flashcards
              </Link>
            </h1>
          </div>
          <div className="header-right">
            <nav>
              <ul className="nav-links">
                {authUser && (
                  <li>
                    <Link to="/my-decks" className="nav-action-button">
                      My Cards {/* Or "My Decks" based on your preference */}
                    </Link>
                  </li>
                )}
                <li className="account-menu">
                  <button
                    ref={accountButtonRef}
                    className="nav-action-button"
                    onClick={() => setShowAuthDropdown(!showAuthDropdown)}
                  >
                    Account
                  </button>
                  {showAuthDropdown && (
                    <div ref={dropdownRef} className="auth-dropdown">
                      {authUser ? (
                        <button onClick={() => { handleSignOut(); setShowAuthDropdown(false); }}>Sign Out</button>
                      ) : (
                        <>
                          <button onClick={() => openAuthModal('login')}>Sign In</button>
                          <button onClick={() => openAuthModal('signup')}>Sign Up</button>
                        </>
                      )}
                    </div>
                  )}
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
      <main>
        <div className="content-container">
          <Routes>
            {/* Props were already removed from FlashForm in your provided code */}
            <Route path="/" element={<FlashForm />} />
            <Route
              path="/my-cards" // Route for viewing generated or a specific deck
              element={
                  <FlashcardDisplay openAuthModal={openAuthModal} />
              }
            />
            <Route
              path="/my-decks"
              element={
                <ProtectedRoute authUser={authUser}>
                  <MyDecksPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </main>

      {/* Existing Auth Modals (no changes to these modal definitions) */}
      <Modal isOpen={activeModal === 'login'} onClose={closeAuthModal}>
        <LoginPage onSuccess={closeAuthModal} onSwitchToSignUp={() => switchToAuthModal('signup')} />
      </Modal>
      <Modal isOpen={activeModal === 'signup'} onClose={closeAuthModal}>
        <SignUpPage onSuccess={closeAuthModal} onSwitchToLogin={() => switchToAuthModal('login')} />
      </Modal>

      {/* The "Login or Skip" Modal block was already removed in your provided code. */}
    </div>
  );
}

export default App;