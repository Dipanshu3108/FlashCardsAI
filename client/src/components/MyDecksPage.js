import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Link is not used directly here for navigation
import { auth } from '../firebaseconfig'; // Assuming firebaseconfig is in src/
import { getUserFlashcardSets, deleteFlashcardSet } from '../services/flashcardService'; // Assuming services folder in src/
import './MyDecksPage.css'; // Create this CSS file

const MyDecksPage = () => {
  const [decks, setDecks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDecks = async () => {
      if (auth.currentUser) {
        setIsLoading(true);
        setError('');
        try {
          const userDecks = await getUserFlashcardSets(auth.currentUser.uid);
          setDecks(userDecks);
        } catch (err) {
          console.error("Error fetching decks:", err);
          setError("Could not load your decks. Please try again later.");
        }
        setIsLoading(false);
      } else {
        // This page is protected by ProtectedRoute, so auth.currentUser should exist.
        // If somehow accessed without auth, handle it (though ProtectedRoute should prevent this).
        setError("You must be logged in to view your decks.");
        setIsLoading(false);
        // Optionally, you could navigate to login here, but ProtectedRoute is preferred.
        // navigate('/login'); // Or open login modal
      }
    };

    fetchUserDecks();
  }, []); // Fetch on component mount

  const handleDeleteDeck = async (deckId, deckTitle) => {
    // Add a confirmation dialog
    if (window.confirm(`Are you sure you want to delete the deck "${deckTitle}"? This action cannot be undone.`)) {
      try {
        await deleteFlashcardSet(deckId);
        // Update the local state to reflect the deletion
        setDecks(prevDecks => prevDecks.filter(deck => deck.id !== deckId));
        alert(`Deck "${deckTitle}" deleted successfully.`);
      } catch (err) {
        console.error("Error deleting deck:", err);
        alert(`Could not delete the deck "${deckTitle}". Please try again.`);
      }
    }
  };

  const handleViewDeck = (deck) => {
    // Navigate to FlashcardDisplay, passing the deck's data in state
    // This ensures FlashcardDisplay gets the title, id, and cards.
    navigate('/my-cards', {
      state: {
        cards: deck.flashcards,
        deckTitle: deck.title,
        deckId: deck.id
      }
    });
  };

  if (isLoading) {
    return <div className="my-decks-container loading">Loading your decks...</div>;
  }

  if (error) {
    return <div className="my-decks-container error-message">{error}</div>;
  }

  return (
    <div className="my-decks-container">
      <h2>My Saved Flashcard Decks</h2>
      {decks.length === 0 ? (
        <p className="no-decks-message">You haven't saved any flashcard decks yet. Go generate some and save them!</p>
      ) : (
        <ul className="decks-list">
          {decks.map(deck => (
            <li key={deck.id} className="deck-item">
              <div className="deck-info">
                <h3>{deck.title}</h3>
                <p>{deck.flashcards ? deck.flashcards.length : 0} cards</p>
                {deck.createdAt && (
                  <p className="deck-date">
                    Saved: {new Date(deck.createdAt.seconds * 1000).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="deck-actions">
                <button onClick={() => handleViewDeck(deck)} className="view-button">
                  View / Study
                </button>
                <button onClick={() => handleDeleteDeck(deck.id, deck.title)} className="delete-button">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {decks.length > 0 && decks.length >= 5 && (
        <p className="limit-notice">You have reached your limit of 5 saved decks.</p>
      )}
    </div>
  );
};

export default MyDecksPage;