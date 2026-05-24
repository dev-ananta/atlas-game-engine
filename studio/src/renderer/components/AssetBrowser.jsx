import React from 'react';

function AssetBrowser({ assets, projectPath }) {
  const handleImport = async () => {
    // This would trigger a file dialog in a real implementation
    console.log('Import asset clicked');
  };

  return (
    <div className="asset-browser panel">
      <div className="panel-header">
        Assets
        <button onClick={handleImport} className="import-btn">+</button>
      </div>
      <div className="panel-content">
        <div className="asset-category">
          <h4>Models ({assets.models?.length || 0})</h4>
          <ul className="asset-list">
            {assets.models?.map((model, idx) => (
              <li key={idx} className="asset-item">
                <span className="asset-icon">🎲</span>
                <span>{model}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="asset-category">
          <h4>Textures ({assets.textures?.length || 0})</h4>
          <ul className="asset-list">
            {assets.textures?.map((texture, idx) => (
              <li key={idx} className="asset-item">
                <span className="asset-icon">🖼️</span>
                <span>{texture}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="asset-category">
          <h4>Scripts ({assets.scripts?.length || 0})</h4>
          <ul className="asset-list">
            {assets.scripts?.map((script, idx) => (
              <li key={idx} className="asset-item">
                <span className="asset-icon">📜</span>
                <span>{script}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="asset-category">
          <h4>Audio ({assets.audio?.length || 0})</h4>
          <ul className="asset-list">
            {assets.audio?.map((audio, idx) => (
              <li key={idx} className="asset-item">
                <span className="asset-icon">🔊</span>
                <span>{audio}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AssetBrowser;