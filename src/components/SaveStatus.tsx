import React from 'react';

interface SaveStatusProps {
  lastSaved: Date | null;
  saving: boolean;
}

const SaveStatus: React.FC<SaveStatusProps> = ({ lastSaved, saving }) => {
  return (
    <div className="save-status">
      {saving ? (
        <span className="saving">Saving...</span>
      ) : lastSaved ? (
        <span className="saved">
          Last saved: {lastSaved.toLocaleTimeString()}
        </span>
      ) : null}
    </div>
  );
};

export default SaveStatus;
