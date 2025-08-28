
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const statusList = ['Applied', 'Screening', 'Interviewing', 'Offer', 'Withdrawn', 'Ghosted', 'Rejected', 'Accepted']

const ApplicationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  resume: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
  company: { type: String, required: true },
  jobTitle: { type: String, required: true },
  location: { type: String, default: '' },
  jobType: { type: String, enum: ['Internship', 'Full Time', 'Part Time', 'Contract'], default: 'Full Time' },
  status: { type: String, enum: statusList, default: 'Applied' },
  applicationDate: { type: Date, default: Date.now },
  jobDescription: { type: String, default: '' }, 
  notes: { type: String, default: '' },
  isLiked: { type: Boolean, default: false },
  statusHistory: [{
    status: { type: String, enum: statusList },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);