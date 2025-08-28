import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ApplicationService from '../services/application.service';
import ResumeService from '../services/resume.service';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';

const StatusIcon = () => (
    <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
    </span>
);

const ApplicationDetailPage = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State for delete modal


    const statuses = ['Applied', 'Screening', 'Interviewing', 'Offer', 'Withdrawn', 'Ghosted', 'Rejected', 'Accepted'];

    useEffect(() => {
        ApplicationService.getApplicationById(applicationId).then(res => {
            setApplication(res.data);
            setFormData(res.data);
        });
        ResumeService.getResumes().then(res => setResumes(res.data));
    }, [applicationId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'resume') {
            setFormData({ ...formData, [name]: { _id: value, title: resumes.find(r => r._id === value)?.title } });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        const dataToUpdate = { ...formData, resume: formData.resume._id };
        ApplicationService.updateApplication(applicationId, dataToUpdate).then(res => {
            setApplication(res.data);
            setIsEditModalOpen(false);
        });
    };

    const confirmDelete = () => {
        setIsDeleteModalOpen(false);
        const toastId = toast.loading('Deleting application...');
        ApplicationService.deleteApplication(applicationId)
            .then(() => {
                toast.success('Application deleted.', { id: toastId });
                navigate('/dashboard/tracker');
            })
            .catch(err => {
                toast.error('Could not delete the application.', { id: toastId });
            });
    };


    if (!application) return <div className="text-center">Loading...</div>;

    return (
        <>
            <div className="w-full max-w-7xl mx-auto">
                {/* --- HEADER --- */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">{application.jobTitle}</h1>
                        <p className="text-xl text-gray-500">{application.company}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsEditModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Edit</button>
                        <button onClick={setIsDeleteModalOpen} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700">Delete</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-lg space-y-8">
                         <div>
                            <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Job Description</h2>
                            <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">{application.jobDescription || 'No description added.'}</div>
                        </div>
                         <div>
                            <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Notes</h2>
                             <p className="text-gray-600 whitespace-pre-wrap">{application.notes || 'No notes added yet.'}</p>
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">Details</h2>
                            <div className="space-y-3 text-sm">
                                <p><strong>Status:</strong> <span className="font-medium text-blue-700">{application.status}</span></p>
                                <p><strong>Location:</strong> {application.location || 'N/A'}</p>
                                <p><strong>Job Type:</strong> {application.jobType}</p>
                                <p><strong>Resume Used:</strong> <Link to="/dashboard/documents" className="text-blue-600 hover:underline">{application.resume?.title}</Link></p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">History</h2>
                            <ol className="relative border-l border-gray-200">
                                {application.statusHistory.slice().reverse().map((event, index) => (
                                <li key={event._id || index} className="mb-6 ml-6">
                                    <StatusIcon />
                                    <h3 className="flex items-center mb-1 text-md font-semibold text-gray-900">{event.status}</h3>
                                    <time className="block mb-2 text-sm font-normal leading-none text-gray-400">{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                                </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Application">
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Section 1: Job Details */}
                    <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">Job Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">Position Title</label>
                                <input type="text" name="jobTitle" value={formData.jobTitle || ''} onChange={handleInputChange} className="mt-1 p-2 border rounded-md w-full" />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
                                <input type="text" name="company" value={formData.company || ''} onChange={handleInputChange} className="mt-1 p-2 border rounded-md w-full" />
                            </div>
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                                <input type="text" name="location" value={formData.location || ''} onChange={handleInputChange} className="mt-1 p-2 border rounded-md w-full" />
                            </div>
                            <div>
                                <label htmlFor="jobType" className="block text-sm font-medium text-gray-700">Job Type</label>
                                <select name="jobType" value={formData.jobType} onChange={handleInputChange} className="mt-1 p-2 border rounded-md w-full">{['Full Time', 'Internship', 'Part Time', 'Contract'].map(s=><option key={s}>{s}</option>)}</select>
                            </div>
                        </div>
                    </div>
                    
                    {/* Section 2: Status and Documents */}
                    <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">Status & Documents</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                                <select name="status" value={formData.status} onChange={handleInputChange} className="mt-1 p-2 border rounded-md w-full">{statuses.map(s => <option key={s}>{s}</option>)}</select>
                            </div>
                            <div>
                                <label htmlFor="resume" className="block text-sm font-medium text-gray-700">Resume Used</label>
                                <select name="resume" value={formData.resume?._id} onChange={handleInputChange} className="mt-1 p-2 border rounded-md w-full">
                                    {resumes.map(r => <option key={r._id} value={r._id}>{r.title}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                     <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                        <textarea name="notes" value={formData.notes || ''} onChange={handleInputChange} rows="4" className="w-full mt-1 p-2 border rounded"/>
                    </div>

                    <div className="flex justify-end pt-4 border-t mt-6">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">Save Changes</button>
                    </div>
                </form>
            </Modal>
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this application? This action cannot be undone."
            />
        </>
    );
};

export default ApplicationDetailPage;