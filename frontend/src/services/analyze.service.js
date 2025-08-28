import axios from 'axios';

const API_URL = 'http://localhost:5001/api/analyze';

/**
 * Sends resume and job description text to the backend for analysis.
 * @param {string} resumeText - The text of the resume.
 * @param {string} jobDescriptionText - The text of the job description.
 * @returns {Promise<object>} The analysis results from the API.
 */
const analyzePublic = (resumeText, jobDescriptionText) => {
  return axios.post(`${API_URL}/public`, {
    resumeText,
    jobDescriptionText,
  });
};

const AnalyzeService = {
  analyzePublic,
};

export default AnalyzeService;