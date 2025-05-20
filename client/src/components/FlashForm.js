// src/components/FlashForm.js
import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './FlashForm.css';

const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_WORDS_FOR_TEXT_INPUT = 10000;
const MAX_QUESTIONS = 20;
// Ensure this key is correct and has permissions for the model
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY; // Your provided key

const FlashForm = () => {
  const [text, setText] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPdf, setUploadedPdf] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const countWords = (str) => {
    if (!str.trim()) return 0;
    return str.trim().split(/\s+/).length;
  };
  const currentWordCount = useMemo(() => countWords(text), [text]);

  const handleTextChange = (e) => {
    // If a PDF is uploaded, don't allow text changes
    if (uploadedPdf) return;
    
    const newText = e.target.value;
    const words = newText.trim().split(/\s+/);
    if (words.length <= MAX_WORDS_FOR_TEXT_INPUT) {
      setText(newText);
    } else {
      setText(words.slice(0, MAX_WORDS_FOR_TEXT_INPUT).join(' '));
      alert(`You have reached the client-side maximum word limit of ${MAX_WORDS_FOR_TEXT_INPUT} words.`);
    }
  };

  const handleClear = () => {
    setText('');
    setUploadedPdf(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        if (file.size > MAX_PDF_SIZE_BYTES) {
          alert(`File size exceeds the limit of ${MAX_PDF_SIZE_BYTES / (1024 * 1024)}MB.`);
          if (fileInputRef.current) fileInputRef.current.value = null;
          return;
        }
        // Store the PDF file reference
        setUploadedPdf(file);
        setText(`PDF ready for processing: ${file.name}`);
      } else {
        alert('Please upload a PDF file.');
        if (fileInputRef.current) fileInputRef.current.value = null;
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleNumberOfQuestionsChange = (e) => {
    const rawValue = e.target.value;
    if (rawValue === '') {
      setNumberOfQuestions(''); // Allow empty input temporarily
      return;
    }

    const value = parseInt(rawValue, 10);

    if (isNaN(value)) { // Handle non-numeric input if any (though type="number" helps)
        setNumberOfQuestions(1); // Or keep previous valid value
        return;
    }

    if (value > MAX_QUESTIONS) {
      alert(`The maximum number of questions you can generate at once is ${MAX_QUESTIONS}.`);
      // Optionally, set to max or revert to previous valid value
      setNumberOfQuestions(MAX_QUESTIONS); // Set to max if they exceed
    } else if (value > 0) {
      setNumberOfQuestions(value);
    } else {
      // If value is 0 or negative (and not empty string handled above)
      setNumberOfQuestions(1); // Default to 1 if invalid (but positive)
    }
  };

  const handleGenerate = async () => {
    if (!GEMINI_API_KEY) {
      alert('Gemini API key is not configured.');
      return;
    }
    if (!text.trim() && !uploadedPdf) {
      alert('Please enter some text or upload a PDF.');
      return;
    }
    if (!numberOfQuestions || numberOfQuestions <= 0) {
      alert('Please enter a valid number of questions (greater than 0).');
      return;
    }

    setIsLoading(true);

    let requestBody;

    try {
      if (uploadedPdf) {
        // Convert PDF to base64
        const pdfArrayBuffer = await uploadedPdf.arrayBuffer();
        const base64Data = btoa(
          new Uint8Array(pdfArrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );
        
        // Create request with PDF file - using proper field names
        requestBody = {
          contents: [{
            parts: [
              {
                text: `Generate ${numberOfQuestions} flashcards from this PDF.
Each flashcard should have a "question" and an "answer".
Provide the output ONLY as a valid JSON array of objects, where each object has a "question" key and an "answer" key. Do not include any other text, explanation, or markdown formatting around the JSON.
Example JSON format:
[
  {"question": "What is the capital of France?", "answer": "Paris"},
  {"question": "Who wrote Hamlet?", "answer": "William Shakespeare"}
]`
              },
              {
                inline_data: {
                  mime_type: "application/pdf",
                  data: base64Data
                }
              }
            ]
          }]
        };
      } else {
        // Text-based prompt for text input
        const prompt = `Generate ${numberOfQuestions} flashcards from the following text.
Each flashcard should have a "question" and an "answer".
Provide the output ONLY as a valid JSON array of objects, where each object has a "question" key and an "answer" key. Do not include any other text, explanation, or markdown formatting around the JSON.
Example JSON format:
[
  {"question": "What is the capital of France?", "answer": "Paris"},
  {"question": "Who wrote Hamlet?", "answer": "William Shakespeare"}
]
Text to process:
"""
${text}
"""`;

        requestBody = {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        };
      }

      // Using your specified model
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        // Attempt to get more detailed error message
        let errorDetails = `API request failed with status ${response.status}`;
        try {
            const errorData = await response.json(); // Try to parse error as JSON
            console.error('Gemini API Error (JSON):', errorData);
            errorDetails += `: ${errorData.error?.message || JSON.stringify(errorData.error) || 'Unknown API error'}`;
        } catch (e) {
            const errorText = await response.text(); // Fallback to text if not JSON
            console.error('Gemini API Error (Text):', errorText);
            errorDetails += `. Response: ${errorText.substring(0, 100)}...`;
        }
        throw new Error(errorDetails);
      }

      const data = await response.json();
      console.log("Full Gemini API Response:", data);

      let generatedFlashcards = [];
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
        const rawJsonOutput = data.candidates[0].content.parts[0].text;
        console.log("Raw Gemini Output (text part):", rawJsonOutput);

        try {
          const cleanedJson = rawJsonOutput.replace(/^```json\s*|```$/g, '').trim();
          const parsedFlashcards = JSON.parse(cleanedJson);

          if (Array.isArray(parsedFlashcards) && parsedFlashcards.every(card => card.question && card.answer)) {
            generatedFlashcards = parsedFlashcards;
          } else {
            throw new Error("Generated content is not in the expected JSON array format of {question, answer} objects.");
          }
        } catch (parseError) {
          console.error("Failed to parse JSON from Gemini:", parseError);
          console.error("Received non-JSON or malformed JSON string:", rawJsonOutput);
          alert(`Error: Gemini returned data that could not be parsed as valid flashcard JSON. Raw output: ${rawJsonOutput.substring(0,200)}... Check console for details.`);
          setIsLoading(false); // Ensure loading is stopped
          return;
        }
      } else {
        console.warn("Gemini response did not contain expected content structure:", data);
        throw new Error('No content generated by the API or unexpected response structure.');
      }

      if (generatedFlashcards.length === 0) {
        alert('Gemini generated 0 flashcards. The input text might have been too short, unclear, or the model could not extract questions.');
        setIsLoading(false); // Ensure loading is stopped
        return;
      }

      if (generatedFlashcards.length < numberOfQuestions) {
        alert(`Note: Only ${generatedFlashcards.length} flashcards could be generated, though ${numberOfQuestions} were requested.`);
      }

      // Passing only cards, as deckTitle input was removed from this component
      navigate('/my-cards', { state: { cards: generatedFlashcards } });

    } catch (error) {
      console.error('Error generating flashcards with Gemini:', error);
      alert(`Failed to generate flashcards: ${error.message}. Please check the console for more details.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flash-form-container">
      <div className="flash-form">
        <h2>Create Your Flashcards</h2>
        <p className="form-description">
          Start by typing or uploading a PDF
        </p>
        <div className="form-controls">
          <button onClick={handleClear} className="control-button clear-button" disabled={isLoading}>Clear</button>
          <button onClick={handleUploadClick} className="control-button upload-button" disabled={isLoading}>Upload PDF</button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf"
            style={{ display: 'none' }}
            disabled={isLoading}
          />
          <div className="num-questions-control">
            <label htmlFor="numQuestions">Number of Questions:</label>
            <input
              type="number"
              id="numQuestions"
              value={numberOfQuestions}
              onChange={handleNumberOfQuestionsChange}
              min="1"
              className="num-questions-input"
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="textarea-wrapper">
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Paste your notes, or upload a PDF"
            rows={15}
            className={`text-input-area ${uploadedPdf ? 'pdf-loaded' : ''}`}
            disabled={isLoading || uploadedPdf}
            readOnly={!!uploadedPdf}
          />
          <div className="word-count">
            {uploadedPdf ? 'PDF loaded' : `${currentWordCount}/${MAX_WORDS_FOR_TEXT_INPUT} words`}
          </div>
        </div>
        <button
          className="generate-button main-action-button"
          onClick={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? 'Generating with AI...' : 'Generate Flashcards'}
        </button>
        {GEMINI_API_KEY ? null : <p style={{color: 'red', textAlign: 'center', marginTop: '10px'}}>Warning: REACT_APP_GEMINI_API_KEY is not set.</p>}
      </div>
    </div>
  );
};

export default FlashForm;