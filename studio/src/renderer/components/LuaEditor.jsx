import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

function LuaEditor({ entity, onUpdate }) {
  const [code, setCode] = useState('-- Lua script\n\nfunction Start()\n    -- Called when the game starts\nend\n\nfunction Update(deltaTime)\n    -- Called every frame\nend');

  useEffect(() => {
    if (entity?.components?.scripts && entity.components.scripts.length > 0) {
      // In a real implementation, load the actual script content
      setCode('-- Script for ' + entity.name);
    }
  }, [entity]);

  if (!entity) {
    return (
      <div className="lua-editor panel">
        <div className="panel-header">Script Editor</div>
        <div className="panel-content">
          <div className="empty-state">Select an object to edit scripts</div>
        </div>
      </div>
    );
  }

  const handleEditorChange = (value) => {
    setCode(value);
    // Save script to entity
  };

  return (
    <div className="lua-editor panel">
      <div className="panel-header">
        Script Editor - {entity.name}
      </div>
      <div className="panel-content" style={{ padding: 0, height: 'calc(100% - 40px)' }}>
        <Editor
          height="100%"
          defaultLanguage="lua"
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true
          }}
        />
      </div>
      <div style={{ padding: '10px', background: '#252526', borderTop: '1px solid #3c3c3c' }}>
        <button>Save Script</button>
        <button style={{ marginLeft: '10px' }}>API Reference</button>
      </div>
    </div>
  );
}

export default LuaEditor;