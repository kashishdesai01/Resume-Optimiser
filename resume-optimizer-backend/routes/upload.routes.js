const express = require('express');
const router = express.Router();
const multer = require('multer');
const FormData = require('form-data');
const axios = require('axios');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const PYTHON_API_URL = 'http://localhost:8000/parse-resume-file';

// @route   POST /api/upload/parse-resume
// @desc    Upload a resume file, send to Python for parsing
// @access  Public
router.post('/parse-resume', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: 'No file uploaded.' });
  }

  try {
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(PYTHON_API_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error('Error proxying file to Python service:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;