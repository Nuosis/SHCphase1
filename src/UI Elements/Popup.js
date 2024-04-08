import React from 'react';

const Popup = ({ message, onClose }) => {
    return (
        <div className="modal-box" style={{ zIndex: 40 }}>
            <p>{message}</p>
            <div className="modal-action">
                <button className="btn" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default Popup;
