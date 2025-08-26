const express = require('express');
const userRoutes = require('./server'); // assuming routes are in server.js
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON body
app.use(express.json());

// Enable CORS for all origins (adjust origin in production)
app.use(cors());

// Use the routes defined in server.js
app.use('/api', userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

