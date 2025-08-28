import React from 'react';
import { Link } from 'react-router-dom';

const LoginPrompt = () => {
  return (
    <div className="w-full max-w-2xl text-center bg-white p-10 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Save Your Progress</h2>
      <p className="text-gray-600 text-lg mb-6">
        Want to save your resumes and track your optimization scores? Create an account or log in to access your personal dashboard.
      </p>
      <div className="flex justify-center items-center gap-4">
        <Link to="/login" className="px-8 py-3 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 border">
          Login
        </Link>
        <Link to="/register" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
          Create an Account
        </Link>
      </div>
    </div>
  );
};

export default LoginPrompt;