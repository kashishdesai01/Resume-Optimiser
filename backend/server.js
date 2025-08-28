// resume-optimizer-backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config();

// Initialize the Express app
const app = express();

// --- Middleware ---
// This middleware is crucial for reading JSON from the request body.
// It MUST be placed before your routes are defined.
app.use(cors());
app.use(express.json());

// --- Database Connection ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
connectDB();

// --- API Routes ---
app.get('/', (req, res) => res.send('API is running...')); // A simple test route
app.use('/api/auth', require('./routes/auth.routes.js'));
app.use('/api/analyze', require('./routes/analyze.routes.js'));
app.use('/api/resumes', require('./routes/resume.routes.js'));
app.use('/api/upload', require('./routes/upload.routes.js'));
app.use('/api/generate', require('./routes/generate.routes.js')); 
app.use('/api/applications', require('./routes/application.routes.js'));


// --- Start the Server ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});