const express = require('express');
const app = express();
const port = 5000;

// Middleware to parse JSON requests
app.use(express.json());


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});