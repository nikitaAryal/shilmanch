const express = require('express');
const userRoutes = require('./server'); // assuming routes are in server.js
const cors = require('cors');
const path = require('path');
const bodyParser = require("body-parser");


const app = express();
const PORT = process.env.PORT || 3000;

//makes picture folder publicly accessible
app.use('/api/pictures', express.static('pictures'));

// Middleware to parse JSON body
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enable CORS for all origins (adjust origin in production)
app.use(cors());

// Use the routes defined in server.js
app.use('/api', userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

