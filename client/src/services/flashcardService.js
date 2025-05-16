// src/services/flashcardService.js
import { db } from '../firebaseconfig'; // Correct path to your firebaseconfig.js
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  serverTimestamp,
  getCountFromServer // Make sure this is imported from 'firebase/firestore'
} from 'firebase/firestore';

const flashcardSetsCollectionRef = collection(db, 'flashcardSets');

export const saveFlashcardSet = async (userId, title, flashcards) => {
  if (!userId || !title || !flashcards) {
    throw new Error("Missing required fields to save flashcard set.");
  }
  // Ensure flashcards is an array
  if (!Array.isArray(flashcards)) {
    throw new Error("Flashcards data must be an array.");
  }
  // You might want to validate the structure of each flashcard object here too
  // e.g., item => typeof item.question === 'string' && typeof item.answer === 'string'

  return await addDoc(flashcardSetsCollectionRef, {
    userId,
    title,
    flashcards, // This should be the array of { question: "...", answer: "..." }
    createdAt: serverTimestamp()
  });
};

export const getUserFlashcardSets = async (userId) => {
  if (!userId) return [];
  const q = query(flashcardSetsCollectionRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getUserFlashcardSetCount = async (userId) => {
  if (!userId) return 0;
  const q = query(flashcardSetsCollectionRef, where("userId", "==", userId));
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
};

export const deleteFlashcardSet = async (setId) => {
  if (!setId) throw new Error("Set ID is required to delete.");
  const setDocRef = doc(db, 'flashcardSets', setId);
  return await deleteDoc(setDocRef);
};

