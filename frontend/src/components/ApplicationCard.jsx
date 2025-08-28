import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';

const getStatusColor = (status) => {
    switch (status) {
        case 'Applied': return 'border-blue-500';
        case 'Screening': return 'border-indigo-500';
        case 'Interviewing': return 'border-purple-500';
        case 'Offer': return 'border-teal-500';
        case 'Accepted': return 'border-green-500';
        case 'Rejected': return 'border-red-500';
        case 'Withdrawn': return 'border-gray-500';
        case 'Ghosted': return 'border-gray-400';
        default: return 'border-gray-300';
    }
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
};

export const ApplicationCard = ({ application, isManaging, isSelected, onSelect, onToggleLike }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: application._id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  // Handle checkbox click
  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    onSelect();
  };

  // Handle like button click
  const handleLikeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleLike();
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isManaging ? {} : { ...attributes, ...listeners })}
      className={`bg-white rounded-md shadow-sm border-l-4 ${getStatusColor(application.status)} transition relative ${isSelected ? 'ring-2 ring-offset-1 ring-blue-500' : 'hover:shadow-md'}`}
    >
      {/* Management checkbox */}
      {isManaging && (
        <div className="absolute top-2 right-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
          />
        </div>
      )}

      {/* Like button - always visible */}
      {!isManaging && (
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={handleLikeClick}
            className={`p-1 rounded-full transition-colors ${
              application.isLiked 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-400 hover:text-red-500'
            }`}
            title={application.isLiked ? 'Remove from liked' : 'Add to liked'}
          >
            {application.isLiked ? '❤️' : '🤍'}
          </button>
        </div>
      )}

      <Link to={`/dashboard/tracker/${application._id}`} className="block p-4">
        <div className={`${isManaging || !isManaging ? 'pr-8' : ''}`}>
          <h3 className="font-semibold text-gray-900 mb-1">{application.jobTitle}</h3>
          <p className="text-sm text-gray-600 mb-1">{application.company}</p>
          
          {application.location && (
            <p className="text-xs text-gray-500 mb-2">{application.location}</p>
          )}
          
          <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
            <span>Applied with: {application.resume?.title || 'N/A'}</span>
          </div>
          
          {/* Application date */}
          <div className="text-xs text-gray-400 mt-1">
            Applied: {formatDate(application.dateApplied || application.createdAt)}
          </div>
          
          {/* Job type badge */}
          <div className="mt-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              application.jobType === 'Full Time' ? 'bg-green-100 text-green-800' :
              application.jobType === 'Part Time' ? 'bg-blue-100 text-blue-800' :
              application.jobType === 'Contract' ? 'bg-yellow-100 text-yellow-800' :
              application.jobType === 'Internship' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {application.jobType}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};