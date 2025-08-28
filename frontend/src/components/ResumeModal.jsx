import React from 'react';

const ResumeModal = ({ resume, onClose }) => {
  if (!resume) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-2xl font-semibold">{resume.title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl font-bold">&times;</button>
        </div>
        <div className="flex-grow p-2">
          <iframe src={resume.fileUrl} title={resume.title} className="w-full h-full border-none"/>
        </div>
      </div>
    </div>
  );
};

export default ResumeModal;