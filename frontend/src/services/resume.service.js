import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:5001/api/resumes';
const UPLOAD_URL = 'http://localhost:5001/api/upload';

// --- FOR GUESTS ---
// Uploads a file to get the text content back without saving
const parseResumeFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return axios.post(`${UPLOAD_URL}/parse-resume`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};


// --- FOR LOGGED-IN USERS ---
// Uploads a file and saves the resume to the user's account
const uploadAndSaveResumeFile = (formData) => {
  return axios.post(API_URL, formData, { 
    headers: { 
      ...authHeader(),
      'Content-Type': 'multipart/form-data',
    } 
  });
};

// Saves pasted text as a new resume to the user's account
const saveResumeText = (title, content) => {
  return axios.post(API_URL, { title, content }, { headers: authHeader() });
};

// Gets all resumes for the logged-in user
const getResumes = () => {
  return axios.get(API_URL, { headers: authHeader() });
};

// Gets a single resume by its ID
const getResumeById = (id) => {
  return axios.get(`${API_URL}/${id}`, { headers: authHeader() });
};

// Deletes a single resume
const deleteResume = (id) => {
  return axios.delete(`${API_URL}/${id}`, { headers: authHeader() });
};


// Export all functions
const ResumeService = {
  parseResumeFile,
  uploadAndSaveResumeFile,
  saveResumeText,
  getResumes,
  getResumeById,
  deleteResume,
};

export default ResumeService;