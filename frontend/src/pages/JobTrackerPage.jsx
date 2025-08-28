import React, { useState, useEffect, useRef, useMemo } from 'react';
import toast from 'react-hot-toast';
import ApplicationService from '../services/application.service';
import ResumeService from '../services/resume.service';
import { DndContext, closestCorners } from '@dnd-kit/core';
import { Column } from '../components/Column';
import { ApplicationCard } from '../components/ApplicationCard';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal';

const ALL_STATUSES = ['Applied', 'Screening', 'Interviewing', 'Offer', 'Accepted', 'Rejected', 'Withdrawn', 'Ghosted'];
const JOB_TYPES = ['Full Time', 'Part Time', 'Contract', 'Internship'];

const JobTrackerPage = () => {
    const [applications, setApplications] = useState([]);
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isManaging, setIsManaging] = useState(false);
    const [selectedApplications, setSelectedApplications] = useState([]);
    const [columns, setColumns] = useState(
        ALL_STATUSES.map(status => ({ title: status, isVisible: ['Applied', 'Interviewing', 'Offer', 'Rejected'].includes(status) }))
    );
    const [showColumnMenu, setShowColumnMenu] = useState(false);
    const columnsMenuRef = useRef(null);
    const [deleteRequest, setDeleteRequest] = useState(null); 
    
    // Form states
    const [jobTitle, setJobTitle] = useState('');
    const [company, setCompany] = useState('');
    const [location, setLocation] = useState('');
    const [jobType, setJobType] = useState('Full Time');
    const [selectedResume, setSelectedResume] = useState('');
    
    // Filter and search states
    const [searchQuery, setSearchQuery] = useState('');
    const [appliedFromDate, setAppliedFromDate] = useState('');
    const [appliedUntilDate, setAppliedUntilDate] = useState('');
    const [selectedJobType, setSelectedJobType] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [showLikedOnly, setShowLikedOnly] = useState(false);
    const [sortBy, setSortBy] = useState('dateApplied'); // dateApplied, jobTitle, company
    const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    useEffect(() => {
        Promise.all([ApplicationService.getApplications(), ResumeService.getResumes()])
            .then(([appsResponse, resumesResponse]) => {
                setApplications(appsResponse.data);
                setResumes(resumesResponse.data);
                setLoading(false);
            }).catch(error => {
                console.error("Error fetching data:", error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (columnsMenuRef.current && !columnsMenuRef.current.contains(event.target)) {
                setShowColumnMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [columnsMenuRef]);

    const handleColumnVisibilityChange = (title) => {
        setColumns(prev => prev.map(col => col.title === title ? { ...col, isVisible: !col.isVisible } : col));
    };
    
    const handleAddApplication = (e) => {
        e.preventDefault();
        const appData = { 
            jobTitle, 
            company, 
            location, 
            jobType, 
            resume: selectedResume,
            dateApplied: new Date(),
            isLiked: false,
            isArchived: false
        };
        ApplicationService.createApplication(appData)
            .then(response => {
                const newApp = { ...response.data, resume: { title: resumes.find(r => r._id === response.data.resume)?.title }};
                setApplications(prev => [newApp, ...prev]);
                setJobTitle(''); setCompany(''); setLocation(''); setJobType('Full Time'); setSelectedResume('');
                setIsModalOpen(false);
            })
            .catch(err => alert("Failed to add application."));
    };
    
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const originalApp = applications.find(app => app._id === active.id);
        const newStatus = over.id;
        setApplications(prev => prev.map(app => app._id === active.id ? { ...app, status: newStatus } : app));
        ApplicationService.updateApplication(active.id, { status: newStatus })
            .catch(error => {
                alert("Failed to update status. Reverting change.");
                setApplications(prev => prev.map(app => app._id === active.id ? { ...app, status: originalApp.status } : app));
            });
    };
    
    const handleSelectApplication = (appId) => {
        setSelectedApplications(prev => {
            const newSelection = prev.includes(appId) 
                ? prev.filter(id => id !== appId) 
                : [...prev, appId];
            return newSelection;
        });
    };

    const handleSelectAll = () => {
        if (selectedApplications.length === filteredAndSortedApplications.length) {
            setSelectedApplications([]);
        } else {
            setSelectedApplications(filteredAndSortedApplications.map(app => app._id));
        }
    };

    // const handleDeleteSelected = () => {
    //     if (window.confirm(`Are you sure you want to delete ${selectedApplications.length} application(s)?`)) {
    //         ApplicationService.deleteManyApplications(selectedApplications).then(() => {
    //             setApplications(prev => prev.filter(app => !selectedApplications.includes(app._id)));
    //             setSelectedApplications([]);
    //             setIsManaging(false);
    //         }).catch(err => alert("Failed to delete applications."));
    //     }
    // };
    
    const handleDeleteSelected = () => {
        if (selectedApplications.length === 0) return;
        setDeleteRequest({
            ids: selectedApplications,
            message: `Are you sure you want to delete ${selectedApplications.length} selected application(s)? This action cannot be undone.`
        });
    };
    const handleToggleManageMode = () => {
        if (isManaging) {
            setSelectedApplications([]);
        }
        setIsManaging(!isManaging);
    };


    const handleToggleLike = (appId, currentIsLiked) => {
        setApplications(prev => prev.map(app => app._id === appId ? { ...app, isLiked: !currentIsLiked } : app));
        ApplicationService.updateApplication(appId, { isLiked: !currentIsLiked })
            .catch(err => {
                setApplications(prev => prev.map(app => app._id === appId ? { ...app, isLiked: currentIsLiked } : app));
            });
    };


    const clearAllFilters = () => {
        setSearchQuery('');
        setAppliedFromDate('');
        setAppliedUntilDate('');
        setSelectedJobType('');
        setSelectedStatus('');
        setShowLikedOnly(false);
        setSortBy('dateApplied');
        setSortOrder('desc');
    };

    // Filter and sort applications
    const filteredAndSortedApplications = useMemo(() => {
        let filtered = applications.filter(app => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (!app.jobTitle.toLowerCase().includes(query) && 
                    !app.company.toLowerCase().includes(query) &&
                    !(app.location && app.location.toLowerCase().includes(query))) {
                    return false;
                }
            }
            
            // Date filters
            if (appliedFromDate) {
                const appDate = new Date(app.dateApplied || app.createdAt);
                const fromDate = new Date(appliedFromDate);
                if (appDate < fromDate) return false;
            }
            
            if (appliedUntilDate) {
                const appDate = new Date(app.dateApplied || app.createdAt);
                const untilDate = new Date(appliedUntilDate);
                untilDate.setHours(23, 59, 59, 999); // End of day
                if (appDate > untilDate) return false;
            }
            
            // Job type filter
            if (selectedJobType && app.jobType !== selectedJobType) {
                return false;
            }
            
            // Status filter
            if (selectedStatus && app.status !== selectedStatus) {
                return false;
            }
            
            // Liked filter
            if (showLikedOnly && !app.isLiked) {
                return false;
            }
            
            return true;
        });

        // Sort applications
        filtered.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'jobTitle':
                    aValue = a.jobTitle.toLowerCase();
                    bValue = b.jobTitle.toLowerCase();
                    break;
                case 'company':
                    aValue = a.company.toLowerCase();
                    bValue = b.company.toLowerCase();
                    break;
                case 'dateApplied':
                default:
                    aValue = new Date(a.dateApplied || a.createdAt);
                    bValue = new Date(b.dateApplied || b.createdAt);
                    break;
            }
            
            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });
        
        return filtered;
    }, [applications, searchQuery, appliedFromDate, appliedUntilDate, selectedJobType, selectedStatus, showLikedOnly, sortBy, sortOrder]);

    // const handleDeleteSelected = () => {
    //     setItemToDelete({
    //         ids: selectedApplications,
    //         message: `Are you sure you want to delete ${selectedApplications.length} application(s)?`
    //     });
    // };

    // const confirmDelete = () => {
    //     const toastId = toast.loading('Deleting...');
    //     ApplicationService.deleteManyApplications(itemToDelete.ids)
    //         .then(() => {
    //             setApplications(prev => prev.filter(app => !itemToDelete.ids.includes(app._id)));
    //             setSelectedApplications([]);
    //             setIsManaging(false);
    //             toast.success('Application(s) deleted.', { id: toastId });
    //         })
    //         .catch(err => toast.error("Failed to delete applications.", { id: toastId }))
    //         .finally(() => setItemToDelete(null));
    // };

    const confirmDelete = () => {
        if (!deleteRequest) return;
        const toastId = toast.loading('Deleting...');
        ApplicationService.deleteManyApplications(deleteRequest.ids)
            .then(() => {
                setApplications(prev => prev.filter(app => !deleteRequest.ids.includes(app._id)));
                setSelectedApplications([]);
                setIsManaging(false);
                toast.success('Application(s) deleted.', { id: toastId });
            })
            .catch(err => toast.error("Failed to delete applications.", { id: toastId }))
            .finally(() => setDeleteRequest(null)); // Close the modal
    };

    if (loading) return <p className="text-center">Loading applications...</p>;

    const visibleColumns = columns.filter(c => c.isVisible);
    const totalJobs = applications.length;
    const filteredCount = filteredAndSortedApplications.length;

    return (
        <>
            <div className="w-full max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-gray-800">Your Job Tracker</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="font-semibold">{totalJobs} TOTAL JOBS</span>
                        </div>
                        {isManaging && (
                            <>
                                <button onClick={handleSelectAll} className="text-sm text-blue-600 font-semibold hover:underline">
                                    {selectedApplications.length === filteredAndSortedApplications.length ? 'Deselect All' : 'Select All'}
                                </button>
                                {selectedApplications.length > 0 && (
                                    <button onClick={handleDeleteSelected} className="text-sm text-red-600 font-semibold hover:underline">
                                        Delete Selected ({selectedApplications.length})
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative" ref={columnsMenuRef}>
                            <button onClick={() => setShowColumnMenu(!showColumnMenu)} className="px-4 py-2 bg-white border rounded-md font-semibold text-sm shadow-sm">Columns</button>
                            {showColumnMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 p-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        {columns.map(col => (<label key={col.title} className="flex items-center space-x-2 text-sm cursor-pointer"><input type="checkbox" checked={col.isVisible} onChange={() => handleColumnVisibilityChange(col.title)} className="rounded text-blue-600 focus:ring-blue-500"/><span>{col.title}</span></label>))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={handleToggleManageMode} className={`px-4 py-2 font-semibold text-sm rounded-md ${isManaging ? 'bg-gray-200' : 'bg-white border'}`}>{isManaging ? 'Cancel' : 'Manage Jobs'}</button>
                        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">+ Add Application</button>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                    {/* Main Filter Row - Search, Job Type, Status, Sort By */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        {/* Search - Takes 2 columns for more space */}
                        <div className="md:col-span-2">
                            <input
                                type="text"
                                placeholder="Search for roles or companies"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Job Type */}
                        <div>
                            <select
                                value={selectedJobType}
                                onChange={(e) => setSelectedJobType(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Job Type</option>
                                {JOB_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Status</option>
                                {ALL_STATUSES.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort By */}
                        <div className="flex items-center gap-2">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="flex-1 px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="dateApplied">Date Applied</option>
                                <option value="jobTitle">Job Title</option>
                                <option value="company">Company</option>
                            </select>
                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="px-2 py-2 border rounded-md text-sm hover:bg-gray-50 flex-shrink-0"
                            >
                                {sortOrder === 'asc' ? '↑' : '↓'}
                            </button>
                        </div>
                    </div>

                    {/* Advanced Filters - Only show when showAdvancedFilters is true */}
                    {showAdvancedFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mt-4 pt-4 border-t">
                            {/* Applied From */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Applied from</label>
                                <input
                                    type="date"
                                    value={appliedFromDate}
                                    onChange={(e) => setAppliedFromDate(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Applied Until */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Applied until</label>
                                <input
                                    type="date"
                                    value={appliedUntilDate}
                                    onChange={(e) => setAppliedUntilDate(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Liked Jobs Filter */}
                            <div className="flex items-end">
                                <label className="flex items-center gap-2 cursor-pointer p-2 border rounded-md w-full hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={showLikedOnly}
                                        onChange={(e) => setShowLikedOnly(e.target.checked)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Liked Jobs Only</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Bottom row - Results count, Clear, More Filters */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="text-sm text-gray-500">
                            Showing {filteredCount} of {totalJobs} applications
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={clearAllFilters}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Clear all filters
                            </button>
                            <button
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                {showAdvancedFilters ? 'Fewer Filters' : 'More Filters'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Kanban Board */}
                <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                    <div className="flex space-x-4 overflow-x-auto pb-4">
                        {visibleColumns.map(col => {
                            const appsInColumn = filteredAndSortedApplications.filter(app => app.status === col.title);
                            return (
                                <Column
                                    key={col.title}
                                    id={col.title}
                                    title={`${col.title} (${appsInColumn.length})`}
                                >
                                    {appsInColumn.map(app => (
                                        <ApplicationCard
                                            key={app._id}
                                            application={app}
                                            isManaging={isManaging}
                                            isSelected={selectedApplications.includes(app._id)}
                                            onSelect={() => handleSelectApplication(app._id)}
                                            onToggleLike={() => handleToggleLike(app._id, app.isLiked)}
                                        />
                                    ))}
                                </Column>
                            );
                        })}
                    </div>
                </DndContext>
            </div>

            {/* Add Application Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Application">
                <form onSubmit={handleAddApplication} className="space-y-4">
                    <div><label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">Position Title</label><input type="text" id="jobTitle" value={jobTitle} onChange={e => setJobTitle(e.target.value)} required className="mt-1 p-2 border rounded-md w-full" /></div>
                    <div><label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label><input type="text" id="company" value={company} onChange={e => setCompany(e.target.value)} required className="mt-1 p-2 border rounded-md w-full" /></div>
                    <div><label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label><input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} className="mt-1 p-2 border rounded-md w-full" /></div>
                    <div><label htmlFor="jobType" className="block text-sm font-medium text-gray-700">Job Type</label><select id="jobType" value={jobType} onChange={e => setJobType(e.target.value)} required className="mt-1 p-2 border rounded-md w-full"><option>Full Time</option><option>Internship</option><option>Part Time</option><option>Contract</option></select></div>
                    <div><label htmlFor="resume" className="block text-sm font-medium text-gray-700">Resume Used</label><select id="resume" value={selectedResume} onChange={e => setSelectedResume(e.target.value)} required className="mt-1 p-2 border rounded-md w-full"><option value="" disabled>-- Select a resume --</option>{resumes.map(resume => (<option key={resume._id} value={resume._id}>{resume.title}</option>))}</select></div>
                    <div className="flex justify-end pt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="mr-2 px-4 py-2 bg-gray-200 rounded-md">Cancel</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Add</button></div>
                </form>
            </Modal>

            <ConfirmationModal 
    isOpen={!!deleteRequest}  // ✅ Use deleteRequest instead of itemToDelete
    onClose={() => setDeleteRequest(null)}  // ✅ Use setDeleteRequest
    onConfirm={confirmDelete}
    title="Confirm Deletion"
    message={deleteRequest?.message}  // ✅ Use deleteRequest
/>
        </>
    );
};

export default JobTrackerPage;