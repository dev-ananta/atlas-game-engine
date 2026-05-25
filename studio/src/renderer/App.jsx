import React, { useState, useEffect } from 'react';
import Viewport3D from './components/Viewport3D';
import SceneHierarchy from './components/SceneHierarchy';
import PropertiesPanel from './components/PropertiesPanel';
import AssetBrowser from './components/AssetBrowser';
import LuaEditor from './components/LuaEditor';
import './styles/main.css';

function createEmptyScene() {
  const now = new Date().toISOString();
  return {
    metadata: {
      name: 'Main Scene',
      created: now,
      modified: now,
      description: '',
    },
    entities: [],
    assetRegistry: {
      models: [],
      textures: [],
      scripts: [],
      audio: [],
    },
  };
}

function App() {
  const [projectPath, setProjectPath] = useState(null);
  const [projectManifest, setProjectManifest] = useState({
    formatVersion: '1.1.0',
    metadata: {
      title: 'Untitled Atlas Game',
      creator: 'Unknown Creator',
      releaseDate: null,
      genre: 'Unknown',
      description: '',
      coverArt: null,
      version: '0.1.0',
      assetQualityTiers: ['Ultra', 'High', 'Medium', 'Low', 'Potato'],
      recommendedHardware: {},
      distribution: 'open',
    },
    runtime: {
      entryScene: 'scene.main',
    },
    qualityProfiles: {},
    scene: createEmptyScene(),
  });
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [activePanel, setActivePanel] = useState('properties');

  useEffect(() => {
    const interval = setInterval(() => {
      if (projectPath) {
        handleSave();
      }
    }, 300000);

    return () => clearInterval(interval);
  }, [projectPath, projectManifest]);

  const setScene = (scene) => {
    setProjectManifest((prev) => ({
      ...prev,
      scene,
    }));
  };

  const handleSave = async () => {
    if (!projectPath) return;

    const manifestToSave = {
      ...projectManifest,
      scene: {
        ...projectManifest.scene,
        metadata: {
          ...projectManifest.scene.metadata,
          modified: new Date().toISOString(),
        },
      },
    };

    const result = await window.api.saveProject(projectPath, manifestToSave);
    if (result.success) {
      setProjectManifest(manifestToSave);
      console.log('Project saved successfully');
    } else {
      console.error('Save failed:', result.error);
    }
  };

  const handleOpenProject = async () => {
    const result = await window.api.openDialog({
      properties: ['openDirectory'],
    });

    if (result.canceled || !result.filePaths?.length) {
      return;
    }

    const selectedPath = result.filePaths[0];
    const loadResult = await window.api.loadProject(selectedPath);
    if (!loadResult.success) {
      window.alert(`Load failed: ${loadResult.error}`);
      return;
    }

    setProjectPath(selectedPath);
    setProjectManifest(loadResult.data);
    setSelectedEntity(null);
  };

  const handleNewProject = async () => {
    const result = await window.api.openDialog({
      properties: ['openDirectory', 'createDirectory'],
    });

    if (result.canceled || !result.filePaths?.length) {
      return;
    }

    const name = window.prompt('Project name', 'MyAtlasGame');
    if (!name) {
      return;
    }

    const createResult = await window.api.createProject(result.filePaths[0], name);
    if (!createResult.success) {
      window.alert(`Create project failed: ${createResult.error}`);
      return;
    }

    setProjectPath(createResult.projectPath);
    setProjectManifest(createResult.manifest);
    setSelectedEntity(null);
  };

  const handleAddEntity = (entity) => {
    setScene({
      ...projectManifest.scene,
      entities: [...projectManifest.scene.entities, entity],
    });
  };

  const handleUpdateEntity = (id, updates) => {
    setScene({
      ...projectManifest.scene,
      entities: projectManifest.scene.entities.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    });
  };

  const handleDeleteEntity = (id) => {
    setScene({
      ...projectManifest.scene,
      entities: projectManifest.scene.entities.filter((e) => e.id !== id),
    });

    if (selectedEntity?.id === id) {
      setSelectedEntity(null);
    }
  };

  const handleAssetImported = (category, assetPath) => {
    const registry = projectManifest.scene.assetRegistry || { models: [], textures: [], scripts: [], audio: [] };
    const existing = registry[category] || [];
    if (existing.includes(assetPath)) {
      return;
    }

    setScene({
      ...projectManifest.scene,
      assetRegistry: {
        ...registry,
        [category]: [...existing, assetPath],
      },
    });
  };

  const scene = projectManifest.scene || createEmptyScene();

  return (
    <div className="app-container">
      <div className="toolbar">
        <button onClick={handleNewProject}>New Project</button>
        <button onClick={handleOpenProject}>Open Project</button>
        <button onClick={handleSave} disabled={!projectPath}>Save</button>
        <button onClick={() => setActivePanel('properties')}>Properties</button>
        <button onClick={() => setActivePanel('editor')}>Script Editor</button>
        <span className="toolbar-project">{projectPath ? projectPath : 'No project open'}</span>
      </div>

      <div className="main-layout">
        <div className="left-panel">
          <SceneHierarchy
            entities={scene.entities}
            selectedEntity={selectedEntity}
            onSelectEntity={setSelectedEntity}
            onDeleteEntity={handleDeleteEntity}
          />
          <AssetBrowser
            assets={scene.assetRegistry}
            projectPath={projectPath}
            onAssetImported={handleAssetImported}
          />
        </div>

        <div className="center-viewport">
          <Viewport3D
            entities={scene.entities}
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
