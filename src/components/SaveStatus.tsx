import React from 'react';

interface SaveStatusProps {
  lastSaved: Date | null;
  saving: boolean;
}

const SaveStatus: React.FC<SaveStatusProps> = ({ lastSaved, saving }) => {
  return (
    <div className={`save-status ${saving ? 'saving' : lastSaved ? 'saved' : ''}`}>
      {saving ? (
        <span className="saving-text">
          <span className="save-icon">⟳</span> Saving...
        </span>
      ) : lastSaved ? (
        <span className="saved-text">
          <span className="save-icon">✓</span> Saved at {lastSaved.toLocaleTimeString()}
        </span>
      ) : (
        <span className="no-save">Not saved yet</span>
      )}
    </div>
  );
};

export default SaveStatus;
