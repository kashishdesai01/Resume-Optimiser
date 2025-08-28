const express = require('express');
const router = express.Router();
const axios = require('axios');

const PYTHON_API_URL = 'http://localhost:8000/analyze';

// @route   POST /api/analyze/public
// @desc    Analyzes resume/job description for unauthenticated users
// @access  Public
router.post('/public', async (req, res) => {
  const { resumeText, jobDescriptionText } = req.body;

  if (!resumeText || !jobDescriptionText) {
    return res.status(400).json({ msg: 'Please provide both resume and job description text.' });
  }

  try {
    const response = await axios.post(PYTHON_API_URL, {
      resume_text: resumeText,
      job_description_text: jobDescriptionText
    });

    res.json(response.data);
  } catch (err) {
    console.error('Error calling AI service:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;