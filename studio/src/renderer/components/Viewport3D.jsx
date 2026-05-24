import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';

function Viewport3D({ entities, selectedEntity, onSelectEntity, onAddEntity, onUpdateEntity }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const objectsRef = useRef({});

  useEffect(() => {
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2a2a2a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20);
    scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Camera controls (simple orbit)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        const radius = camera.position.length();
        const theta = Math.atan2(camera.position.x, camera.position.z);
        const phi = Math.acos(camera.position.y / radius);

        const newTheta = theta - deltaX * 0.01;
        const newPhi = Math.max(0.1, Math.min(Math.PI - 0.1, phi - deltaY * 0.01));

        camera.position.x = radius * Math.sin(newPhi) * Math.sin(newTheta);
        camera.position.y = radius * Math.cos(newPhi);
        camera.position.z = radius * Math.sin(newPhi) * Math.cos(newTheta);
        camera.lookAt(0, 0, 0);

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Update scene when entities change
  useEffect(() => {
    if (!sceneRef.current) return;

    // Remove old objects
    Object.keys(objectsRef.current).forEach(id => {
      if (!entities.find(e => e.id === id)) {
        sceneRef.current.remove(objectsRef.current[id]);
        delete objectsRef.current[id];
      }
    });

    // Add/update objects
    entities.forEach(entity => {
      if (!objectsRef.current[entity.id]) {
        // Create new object
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x007acc });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData.entityId = entity.id;
        objectsRef.current[entity.id] = mesh;
        sceneRef.current.add(mesh);
      }

      // Update transform
      const obj = objectsRef.current[entity.id];
      if (entity.transform) {
        obj.position.set(...entity.transform.position);
        obj.rotation.set(...entity.transform.rotation);
        obj.scale.set(...entity.transform.scale);
      }

      // Highlight selected
      obj.material.color.set(
        selectedEntity?.id === entity.id ? 0xffaa00 : 0x007acc
      );
    });
  }, [entities, selectedEntity]);

  const handleAddCube = () => {
    const newEntity = {
      id: uuidv4(),
      name: `Cube_${entities.length + 1}`,
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      },
      components: {
        mesh: 'primitive:cube',
        material: null,
        scripts: [],
        physics: null
      },
      children: []
    };
    onAddEntity(newEntity);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      <div style={{ position: 'absolute', top: 10, left: 10 }}>
        <button onClick={handleAddCube}>Add Cube</button>
      </div>
    </div>
  );
}

export default Viewport3D;