
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AnalyzeService from '../services/analyze.service';
import AuthService from '../services/auth.service';
import ResumeService from '../services/resume.service';
import GenerateService from '../services/generate.service';

const HomePage = () => {
    const [resumeText, setResumeText] = useState('');
    const [jobDescriptionText, setJobDescriptionText] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(undefined);
    const [savedResumes, setSavedResumes] = useState([]);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizationSuggestions, setOptimizationSuggestions] = useState(null);
    const [isOptimizeModalOpen, setIsOptimizeModalOpen] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);

    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (user) {
            setCurrentUser(user);
            ResumeService.getResumes().then(res => setSavedResumes(res.data));
        }
    }, []);

    const handleSelectResume = (e) => {
        const resumeId = e.target.value;
        if (!resumeId) {
            setResumeText('');
            setResumeFile(null);
            return;
        }
        const selectedResume = savedResumes.find(r => r._id === resumeId);
        if (selectedResume) {
            setResumeText(selectedResume.content);
            setResumeFile(null); // Clear file when selecting saved text
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsLoading(true);
        setError('');
        try {
            const response = await ResumeService.parseResumeFile(file);
            if (response.data.text) {
                setResumeText(response.data.text);
                setResumeFile(file); // Track the file for saving
            } else {
                setError(response.data.error || "Failed to parse file.");
            }
        } catch (err) {
            setError("Failed to upload and parse file.");
        }
        setIsLoading(false);
    };

    const handleSaveResume = async () => {
        if (!currentUser) {
            if (window.confirm("Please log in or sign up to save your resumes.")) {
                navigate('/login');
            }
            return;
        }

        const title = prompt(
            "Enter a title for this resume:",
            resumeFile ? resumeFile.name.replace(/\.[^/.]+$/, "") : "Pasted Resume"
        );
        if (!title) return;

        try {
            if (resumeFile) {
                const formData = new FormData();
                formData.append('title', title);
                formData.append('file', resumeFile);
                await ResumeService.uploadAndSaveResumeFile(formData);
            } else {
                if (!resumeText) {
                    alert("Please paste or upload a resume before saving.");
                    return;
                }
                await ResumeService.saveResumeText(title, resumeText);
            }
            alert("Resume saved successfully!");
            setResumeFile(null);
            ResumeService.getResumes().then(res => setSavedResumes(res.data));
        } catch (err) {
            alert("Failed to save resume.");
        }
    };

    const handleAnalyze = async () => {
        if (!resumeText || !jobDescriptionText) {
            setError('Please provide both resume and job description text.');
            return;
        }
        setIsLoading(true);
        setError('');
        setAnalysis(null);
        try {
            const response = await AnalyzeService.analyzePublic(resumeText, jobDescriptionText);
            setAnalysis(response.data);
        } catch (err) {
            setError('An error occurred during analysis.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptimizeResume = async () => {
        if (!resumeText || !jobDescriptionText) {
            alert("Please provide a resume and job description first.");
            return;
        }
        setIsOptimizing(true);
        try {
            const response = await GenerateService.getOptimizationSuggestions(resumeText, jobDescriptionText);
            setOptimizationSuggestions(response.data);
            setIsOptimizeModalOpen(true);
        } catch (err) {
            alert("Failed to get optimization suggestions.");
        } finally {
            setIsOptimizing(false);
        }
    };
    
    const renderAnalysisContent = (key, value) => {
        const formatKey = (str) => str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          return (
            <div className="space-y-3">
              <h4 className="font-bold text-lg text-indigo-800 border-b-2 border-indigo-100 pb-2">
                {formatKey(key)}
              </h4>
              <div className="grid gap-3 pl-4">
                {Object.entries(value).map(([subKey, subValue]) => (
                  <div key={subKey} className="flex flex-col sm:flex-row sm:items-start gap-2">
                    <span className="font-semibold text-gray-700 min-w-fit">
                      {formatKey(subKey)}:
                    </span>
                    <span className="text-gray-600 flex-1">
                      {Array.isArray(subValue) ? (
                        <ul className="list-disc list-inside space-y-1">
                          {subValue.map((item, idx) => (
                            <li key={idx} className="text-sm">{typeof item === 'object' ? JSON.stringify(item) : item}</li>
                          ))}
                        </ul>
                      ) : (
                        String(subValue)
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        
        if (Array.isArray(value)) {
            if (key === 'better_bullet_points' || key === 'bullet_point_enhancements') {
                 return (
                    <div className="space-y-3">
                        <h4 className="font-bold text-lg text-indigo-800 border-b-2 border-indigo-100 pb-2">{formatKey(key)}</h4>
                        <div className="space-y-4">
                            {value.map((item, index) => (
                                <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                                    <p className="text-xs text-gray-500 mb-2 font-semibold">{item.section}</p>
                                    <p className="text-xs text-red-600 mb-2 line-through">{item.current || item.original_bullet}</p>
                                    <p className="text-xs text-green-700">{item.improved || item.improved_bullet}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }
          return (
            <div className="space-y-3">
              <h4 className="font-bold text-lg text-indigo-800 border-b-2 border-indigo-100 pb-2">
                {formatKey(key)}
              </h4>
              <ul className="list-disc list-inside space-y-1 pl-4">
                {value.map((item, idx) => (
                  <li key={idx} className="text-gray-600 text-sm">{item}</li>
                ))}
              </ul>
            </div>
          );
        }
        
        return (
          <div className="space-y-3">
            <h4 className="font-bold text-lg text-indigo-800 border-b-2 border-indigo-100 pb-2">
              {formatKey(key)}
            </h4>
            <p className="text-gray-600 pl-4">{String(value)}</p>
          </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="w-full max-w-7xl mx-auto px-6 py-12">
                <header className="text-center mb-16">
                    <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                        AI Resume Optimizer
                    </h1>
                    <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Transform your resume with AI-powered analysis. Get instant feedback, optimization suggestions, and increase your interview chances.
                    </p>
                </header>

                {currentUser && (
                    <div className="mb-12 p-6 bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="flex-1 max-w-md">
                                <label htmlFor="saved-resumes" className="block text-sm font-semibold text-gray-700 mb-2">
                                    📁 Select from saved resumes
                                </label>
                                <select id="saved-resumes" onChange={handleSelectResume} className="w-full p-3 rounded-xl border border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                                    <option value="">-- Choose a resume --</option>
                                    {savedResumes.map(resume => (<option key={resume._id} value={resume._id}>{resume.title}</option>))}
                                </select>
                            </div>
                            <button onClick={handleSaveResume} className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:from-emerald-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200">
                                💾 Save Current Resume
                            </button>
                        </div>
                    </div>
                )}

<div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
  {/* Resume Box */}
  <div className="xl:col-span-1">
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden h-[600px] flex flex-col">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">📄 Your Resume</h2>
            <p className="text-blue-100 text-sm mt-1">Upload or paste your resume content</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.docx"
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm"
          >
            📎 Upload File
          </button>
        </div>
      </div>
      <div className="p-6 flex-1 overflow-y-auto">
        <textarea
          rows="16"
          value={resumeText}
          onChange={(e) => { setResumeText(e.target.value); setResumeFile(null); }}
          placeholder="Paste your resume content here..."
          className="w-full h-full p-4 border border-gray-200 rounded-xl shadow-sm resize-none text-sm"
        />
      </div>
    </div>
  </div>

  {/* Job Description Box */}
  <div className="xl:col-span-1">
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden h-[600px] flex flex-col">
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
        <h2 className="text-xl font-bold text-white">🎯 Job Description</h2>
        <p className="text-purple-100 text-sm mt-1">Copy the target job posting here</p>
      </div>
      <div className="p-6 flex-1 overflow-y-auto">
        <textarea
          rows="16"
          value={jobDescriptionText}
          onChange={(e) => setJobDescriptionText(e.target.value)}
          placeholder="Paste the job description you're targeting..."
          className="w-full h-full p-4 border border-gray-200 rounded-xl shadow-sm resize-none text-sm"
        />
      </div>
    </div>
  </div>

  {/* Analysis Results Box */}
  <div className="xl:col-span-1">
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden h-[600px] flex flex-col">
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6">
        <h2 className="text-xl font-bold text-white">📊 Analysis Results</h2>
        <p className="text-indigo-100 text-sm mt-1">Your personalized insights</p>
      </div>
      <div className="p-6 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <span className="text-gray-600 font-medium">Analyzing...</span>
          </div>
        ) : analysis && !analysis.error ? (
          <div className="space-y-6">
            {Object.entries(analysis).map(([key, value]) => (
              <div key={key}>{renderAnalysisContent(key, value)}</div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
            {error ? (
              <>
                <div className="text-4xl">⚠️</div>
                <span className="text-red-500 text-center">{error}</span>
              </>
            ) : (
              <>
                <div className="text-4xl">🚀</div>
                <span className="text-center">Your analysis will appear here.</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
</div>


                <div className="text-center space-y-4">
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <button onClick={handleAnalyze} disabled={isLoading || isOptimizing} className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 transform hover:scale-105 disabled:scale-100 transition-all duration-200">
                            <span>{isLoading ? 'Analyzing...' : '🔍 Analyze Match'}</span>
                        </button>
                        {currentUser && (
                            <button onClick={handleOptimizeResume} disabled={isLoading || isOptimizing} className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 transform hover:scale-105 disabled:scale-100 transition-all duration-200">
                                <span>{isOptimizing ? 'Optimizing...' : '🚀 Optimize Resume'}</span>
                            </button>
                        )}
                    </div>
                </div>

                {isOptimizeModalOpen && optimizationSuggestions && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                            <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-2xl">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">🚀 Resume Optimization</h3>
                                        <p className="text-purple-100 mt-1">Actionable insights to boost your interview chances</p>
                                    </div>
                                    <button onClick={() => setIsOptimizeModalOpen(false)} className="text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 overflow-y-auto flex-1 space-y-8">
                                {optimizationSuggestions.priority_actions && (
                                    <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border border-red-100">
                                        <h4 className="text-xl font-bold text-red-800 mb-4">🎯 Priority Actions</h4>
                                        <div className="space-y-3">
                                            {optimizationSuggestions.priority_actions.map((item, index) => (<div key={index} className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg"><span className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">{index + 1}</span><p className="text-red-800 font-medium">{item}</p></div>))}
                                        </div>
                                    </div>
                                )}
                                {optimizationSuggestions.content_improvements?.bullet_point_enhancements && (
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                                        <h4 className="text-xl font-bold text-green-800 mb-4">✏️ Bullet Point Enhancements</h4>
                                        <div className="space-y-4">
                                            {optimizationSuggestions.content_improvements.bullet_point_enhancements.map((item, index) => (<div key={index} className="bg-white rounded-lg p-4 shadow-sm"><div className="text-sm font-semibold text-gray-500 mb-2"><span className="bg-gray-100 px-2 py-1 rounded-full">{item.section}</span></div><div className="space-y-3"><div className="p-3 bg-red-50 border-l-4 border-red-400 rounded"><p className="text-sm text-red-700"><strong>Before:</strong> {item.original_bullet}</p></div><div className="p-3 bg-green-50 border-l-4 border-green-400 rounded"><p className="text-sm text-green-700"><strong>After:</strong> {item.improved_bullet}</p></div><div className="p-3 bg-blue-50 rounded"><p className="text-xs text-blue-600"><strong>Why this works:</strong> {item.improvement_rationale}</p></div></div></div>))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;
