import React from 'react';

function SceneHierarchy({ entities, selectedEntity, onSelectEntity, onDeleteEntity }) {
  return (
    <div className="scene-hierarchy panel">
      <div className="panel-header">Scene Hierarchy</div>
      <div className="panel-content">
        {entities.length === 0 ? (
          <div className="empty-state">No objects in scene</div>
        ) : (
          <ul className="entity-list">
            {entities.map(entity => (
              <li 
                key={entity.id}
                className={`entity-item ${selectedEntity?.id === entity.id ? 'selected' : ''}`}
                onClick={() => onSelectEntity(entity)}
              >
                <span className="entity-icon">📦</span>
                <span className="entity-name">{entity.name}</span>
                <button 
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEntity(entity.id);
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SceneHierarchy;