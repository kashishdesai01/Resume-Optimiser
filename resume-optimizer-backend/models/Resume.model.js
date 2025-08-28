// models/Resume.model.js

const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
    },
    title: {
      type: String,
      required: true,
      default: 'Untitled Resume',
    },
    content: {
      type: String, 
      required: true,
    },
    analysisResults: {
      type: mongoose.Schema.Types.Mixed, 
      default: {},
    },
    fileUrl: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Resume', ResumeSchema);