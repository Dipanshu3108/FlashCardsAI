// src/components/FlashcardDisplay.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './FlashcardDisplay.css'; // Import the CSS file

import { auth } from '../firebaseconfig'; // For current user
import { saveFlashcardSet, getUserFlashcardSetCount } from '../services/flashcardService';

// --- ACCEPT openAuthModal PROP from App.js ---
const FlashcardDisplay = ({ openAuthModal }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showProgress, setShowProgress] = useState(true);
  const [completedCards, setCompletedCards] = useState(new Set());

  const [deckTitle, setDeckTitle] = useState('');
  const [deckId, setDeckId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    if (location.state) {
      if (location.state.cards && location.state.cards.length > 0) {
        setFlashcards(location.state.cards);
        setDeckTitle(location.state.deckTitle || ''); // Get title if passed
        setDeckId(location.state.deckId || null);     // Get ID if passed (viewing saved deck)
        setCurrentCardIndex(0);
        setFlipped(false);
        setCompletedCards(new Set());
        setSaveError('');
        setSaveSuccess('');
      } else if ((!location.state.cards || location.state.cards.length === 0) && !location.state.deckId) {
        // Only redirect if truly no cards AND no deckId (meaning not trying to view an empty saved deck)
        alert("No flashcards data found. Redirecting to create form.");
        navigate('/');
      }
    } else {
      alert("No flashcards to display. Redirecting to create form.");
      navigate('/');
    }
  }, [location.state, navigate]);

  // --- MODIFIED handleSaveSet TO USE openAuthModal ---
  const handleSaveSet = async () => {
    console.log("handleSaveSet called");

    if (deckId) {
      console.log("Exiting: deckId exists - already saved.", deckId);
      alert("This set is already saved.");
      return;
    }

    // --- CHECK AUTHENTICATION HERE ---
    if (!auth.currentUser) {
      console.log("User not logged in. Requesting login/signup via modal.");
      alert("You need to be logged in to save flashcards.");
      if (openAuthModal) { // Check if the prop is passed
        openAuthModal('login'); // Open the login modal
      } else {
        console.error("openAuthModal prop not provided to FlashcardDisplay. Cannot open login modal.");
        // Fallback if prop not passed (should not happen with correct App.js setup)
        // alert("Login is required to save. Please log in through the Account menu.");
      }
      return; // Stop further execution until user logs in
    }
    // --- END AUTHENTICATION CHECK ---

    if (!flashcards || flashcards.length === 0) {
      console.log("Exiting: No flashcards to save.");
      alert("There are no flashcards to save.");
      return;
    }

    const titleInput = window.prompt("Enter a title for this flashcard set:", "My New Flashcard Set"); // deckTitle removed as default for newly generated
    console.log("Title input from prompt:", titleInput);

    if (!titleInput || titleInput.trim() === "") {
      console.log("Exiting: No title entered or cancelled prompt.");
      return;
    }

    console.log("Setting isSaving to true");
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      const currentUserId = auth.currentUser.uid; // auth.currentUser should be available here
      console.log("Current User ID:", currentUserId);

      console.log("Attempting to get user flashcard count...");
      const count = await getUserFlashcardSetCount(currentUserId);
      console.log("User flashcard count:", count);

      if (count >= 5) {
        console.log("Exiting: User has reached limit of 5 sets.");
        setSaveError("You have reached the maximum limit of 5 saved sets. Please delete an existing set to save a new one.");
        setIsSaving(false);
        return;
      }

      console.log("Attempting to save flashcard set with title:", titleInput.trim(), "and cards:", flashcards);
      const newSetRef = await saveFlashcardSet(currentUserId, titleInput.trim(), flashcards);
      console.log("Save successful, newSetRef:", newSetRef);

      if (newSetRef && newSetRef.id) {
          setDeckTitle(titleInput.trim());
          setDeckId(newSetRef.id);
          setSaveSuccess(`Set "${titleInput.trim()}" saved successfully!`);
      } else {
          console.error("Save operation did not return a valid reference with an ID.");
          setSaveError("Save operation completed but failed to get a reference ID. Please check console.");
      }
    } catch (error) {
      console.error("ERROR in handleSaveSet try block:", error);
      setSaveError(error.message || "Could not save the set. Please try again.");
    }
    console.log("Setting isSaving to false (end of function or after error)");
    setIsSaving(false);
  };
  // --- END MODIFIED handleSaveSet ---

  const handleNext = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setFlipped(false);
    }
  };

  const handleFlip = () => {
    setFlipped(!flipped);
    if (!flipped) { // When flipping to show answer
      const newCompleted = new Set(completedCards);
      newCompleted.add(currentCardIndex);
      setCompletedCards(newCompleted);
    }
  };

  const handleRandomCard = () => {
    if (flashcards.length > 1) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * flashcards.length);
      } while (randomIndex === currentCardIndex && flashcards.length > 1);
      setCurrentCardIndex(randomIndex);
      setFlipped(false);
    } else if (flashcards.length === 1) { // Handle case with only one card
      setCurrentCardIndex(0);
      setFlipped(false);
    }
  };

  const toggleProgress = () => {
    setShowProgress(!showProgress);
  };

  const resetProgress = () => {
    setCompletedCards(new Set());
    setFlipped(false); // Also reset flip state of current card
  };

  // Modified loading/no cards condition slightly
  if (!location.state && flashcards.length === 0) {
    // This condition might be hit if navigated directly to /my-cards without state
    // and no deck was loaded yet (e.g., if fetching was implemented for direct access)
    // For now, it serves as a fallback.
    return (
      <div className="loading-container">
        <p className="loading-text">Loading flashcards or preparing display...</p>
        <button onClick={() => navigate('/')} className="loading-button">
          Create New Flashcards
        </button>
      </div>
    );
  }
  if (flashcards.length === 0 && location.state && (!location.state.cards || location.state.cards.length === 0)) {
    // This specifically handles the case where we arrived with state, but it had no cards.
    // The useEffect already navigates away, but this is a safeguard.
     return (
      <div className="loading-container">
        <p className="loading-text">No flashcards were provided.</p>
        <button onClick={() => navigate('/')} className="loading-button">
          Create New Flashcards
        </button>
      </div>
    );
  }


  const progressPercent = flashcards.length > 0 ? (completedCards.size / flashcards.length) * 100 : 0;

  return (
    <div className="flashcard-display-container">
      <div className="flashcard-display-content">
        <button onClick={() => navigate('/')} className="back-to-form-button">
          ← Create New Flashcards
        </button>

        <div className="card-section">
          {deckTitle ? (
            <h1 className="card-section-title">{deckTitle}</h1>
          ) : (
            <h1 className="card-section-title">Study Flashcards</h1>
          )}
          <p className="card-section-subtitle">
            {flashcards.length} cards. Click to flip.
          </p>

          {!deckId && flashcards && flashcards.length > 0 && (
            <div className="save-deck-section">
              <button onClick={handleSaveSet} disabled={isSaving} className="save-deck-button">
                {isSaving ? 'Saving...' : 'Save This Set'}
              </button>
              {saveSuccess && <p className="save-message success">{saveSuccess}</p>}
              {saveError && <p className="save-message error">{saveError}</p>}
            </div>
          )}
          {deckId && <p className="save-message info">This flashcard set is saved.</p>}

          {showProgress && (
            <div className="progress-info-container">
              <div className="progress-text">
                <span>{completedCards.size} of {flashcards.length} cards viewed</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="progress-bar-background">
                <div
                  className="progress-bar-foreground"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}

          {flashcards.length > 0 && currentCardIndex < flashcards.length && ( // Ensure card exists before accessing
            <div className="flashcard-container" onClick={handleFlip}>
              <div className={`flashcard-flipper flashcard-front ${flipped ? 'flipped' : ''}`}>
                <p className="flashcard-text-question">
                  {flashcards[currentCardIndex]?.question}
                </p>
              </div>
              <div className={`flashcard-flipper flashcard-back ${flipped ? 'flipped' : ''}`}>
                <p className="flashcard-text-answer">
                  {flashcards[currentCardIndex]?.answer}
                </p>
              </div>
            </div>
          )}

          {flashcards.length > 0 && ( // Only show controls if there are flashcards
            <>
              <div className="controls-navigation">
                <button onClick={handlePrevious} disabled={currentCardIndex === 0} className="controls-navigation-button">
                  Previous
                </button>
                <div className="card-counter">
                  {currentCardIndex + 1} / {flashcards.length}
                </div>
                <button onClick={handleNext} disabled={currentCardIndex === flashcards.length - 1} className="controls-navigation-button">
                  Next
                </button>
              </div>

              <div className="controls-actions">
                <button onClick={handleRandomCard} className="action-button random-button">
                  Random Card
                </button>
                <button onClick={toggleProgress} className="action-button toggle-progress-button">
                  {showProgress ? 'Hide Progress' : 'Show Progress'}
                </button>
                <button onClick={resetProgress} className="action-button reset-progress-button">
                  Reset Progress
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashcardDisplay;