const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const Application = require('../models/Application.model');

// Create a new application
router.post('/', authMiddleware, async (req, res) => {
  const { resume, company, jobTitle, location, jobType, jobDescription, notes } = req.body;
  try {
    const newApplication = new Application({
      user: req.user.id,
      resume, company, jobTitle, location, jobType, jobDescription, notes,
      status: 'Applied', // Always start as 'Applied'
      statusHistory: [{ status: 'Applied', date: new Date() }] // Initialize history
    });
    const application = await newApplication.save();
    const populatedApp = await application.populate('resume', 'title');
    res.json(populatedApp);
  } catch (err) { res.status(500).send('Server Error'); }
});

// Get all applications for a user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user.id })
      .populate('resume', 'title')
      .sort({ applicationDate: -1 });
    res.json(applications);
  } catch (err) { res.status(500).send('Server Error'); }
});

// --- NEW: Get a single application by ID ---
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('resume', 'title');
    if (!application || application.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Application not found' });
    }
    res.json(application);
  } catch (err) { res.status(500).send('Server Error'); }
});

// Update an application (full edit)
router.put('/:id', authMiddleware, async (req, res) => {
  const { resume, company, jobTitle, location, jobType, status, jobDescription, notes, isLiked } = req.body;
  try {
    let application = await Application.findById(req.params.id);
    if (!application || application.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    // Check if status has changed
    if (status && application.status !== status) {
      application.statusHistory.push({ status: status, date: new Date() });
    }

    // Update all fields
    application.resume = resume;
    application.company = company;
    application.jobTitle = jobTitle;
    application.location = location;
    application.jobType = jobType;
    application.status = status;
    application.jobDescription = jobDescription;
    application.notes = notes;
    if (typeof isLiked === 'boolean') {
      application.isLiked = isLiked;
    }

    await application.save();
    const populatedApp = await application.populate('resume', 'title');
    res.json(populatedApp);
  } catch (err) { res.status(500).send('Server Error'); }
});

// --- ADD THIS NEW ROUTE ---
// @route   DELETE /api/applications/:id
// @desc    Delete an application
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    // Make sure user owns the application
    if (application.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await application.deleteOne();
    res.json({ msg: 'Application removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- ADD THIS NEW ROUTE ---
// @route   DELETE /api/applications
// @desc    Delete multiple applications by their IDs
// @access  Private
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body; // Expect an array of IDs in the request body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ msg: 'An array of application IDs is required.' });
    }

    // Delete all applications that are in the `ids` array AND belong to the logged-in user
    const deleteResult = await Application.deleteMany({
      _id: { $in: ids },
      user: req.user.id // Security check: ensures users can only delete their own applications
    });

    if (deleteResult.deletedCount === 0) {
        return res.status(404).json({ msg: 'No matching applications found to delete.' });
    }

    res.json({ msg: `${deleteResult.deletedCount} application(s) removed successfully.` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;