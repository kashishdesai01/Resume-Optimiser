// src/services/generate.service.js
import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:5001/api/generate';

const generateSummary = (resumeText, jobDescriptionText) => {
  return axios.post(
    `${API_URL}/summary`,
    { resumeText, jobDescriptionText },
    { headers: authHeader() } 
  );
};

const getOptimizationSuggestions = (resumeText, jobDescriptionText) => {
    return axios.post(
      `${API_URL}/optimize`,
      { resumeText, jobDescriptionText },
      { headers: authHeader() }
    );
  };


const GenerateService = {
    generateSummary,
    getOptimizationSuggestions,
};

export default GenerateService;