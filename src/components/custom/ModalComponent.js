import React, { useState, useEffect } from 'react';
import './ModelComponent.css'
const ModalComponent = ({ modalData, onClose, onSave }) => {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (modalData) {
      setInputValue(modalData.content);
    }
  }, [modalData]);

  const handleSave = () => {
    onSave(modalData.id, inputValue);
    onClose();
  };

  if (!modalData) return null; // No modal if no data

  return (
    <div className="modal">
      <div className="modal-content">
        <h4>Enter Data for Paragraph</h4>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ModalComponent;
