import React, { useState, useEffect } from 'react';
import Viewport3D from './components/Viewport3D';
import SceneHierarchy from './components/SceneHierarchy';
import PropertiesPanel from './components/PropertiesPanel';
import AssetBrowser from './components/AssetBrowser';
import LuaEditor from './components/LuaEditor';
import './styles/main.css';

function App() {
  const [projectPath, setProjectPath] = useState(null);
  const [sceneData, setSceneData] = useState({
    entities: [],
    assetRegistry: {
      models: [],
      textures: [],
      scripts: [],
      audio: []
    }
  });
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [activePanel, setActivePanel] = useState('properties'); // 'properties' or 'editor'

  useEffect(() => {
    // Auto-save every 5 minutes
    const interval = setInterval(() => {
      if (projectPath) {
        handleSave();
      }
    }, 300000);

    return () => clearInterval(interval);
  }, [projectPath, sceneData]);

  const handleSave = async () => {
    if (!projectPath) return;
    
    const manifest = {
      version: "1.0.0",
      scene: {
        metadata: {
          name: "MyGame",
          created: new Date().toISOString(),
          modified: new Date().toISOString()
        },
        ...sceneData
      }
    };

    const result = await window.api.saveProject(projectPath, manifest);
    if (result.success) {
      console.log('Project saved successfully');
    } else {
      console.error('Save failed:', result.error);
    }
  };

  const handleLoad = async (path) => {
    const result = await window.api.loadProject(path);
    if (result.success) {
      setSceneData(result.data.scene);
      setProjectPath(path);
    } else {
      console.error('Load failed:', result.error);
    }
  };

  const handleAddEntity = (entity) => {
    setSceneData(prev => ({
      ...prev,
      entities: [...prev.entities, entity]
    }));
  };

  const handleUpdateEntity = (id, updates) => {
    setSceneData(prev => ({
      ...prev,
      entities: prev.entities.map(e => 
        e.id === id ? { ...e, ...updates } : e
      )
    }));
  };

  const handleDeleteEntity = (id) => {
    setSceneData(prev => ({
      ...prev,
      entities: prev.entities.filter(e => e.id !== id)
    }));
    if (selectedEntity?.id === id) {
      setSelectedEntity(null);
    }
  };

  return (
    <div className="app-container">
      <div className="toolbar">
        <button onClick={handleSave}>Save</button>
        <button onClick={() => setActivePanel('properties')}>Properties</button>
        <button onClick={() => setActivePanel('editor')}>Script Editor</button>
      </div>
      
      <div className="main-layout">
        <div className="left-panel">
          <SceneHierarchy 
            entities={sceneData.entities}
            selectedEntity={selectedEntity}
            onSelectEntity={setSelectedEntity}
            onDeleteEntity={handleDeleteEntity}
          />
          <AssetBrowser 
            assets={sceneData.assetRegistry}
            projectPath={projectPath}
          />
        </div>
        
        <div className="center-viewport">
          <Viewport3D 
            entities={sceneData.entities}
            selectedEntity={selectedEntity}
            onSelectEntity={setSelectedEntity}
            onAddEntity={handleAddEntity}
            onUpdateEntity={handleUpdateEntity}
          />
        </div>
        
        <div className="right-panel">
          {activePanel === 'properties' ? (
            <PropertiesPanel 
              entity={selectedEntity}
              onUpdate={handleUpdateEntity}
            />
          ) : (
            <LuaEditor 
              entity={selectedEntity}
              onUpdate={handleUpdateEntity}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;