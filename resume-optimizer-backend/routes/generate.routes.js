// routes/generate.routes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/auth.middleware');

const PYTHON_API_URL = 'http://localhost:8000';

// @route   POST /api/generate/summary
// @desc    Generate a professional summary using AI
// @access  Private
router.post('/summary', authMiddleware, async (req, res) => {
  const { resumeText, jobDescriptionText } = req.body;

  if (!resumeText || !jobDescriptionText) {
    return res.status(400).json({ msg: 'Resume and job description text are required.' });
  }

  try {
    // Forward the request to the Python AI service's new endpoint
    const response = await axios.post(`${PYTHON_API_URL}/generate/summary`, {
      resume_text: resumeText,
      job_description_text: jobDescriptionText,
    });

    // Send the AI-generated summary back to the frontend
    res.json(response.data);
  } catch (err) {
    console.error('Error calling summary generation service:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/generate/optimize
// @desc    Get AI-powered optimization suggestions for a resume
// @access  Private
router.post('/optimize', authMiddleware, async (req, res) => {
    const { resumeText, jobDescriptionText } = req.body;
  
    if (!resumeText || !jobDescriptionText) {
      return res.status(400).json({ msg: 'Resume and job description text are required.' });
    }
  
    try {
      const response = await axios.post(`${PYTHON_API_URL}/optimize/resume`, {
        resume_text: resumeText,
        job_description_text: jobDescriptionText,
      });
      res.json(response.data);
    } catch (err) {
      console.error('Error calling optimization service:', err.message);
      res.status(500).send('Server Error');
    }
  });



module.exports = router;