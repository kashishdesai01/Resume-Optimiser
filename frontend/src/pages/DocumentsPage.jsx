// src/pages/DocumentsPage.jsx
import React, { useState, useEffect } from 'react';
import ResumeService from '../services/resume.service';
import ResumeModal from '../components/ResumeModal';

const DocumentsPage = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState(null);
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const [newResumeFile, setNewResumeFile] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = () => {
    ResumeService.getResumes().then(
      (response) => {
        setResumes(response.data);
        setLoading(false);
      },
      (error) => {
        console.log("Error fetching resumes:", error);
        setLoading(false);
      }
    );
  };

  const handleViewResume = (resumeId) => {
    ResumeService.getResumeById(resumeId).then(response => {
      setSelectedResume(response.data);
    });
  };

  const handleDeleteResume = (resumeId) => {
    // Ask for confirmation before deleting
    if (window.confirm('Are you sure you want to delete this resume?')) {
      ResumeService.deleteResume(resumeId).then(() => {
        // Refresh the list by filtering out the deleted resume
        setResumes(prevResumes => prevResumes.filter(r => r._id !== resumeId));
      }).catch(err => {
        console.error("Failed to delete resume:", err);
        alert("Could not delete the resume. Please try again.");
      });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!newResumeTitle || !newResumeFile) {
      alert('Please provide a title and select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('title', newResumeTitle);
    formData.append('file', newResumeFile);

    try {
      await ResumeService.uploadResume(formData);
      alert('Resume uploaded successfully!');
      fetchResumes(); // Refresh the list
      setNewResumeTitle('');
      setNewResumeFile(null);
    } catch (err) {
      alert('Failed to upload resume.');
    }
  };


  if (loading) {
    return <div className="text-center"><p>Loading documents...</p></div>;
  }

  return (
    <>
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Documents</h1>
          <p className="text-gray-500">Manage your saved resumes here.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Upload New Resume</h2>
          <form onSubmit={handleUpload} className="flex items-end gap-4">
            <div className="flex-grow"><label>Resume Title</label><input type="text" value={newResumeTitle} onChange={e => setNewResumeTitle(e.target.value)} className="p-2 border rounded-md w-full mt-1"/></div>
            <div className="flex-grow"><label>Resume File (.pdf, .docx)</label><input type="file" onChange={e => setNewResumeFile(e.target.files[0])} className="p-1.5 border rounded-md w-full mt-1"/></div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md">Upload</button>
          </form>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Saved Resumes</h2>
          {resumes.length > 0 ? (
            <ul className="space-y-3">
              {resumes.map((resume) => (
                <li key={resume._id} className="p-4 border rounded-md flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-lg">{resume.title}</p>
                    <p className="text-sm text-gray-500">
                      Last Updated: {new Date(resume.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button onClick={() => handleViewResume(resume._id)} className="text-sm text-blue-600 hover:underline font-semibold">
                      View
                    </button>
                    <button onClick={() => handleDeleteResume(resume._id)} className="text-sm text-red-600 hover:underline font-semibold">
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-8">You have no saved resumes. Go to the main page to upload and save one.</p>
          )}
        </div>
      </div>
      
      <ResumeModal resume={selectedResume} onClose={() => setSelectedResume(null)} />
    </>
  );
};

export default DocumentsPage;