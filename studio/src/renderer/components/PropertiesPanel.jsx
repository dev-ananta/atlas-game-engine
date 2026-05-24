import React, { useState, useEffect } from 'react';

function PropertiesPanel({ entity, onUpdate }) {
  const [localEntity, setLocalEntity] = useState(entity);

  useEffect(() => {
    setLocalEntity(entity);
  }, [entity]);

  if (!entity) {
    return (
      <div className="properties-panel panel">
        <div className="panel-header">Properties</div>
        <div className="panel-content">
          <div className="empty-state">Select an object to view properties</div>
        </div>
      </div>
    );
  }

  const handleTransformChange = (axis, value, type) => {
    const newTransform = { ...localEntity.transform };
    newTransform[type][axis] = parseFloat(value);
    const updated = { ...localEntity, transform: newTransform };
    setLocalEntity(updated);
    onUpdate(entity.id, updated);
  };

  const handleNameChange = (name) => {
    const updated = { ...localEntity, name };
    setLocalEntity(updated);
    onUpdate(entity.id, updated);
  };

  return (
    <div className="properties-panel panel">
      <div className="panel-header">Properties</div>
      <div className="panel-content">
        <div className="property-section">
          <label>Name</label>
          <input 
            type="text" 
            value={localEntity.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </div>

        <div className="property-section">
          <h3>Transform</h3>
          
          <label>Position</label>
          <div className="vector-input">
            <input 
              type="number" 
              step="0.1"
              value={localEntity.transform.position[0]}
              onChange={(e) => handleTransformChange(0, e.target.value, 'position')}
              placeholder="X"
            />
            <input 
              type="number" 
              step="0.1"
              value={localEntity.transform.position[1]}
              onChange={(e) => handleTransformChange(1, e.target.value, 'position')}
              placeholder="Y"
            />
            <input 
              type="number" 
              step="0.1"
              value={localEntity.transform.position[2]}
              onChange={(e) => handleTransformChange(2, e.target.value, 'position')}
              placeholder="Z"
            />
          </div>

          <label>Rotation</label>
          <div className="vector-input">
            <input 
              type="number" 
              step="0.1"
              value={localEntity.transform.rotation[0]}
              onChange={(e) => handleTransformChange(0, e.target.value, 'rotation')}
              placeholder="X"
            />
            <input 
              type="number" 
              step="0.1"
              value={localEntity.transform.rotation[1]}
              onChange={(e) => handleTransformChange(1, e.target.value, 'rotation')}
              placeholder="Y"
            />
            <input 
              type="number" 
              step="0.1"
              value={localEntity.transform.rotation[2]}
              onChange={(e) => handleTransformChange(2, e.target.value, 'rotation')}
              placeholder="Z"
            />
          </div>

          <label>Scale</label>
          <div className="vector-input">
            <input 
              type="number" 
              step="0.1"
              value={localEntity.transform.scale[0]}
              onChange={(e) => handleTransformChange(0, e.target.value, 'scale')}
              placeholder="X"
            />
            <input 
              type="number" 
              step="0.1"
              value={localEntity.transform.scale[1]}
              onChange={(e) => handleTransformChange(1, e.target.value, 'scale')}
              placeholder="Y"
            />
            <input 
              type="number" 
              step="0.1"
              value={localEntity.transform.scale[2]}
              onChange={(e) => handleTransformChange(2, e.target.value, 'scale')}
              placeholder="Z"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertiesPanel;