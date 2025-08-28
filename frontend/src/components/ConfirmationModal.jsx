import React from 'react';
import Modal from './Modal';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-gray-600">{message}</p>
        <div className="flex justify-end pt-4 gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700">
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  );
};
export default ConfirmationModal;