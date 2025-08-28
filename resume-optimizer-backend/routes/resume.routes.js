const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const Resume = require('../models/Resume.model');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const axios = require('axios');

// Configure multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configure the S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const PYTHON_API_URL = 'http://localhost:8000/parse-resume-file';

// @route   POST /api/resumes
// @desc    Upload file to S3, parse text, and save a new resume
// @access  Private
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  const { title } = req.body;
  const file = req.file;

  if (!file || !title) {
    return res.status(400).json({ msg: 'Title and file are required' });
  }

  // 1. Upload original file to S3
  const fileName = `${req.user.id}-${Date.now()}-${file.originalname.replace(/\s/g, '_')}`;
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  try {
    await s3Client.send(command);
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    // 2. Send file to Python to get plain text
    const formData = new FormData();
    formData.append('file', new Blob([file.buffer]), file.originalname);
    const parseResponse = await axios.post(PYTHON_API_URL, formData);
    const content = parseResponse.data.text;

    // 3. Save resume info to MongoDB
    const newResume = new Resume({
      title,
      content,
      fileUrl,
      user: req.user.id,
    });

    const resume = await newResume.save();
    res.json(resume);
  } catch (err) {
    console.error("Error during resume creation:", err);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/resumes
// @desc    Get all resumes for a user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id }).sort({ date: -1 });
    res.json(resumes);
  } catch (err)
  {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// @route   GET /api/resumes/:id
// @desc    Get a single resume by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
    try {
      const resume = await Resume.findById(req.params.id);
  
      if (!resume) {
        return res.status(404).json({ msg: 'Resume not found' });
      }
  
      // Make sure user owns the resume
      if (resume.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized' });
      }
  
      res.json(resume);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  
  // @route   DELETE /api/resumes/:id
// @desc    Delete a resume
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ msg: 'Resume not found' });
    }

    // Make sure user owns the resume
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await resume.deleteOne();

    res.json({ msg: 'Resume removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
