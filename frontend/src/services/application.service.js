// src/services/application.service.js
import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:5001/api/applications';

const createApplication = (data) => {
  return axios.post(API_URL, data, { headers: authHeader() });
};

const getApplications = () => {
  return axios.get(API_URL, { headers: authHeader() });
};

const getApplicationById = (id) => {
    return axios.get(`${API_URL}/${id}`, { headers: authHeader() });
  };
  

const updateApplication = (id, updateData) => {
    return axios.put(`${API_URL}/${id}`, updateData, { headers: authHeader() });
  };

  const deleteApplication = (id) => {
    return axios.delete(`${API_URL}/${id}`, { headers: authHeader() });
  };

  const deleteManyApplications = (ids) => {
    return axios.delete(API_URL, { headers: authHeader(), data: { ids } });
  };
const ApplicationService = {
  createApplication,
  getApplications,
  updateApplication,
  getApplicationById,
  deleteApplication,
  deleteManyApplications,
};

export default ApplicationService;