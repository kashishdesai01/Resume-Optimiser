// src/components/SaveResumeModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const SaveResumeModal = ({ isOpen, onClose, onSave, initialTitle = '' }) => {
    const [title, setTitle] = useState(initialTitle);

    useEffect(() => {
        if (isOpen) {
            setTitle(initialTitle);
        }
    }, [isOpen, initialTitle]);

    const handleSave = () => {
        if (!title.trim()) {
            alert('Please enter a title.');
            return;
        }
        onSave(title);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Save Your Resume">
            <div className="space-y-4">
                <div>
                    <label htmlFor="resumeTitle" className="block text-sm font-medium text-gray-700">
                        Resume Title
                    </label>
                    <input
                        type="text"
                        id="resumeTitle"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 p-2 border rounded-md w-full"
                        placeholder="e.g., Software Engineer Resume (Google)"
                    />
                </div>
                <div className="flex justify-end pt-4">
                    <button type="button" onClick={onClose} className="mr-2 px-4 py-2 bg-gray-200 rounded-md">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">
                        Save
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default SaveResumeModal;