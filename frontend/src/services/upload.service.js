import axios from 'axios';

const API_URL = 'http://localhost:5001/api/upload';

const parseResumeFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post(`${API_URL}/parse-resume`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

const UploadService = {
  parseResumeFile,
};

export default UploadService;