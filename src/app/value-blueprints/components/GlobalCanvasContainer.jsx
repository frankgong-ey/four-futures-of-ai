"use client";

import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, OrthographicCamera } from "@react-three/drei";
import { useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom, DepthOfField, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { LABEL_DATA } from "./MeshLabels";

// Stage configuration (using actual vh values) - moved to top of file for use by all components
const STAGES = {
  INITIAL_ANIMATION: 100,       // Initial animation stage (0-100vh): 10 boxes gather
  PHASE1_TOP_VIEW: 300,        // Phase 1: Top view (100-300vh)
  TRANSITION_START: 300,        // Transition stage start (300vh)
  TRANSITION_END: 400,          // Transition stage end (400vh)
  PHASE2_SPACING_EXPAND_END: 600, // Phase 2: Layer spacing expansion period (400-600vh)
  PHASE3_LOOKAT_DOWN_END: 800, // Phase 3 end (600-800vh)
  PHASE4_START: 600,           // Phase 4 start: Layer-by-layer focus (600vh+)
  PHASE5_X_OFFSET_START: 1500,  // Phase 5 start: X-axis offset (1500vh+)
  // Phase 4: Layer-by-layer focus (600-1500vh)
  // Phase 5: X-axis offset -100 (1500vh+)
};

// Layer default y position configuration
const layerDefaultPositions = {
  layer1: 0,
  layer2: 0.2,
  layer3: 0.4,
  layer4: 0.6,
  layer5: 0.8,
  layer6: 1.0,
  layer7: 1.2,
};

// GLB model component
function ValueBlueprintModel({ scrollProgress, activeSection }) {
  const { scene } = useGLTF('/models/value-blueprint5.glb', true); // true = use preload cache
  const meshRefs = useRef({});
  const originalPositions = useRef({});
  const layer1GroupRef = useRef(null);
  const layer2GroupRef = useRef(null);
  const layer3GroupRef = useRef(null);
  const layer4GroupRef = useRef(null);
  const layer5GroupRef = useRef(null);
  const layer6GroupRef = useRef(null);
  const layer7GroupRef = useRef(null);
  const aeGroupRef = useRef(null); // Agentic Enterprise group reference
  const blockGroupRef = useRef(null); // Block group reference (contains Cube247 meshes)
  const labelMeshRefs = useRef({}); // Store label-related mesh references
  const blockInstancedMeshRef = useRef(null); // Block InstancedMesh reference
  const blockInstanceDataRef = useRef(null); // Block instance data (geometry, materials, etc.)
  const [blockInstanceReady, setBlockInstanceReady] = useState(false); // Flag indicating if instance data is ready
  const linesGeometryRef = useRef(null); // Line segment geometry reference (for dynamic updates)
  const linesMaterialRef = useRef(null); // Line segment material reference
  const linePointsXZRef = useRef(null); // Store line segment XZ coordinates (fixed)
  const lineSegmentsRef = useRef(null); // Line segment render reference
  // No longer need to record animation state, use current vh value to achieve reversible animation
  const instanceBaseMatricesRef = useRef([]); // Store base matrix for each instance (includes position and mirror transformation)
  
  // Optimization: reuse objects to avoid creating new objects in useFrame
  const tempVector3Ref = useRef(new THREE.Vector3());
  const tempQuaternionRef = useRef(new THREE.Quaternion());
  const tempScaleRef = useRef(new THREE.Vector3());
  const tempMatrixRef = useRef(new THREE.Matrix4());
  const cachedMeshesRef = useRef([]); // Cache all meshes to avoid traversing scene every frame
  const lastActiveSectionRef = useRef(null); // Cache last activeSection
  const layerScaleRef = useRef(new THREE.Vector3(1, 1, 1)); // Reuse scale object for layer groups scale animation

  // Easing function: cubic ease in-out
  const easeInOutCubic = (t) => {
    const clampedT = Math.max(0, Math.min(1, t));
    return clampedT < 0.5
      ? 4 * clampedT * clampedT * clampedT
      : 1 - Math.pow(-2 * clampedT + 2, 3) / 2;
  };

  const createLayerGroup = (layerName, attachName, defaultY) => {
    const group = new THREE.Group();
    group.name = `${layerName}Group`;
    
    const meshesToGroup = [];
    
    scene.traverse((child) => {
      if (child.isMesh) {
        const meshName = child.name || child.uuid;
        const nameLower = meshName.toLowerCase();
        const isLayer = nameLower.includes(layerName.toLowerCase());
        const isAttach = nameLower.includes(attachName.toLowerCase());
        
        if (isLayer || isAttach) {
          meshesToGroup.push(child);
        }
      }
    });
    
    if (meshesToGroup.length === 0) return null;
    
    let layerWorldPos = null;
    const meshTransforms = [];
    
    meshesToGroup.forEach(mesh => {
      mesh.updateMatrixWorld();
      const worldPos = mesh.getWorldPosition(new THREE.Vector3());
      const worldQuat = mesh.getWorldQuaternion(new THREE.Quaternion());
      const worldScale = mesh.getWorldScale(new THREE.Vector3());
      
      meshTransforms.push({
        mesh,
        worldPos: worldPos.clone(),
        worldQuat: worldQuat.clone(),
        worldScale: worldScale.clone(),
      });
      
      const nameLower = (mesh.name || mesh.uuid).toLowerCase();
      if (nameLower.includes(layerName.toLowerCase()) && layerWorldPos === null) {
        layerWorldPos = worldPos.clone();
      }
    });
    
    if (layerWorldPos === null && meshTransforms.length > 0) {
      layerWorldPos = meshTransforms[0].worldPos.clone();
    }
    
    meshTransforms.forEach(({ mesh, worldPos, worldQuat, worldScale }) => {
      if (mesh.parent) {
        mesh.parent.remove(mesh);
      }
      
      group.add(mesh);
      
      const relativePos = worldPos.clone().sub(layerWorldPos);
      mesh.position.copy(relativePos);
      mesh.rotation.setFromQuaternion(worldQuat);
      mesh.scale.copy(worldScale);
    });
    
    scene.add(group);
    group.position.copy(layerWorldPos);
    group.position.y = defaultY;
    originalPositions.current[group.name] = group.position.y;
    
    return group;
  };

  useEffect(() => {
    if (scene) {
      const layer1Group = createLayerGroup('layer1', 'attach1', layerDefaultPositions.layer1);
      if (layer1Group) layer1GroupRef.current = layer1Group;
      
      const layer2Group = createLayerGroup('layer2', 'attach2', layerDefaultPositions.layer2);
      if (layer2Group) layer2GroupRef.current = layer2Group;
      
      const layer3Group = createLayerGroup('layer3', 'attach3', layerDefaultPositions.layer3);
      if (layer3Group) layer3GroupRef.current = layer3Group;
      
      const layer4Group = createLayerGroup('layer4', 'attach4', layerDefaultPositions.layer4);
      if (layer4Group) layer4GroupRef.current = layer4Group;
      
      const layer5Group = createLayerGroup('layer5', 'attach5', layerDefaultPositions.layer5);
      if (layer5Group) layer5GroupRef.current = layer5Group;
      
      const layer6Group = createLayerGroup('layer6', 'attach6', layerDefaultPositions.layer6);
      if (layer6Group) layer6GroupRef.current = layer6Group;
      
      const layer7Group = createLayerGroup('layer7', 'attach7', layerDefaultPositions.layer7);
      if (layer7Group) layer7GroupRef.current = layer7Group;
      
      // Create Agentic Enterprise group, containing all meshes with "ae"
      const aeGroup = new THREE.Group();
      aeGroup.name = 'aeGroup';
      const aeMeshes = [];
      
      // Collect all layer groups
      const layerGroupsForAESearch = [
        layer1Group, layer2Group, layer3Group, layer4Group,
        layer5Group, layer6Group, layer7Group
      ].filter(Boolean);
      
      // First print all mesh names for debugging
      console.log('=== All mesh name list ===');
      const allMeshes = [];
      scene.traverse((child) => {
        if (child.isMesh) {
          const meshName = child.name || child.uuid;
          allMeshes.push(meshName);
        }
      });
      console.log('All mesh names:', allMeshes);
      console.log('Meshes containing "ae":', allMeshes.filter(name => name.toLowerCase().includes('ae')));
      console.log('Meshes containing "ball":', allMeshes.filter(name => name.toLowerCase().includes('ball')));
      console.log('=== Mesh name list end ===');
      
      // Search for meshes containing "ae" from scene and all layer groups
      const searchInObject = (obj) => {
        obj.traverse((child) => {
          if (child.isMesh) {
            const meshName = child.name || child.uuid;
            const nameLower = meshName.toLowerCase();
            
            // Check if contains "ae" (case insensitive)
            if (nameLower.includes('ae')) {
              // Avoid duplicate additions
              if (!aeMeshes.includes(child)) {
                aeMeshes.push(child);
                console.log(`Found ae mesh: "${meshName}" (from: ${obj.name || 'scene'})`);
              }
            }
          }
        });
      };
      
      // First search scene
      searchInObject(scene);
      
      // Then search all layer groups
      layerGroupsForAESearch.forEach(group => {
        searchInObject(group);
      });
      
      // Add ae-related meshes to aeGroup
      if (aeMeshes.length > 0) {
        let aeWorldPos = null;
        const aeMeshTransforms = [];
        
        aeMeshes.forEach(mesh => {
          mesh.updateMatrixWorld();
          const worldPos = mesh.getWorldPosition(new THREE.Vector3());
          const worldQuat = mesh.getWorldQuaternion(new THREE.Quaternion());
          const worldScale = mesh.getWorldScale(new THREE.Vector3());
          
          aeMeshTransforms.push({
            mesh,
            worldPos: worldPos.clone(),
            worldQuat: worldQuat.clone(),
            worldScale: worldScale.clone(),
          });
          
          if (aeWorldPos === null) {
            aeWorldPos = worldPos.clone();
          }
        });
        
        aeMeshTransforms.forEach(({ mesh, worldPos, worldQuat, worldScale }) => {
          if (mesh.parent) {
            mesh.parent.remove(mesh);
          }
          
          aeGroup.add(mesh);
          
          const relativePos = worldPos.clone().sub(aeWorldPos);
          mesh.position.copy(relativePos);
          mesh.rotation.setFromQuaternion(worldQuat);
          mesh.scale.copy(worldScale);
        });
        
        scene.add(aeGroup);
        aeGroup.position.copy(aeWorldPos);
        aeGroupRef.current = aeGroup;
        
        // Print all meshes in aeGroup
        console.log('=== Mesh list in aeGroup ===');
        console.log(`Total of ${aeGroup.children.length} child objects`);
        aeGroup.children.forEach((child, index) => {
          if (child.isMesh) {
            console.log(`${index + 1}. Mesh name: "${child.name || child.uuid}", type: Mesh`);
          } else {
            console.log(`${index + 1}. Child object name: "${child.name || child.uuid}", type: ${child.type}`);
          }
        });
        console.log('=== aeGroup mesh list end ===');
      }
      
      // Find label-related meshes - get all mesh names from LABEL_DATA
      const labelMeshNames = LABEL_DATA.map(item => item.meshName);
      console.log('Searching label mesh name list:', labelMeshNames);
      
      scene.traverse((child) => {
        if (child.isMesh) {
          const meshName = child.name || child.uuid;
          // Check for exact match or case-insensitive match
          const matchedName = labelMeshNames.find(labelName => 
            meshName === labelName || 
            meshName.toLowerCase() === labelName.toLowerCase() ||
            meshName.replace(/\./g, '') === labelName.replace(/\./g, '') // Handle dot differences
          );
          
          if (matchedName) {
            labelMeshRefs.current[matchedName] = child;
            console.log(`Found label mesh: "${meshName}" -> matched to "${matchedName}"`);
          }
        }
      });
      
      // Create Block group, containing all meshes with name "Cube247"
      const blockGroup = new THREE.Group();
      blockGroup.name = 'blockGroup';
      const blockMeshes = [];
      
      scene.traverse((child) => {
        if (child.isMesh) {
          const meshName = child.name || child.uuid;
          const nameLower = meshName.toLowerCase();
          
          // Check if contains "Cube247" (case insensitive)
          if (nameLower.includes('cube247')) {
            blockMeshes.push(child);
          }
        }
      });
      
      // Debug info: print found block meshes
      if (blockMeshes.length > 0) {
        console.log(`Found ${blockMeshes.length} Cube247 meshes:`, blockMeshes.map(m => m.name));
      } else {
        console.log('No Cube247 mesh found');
      }
      
      // Add Cube247-related meshes to blockGroup
      if (blockMeshes.length > 0) {
        let blockWorldPos = null;
        const blockMeshTransforms = [];
        
        blockMeshes.forEach(mesh => {
          mesh.updateMatrixWorld();
          const worldPos = mesh.getWorldPosition(new THREE.Vector3());
          const worldQuat = mesh.getWorldQuaternion(new THREE.Quaternion());
          const worldScale = mesh.getWorldScale(new THREE.Vector3());
          
          blockMeshTransforms.push({
            mesh,
            worldPos: worldPos.clone(),
            worldQuat: worldQuat.clone(),
            worldScale: worldScale.clone(),
          });
          
          if (blockWorldPos === null) {
            blockWorldPos = worldPos.clone();
          }
        });
        
        blockMeshTransforms.forEach(({ mesh, worldPos, worldQuat, worldScale }) => {
          if (mesh.parent) {
            mesh.parent.remove(mesh);
          }
          
          blockGroup.add(mesh);
          
          const relativePos = worldPos.clone().sub(blockWorldPos);
          mesh.position.copy(relativePos);
          mesh.rotation.setFromQuaternion(worldQuat);
          mesh.scale.copy(worldScale);
        });
        
        scene.add(blockGroup);
        blockGroup.position.copy(blockWorldPos);
        blockGroupRef.current = blockGroup;
        
        // Prepare data for InstancedMesh: merge geometries of all meshes in blockGroup
        // Use previously saved blockMeshTransforms to get correct transformations
        if (blockMeshes.length > 0 && blockMeshTransforms.length > 0) {
          // Merge geometries of all meshes
          const geometries = [];
          const mergedMaterials = [];
          
          blockMeshTransforms.forEach(({ mesh, worldPos, worldQuat, worldScale }, index) => {
            const geometry = mesh.geometry.clone();
            const materials = Array.isArray(mesh.material) 
              ? mesh.material 
              : [mesh.material];
            
            // Create transformation matrix (relative to blockWorldPos)
            const transformMatrix = new THREE.Matrix4();
            transformMatrix.compose(
              worldPos.clone().sub(blockWorldPos), // Relative position
              worldQuat,
              worldScale
            );
            
            // Apply transformation matrix to geometry
            geometry.applyMatrix4(transformMatrix);
            geometries.push(geometry);
            
            // Collect materials (use first mesh's material)
            if (index === 0) {
              materials.forEach((material) => {
                mergedMaterials.push(material.clone());
              });
            }
          });
          
          // Merge all geometries
          let mergedGeometry = geometries[0];
          if (geometries.length > 1) {
            // Manually merge geometries (not using BufferGeometryUtils)
            // Merge vertices, indices and other attributes
            const merged = geometries[0].clone();
            const mergedPositions = [];
            const mergedNormals = [];
            const mergedUvs = [];
            const mergedIndices = [];
            let vertexOffset = 0;
            
            geometries.forEach((geometry) => {
              const positions = geometry.attributes.position;
              const normals = geometry.attributes.normal;
              const uvs = geometry.attributes.uv;
              const indices = geometry.index;
              
              if (positions) {
                for (let i = 0; i < positions.count; i++) {
                  mergedPositions.push(
                    positions.getX(i),
                    positions.getY(i),
                    positions.getZ(i)
                  );
                  
                  if (normals) {
                    mergedNormals.push(
                      normals.getX(i),
                      normals.getY(i),
                      normals.getZ(i)
                    );
                  }
                  
                  if (uvs) {
                    mergedUvs.push(
                      uvs.getX(i),
                      uvs.getY(i)
                    );
                  }
                }
              }
              
              if (indices) {
                for (let i = 0; i < indices.count; i++) {
                  mergedIndices.push(indices.getX(i) + vertexOffset);
                }
              } else {
                // If no indices, use vertex indices directly
                for (let i = 0; i < positions.count; i++) {
                  mergedIndices.push(vertexOffset + i);
                }
              }
              
              vertexOffset += positions.count;
            });
            
            // Set merged attributes
            merged.setAttribute('position', new THREE.Float32BufferAttribute(mergedPositions, 3));
            if (mergedNormals.length > 0) {
              merged.setAttribute('normal', new THREE.Float32BufferAttribute(mergedNormals, 3));
            }
            if (mergedUvs.length > 0) {
              merged.setAttribute('uv', new THREE.Float32BufferAttribute(mergedUvs, 2));
            }
            if (mergedIndices.length > 0) {
              merged.setIndex(mergedIndices);
            }
            
            mergedGeometry = merged;
          }
          
          // If no materials, use default material
          if (mergedMaterials.length === 0) {
            mergedMaterials.push(new THREE.MeshStandardMaterial({ color: 0xffffff }));
          }
          
          // InstancedMesh only needs a single material (use first material)
          const instancedMaterial = mergedMaterials[0] || new THREE.MeshStandardMaterial({ color: 0xffffff });
          
          // Debug info
          console.log(`BlockGroup: Found ${blockMeshes.length} meshes, merged geometry vertex count: ${mergedGeometry.attributes.position.count}, using material:`, instancedMaterial);
          
          // Calculate blockGroup bounding box to determine spacing
          const blockBox = new THREE.Box3().setFromObject(blockGroup);
          const blockSize = blockBox.getSize(new THREE.Vector3());
          
          // Use fixed small spacing to arrange instances closely
          // Directly use bounding box size + small gap
          let spacingX = blockSize.x > 0 ? blockSize.x + 0.1 : 0.5; // X direction: bounding box width + 0.1
          let spacingZ = blockSize.z > 0 ? blockSize.z + 0.1 : 0.5; // Z direction: bounding box depth + 0.1
          
          // 2x2 grid = 4 instances
          const instanceCount = 4;
          const gridSize = 2;
          
          console.log(`BlockGroup spacing calculation: blockSize=(${blockSize.x.toFixed(2)}, ${blockSize.y.toFixed(2)}, ${blockSize.z.toFixed(2)}), spacingX=${spacingX.toFixed(2)}, spacingZ=${spacingZ.toFixed(2)}`);
          
          // Store instance data
          blockInstanceDataRef.current = {
            geometry: mergedGeometry,
            material: instancedMaterial, // Use single material
            instanceCount: instanceCount,
            spacingX: spacingX,
            spacingZ: spacingZ,
            gridSize: gridSize,
          };
          
          // Mark instance data as ready
          setBlockInstanceReady(true);
        }
      }
      
      scene.traverse((child) => {
        if (child.isMesh) {
          child.visible = true;
          
          const meshName = child.name || child.uuid;
          const nameLower = meshName.toLowerCase();
          let defaultY = child.position.y;
          
          if (layer1Group && layer1Group.children.includes(child)) {
            defaultY = layer1Group.position.y;
          } else if (layer2Group && layer2Group.children.includes(child)) {
            defaultY = layer2Group.position.y;
          } else if (layer3Group && layer3Group.children.includes(child)) {
            defaultY = layer3Group.position.y;
          } else if (layer4Group && layer4Group.children.includes(child)) {
            defaultY = layer4Group.position.y;
          } else if (layer5Group && layer5Group.children.includes(child)) {
            defaultY = layer5Group.position.y;
          } else if (layer6Group && layer6Group.children.includes(child)) {
            defaultY = layer6Group.position.y;
          } else if (layer7Group && layer7Group.children.includes(child)) {
            defaultY = layer7Group.position.y;
          } else {
            for (const [layerKey, defaultPosition] of Object.entries(layerDefaultPositions)) {
              if (nameLower.includes(layerKey.toLowerCase())) {
                defaultY = defaultPosition;
                child.position.y = defaultY;
                break;
              }
            }
          }
          
          if (!originalPositions.current[meshName]) {
            originalPositions.current[meshName] = defaultY;
          }
          meshRefs.current[meshName] = child;
          
          const materials = Array.isArray(child.material) 
            ? child.material 
            : [child.material];
          
          materials.forEach((material) => {
            if (material) {
              material.depthTest = true;
              const isOpaque = material.opacity === undefined || 
                               material.opacity >= 1.0 || 
                               !material.transparent;
              material.depthWrite = isOpaque;
              material.needsUpdate = true;
            }
          });
          
          const hasTransparent = materials.some(mat => 
            mat && mat.transparent && mat.opacity < 1.0
          );
          child.renderOrder = hasTransparent ? 1 : 0;
        }
      });
      
      // Create connecting line segments between adjacent layers: layer1 bottom to layer2 bottom, layer2 bottom to layer3 bottom, ... to layer6 bottom to layer7 bottom
      // Total 6 segments, 10 lines per segment, 60 lines total, each line has gradient color (from bottom layer color to top layer color)
      const allLayerGroups = [
        layer1GroupRef.current,
        layer2GroupRef.current,
        layer3GroupRef.current,
        layer4GroupRef.current,
        layer5GroupRef.current,
        layer6GroupRef.current,
        layer7GroupRef.current,
      ];
      
      // Define color for each layer
      const layerColors = [
        new THREE.Color(0xffeb3b), // Layer 1: Yellow
        new THREE.Color(0xffa726), // Layer 2: Orange-yellow
        new THREE.Color(0xff5722), // Layer 3: Orange-red
        new THREE.Color("#6A1A59"), // Layer 4: Plum purple
        new THREE.Color(0x2196f3), // Layer 5: Blue
        new THREE.Color(0x388e3c), // Layer 6: Dark green
        new THREE.Color(0x4dd0e1), // Layer 7: Mint
      ];
      
      // Check if all layer groups exist
      const allLayersExist = allLayerGroups.every(layer => layer !== null);
      
      if (allLayersExist) {
        // Calculate layer1 bounding box to determine XZ coordinate distribution
        const layer1Box = new THREE.Box3().setFromObject(allLayerGroups[0]);
        const layer1MinX = layer1Box.min.x;
        const layer1MaxX = layer1Box.max.x;
        const layer1MinZ = layer1Box.min.z;
        const layer1MaxZ = layer1Box.max.z;
        
        // Evenly distribute 10 points in layer1's bottom surface area
        const lineCountPerSegment = 10;
        const totalSegments = 6; // layer1->2, layer2->3, ..., layer6->7
        const totalLineCount = lineCountPerSegment * totalSegments; // 60 lines
        
        const xzPoints = [];
        const cols = 5;
        const rows = 2;
        
        for (let i = 0; i < lineCountPerSegment; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = THREE.MathUtils.lerp(layer1MinX, layer1MaxX, (col + 0.5) / cols);
          const z = THREE.MathUtils.lerp(layer1MinZ, layer1MaxZ, (row + 0.5) / rows);
          xzPoints.push({ x, z });
        }
        
        // Store XZ coordinates for useFrame (each segment uses the same XZ coordinates)
        linePointsXZRef.current = xzPoints;
        
        // Create geometry for all line segments (Y coordinates will be dynamically updated in useFrame)
        const initialPoints = [];
        const initialColors = [];
        
        // Create 6 line segments: layer1->2, layer2->3, ..., layer6->7
        for (let segmentIndex = 0; segmentIndex < totalSegments; segmentIndex++) {
          const bottomLayerIndex = segmentIndex; // Bottom layer index
          const topLayerIndex = segmentIndex + 1; // Top layer index
          
          const bottomColor = layerColors[bottomLayerIndex];
          const topColor = layerColors[topLayerIndex];
          
          // Get current segment's layer bounding boxes (initial values, will be updated in useFrame)
          const bottomLayerBox = new THREE.Box3().setFromObject(allLayerGroups[bottomLayerIndex]);
          const topLayerBox = new THREE.Box3().setFromObject(allLayerGroups[topLayerIndex]);
          
          // Create start and end points for each line in this segment
          for (const { x, z } of xzPoints) {
            // Start point: bottom layer's bottom surface
            initialPoints.push(new THREE.Vector3(x, bottomLayerBox.min.y, z));
            initialColors.push(bottomColor.r, bottomColor.g, bottomColor.b);
            
            // End point: top layer's bottom surface
            initialPoints.push(new THREE.Vector3(x, topLayerBox.min.y, z));
            initialColors.push(topColor.r, topColor.g, topColor.b);
          }
        }
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(initialPoints);
        
        // Add color attribute (for gradient color)
        lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(initialColors, 3));
        
        // Add linePosition attribute: used to calculate opacity gradient in shader (0=start point, 1=end point)
        const linePositions = [];
        const totalLines = lineCountPerSegment * totalSegments; // 60 lines
        
        for (let i = 0; i < totalLines; i++) {
          // Each line has two points: start and end
          linePositions.push(0.0); // Start point: opacity = 0
          linePositions.push(1.0); // End point: opacity = 0
        }
        
        lineGeometry.setAttribute('linePosition', new THREE.Float32BufferAttribute(linePositions, 1));
        
        linesGeometryRef.current = lineGeometry;
        
        // Create custom ShaderMaterial to achieve opacity gradient from both ends to middle
        const lineMaterial = new THREE.ShaderMaterial({
          vertexShader: `
            // color attribute is automatically provided by Three.js (vertexColors: true)
            attribute float linePosition;
            varying vec3 vColor;
            varying float vLinePosition;
            
            void main() {
              vColor = color; // Use color attribute provided by Three.js
              vLinePosition = linePosition;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            varying vec3 vColor;
            varying float vLinePosition;
            
            void main() {
              // Calculate opacity: middle (0.5) is 1, both ends (0 and 1) are 0
              // Use smooth curve: 1 - 4 * (position - 0.5)^2
              float t = vLinePosition;
              float opacity = 1.0 - 4.0 * (t - 0.5) * (t - 0.5);
              opacity = clamp(opacity, 0.0, 1.0);
              
              gl_FragColor = vec4(vColor, opacity);
            }
          `,
          transparent: true,
          depthTest: true,
          depthWrite: false,
          vertexColors: true,
        });
        linesMaterialRef.current = lineMaterial;
      }
    }
  }, [scene]);

  // Initialize InstancedMesh positions (2x2 grid) - only execute once when data is ready
  useEffect(() => {
    if (blockInstancedMeshRef.current && blockInstanceDataRef.current && blockInstanceReady) {
      const instanceData = blockInstanceDataRef.current;
      
      // Calculate grid center offset (to center grid at origin)
      const centerOffsetX = (instanceData.gridSize - 1) * instanceData.spacingX / 2;
      const centerOffsetZ = (instanceData.gridSize - 1) * instanceData.spacingZ / 2;
      
      const positions = [];
      let instanceIndex = 0;
      
      // Create 2x2 grid
      for (let row = 0; row < instanceData.gridSize && instanceIndex < instanceData.instanceCount; row++) {
        for (let col = 0; col < instanceData.gridSize && instanceIndex < instanceData.instanceCount; col++) {
          const x = col * instanceData.spacingX - centerOffsetX;
          const z = row * instanceData.spacingZ - centerOffsetZ;
          
          positions.push({ x, z, row, col, instanceIndex });
          
          // Create new matrix each time to avoid issues from reuse
          const matrix = new THREE.Matrix4();
          
          // Mirror second instance (instanceIndex === 1) on X-axis
          if (instanceIndex === 1) {
            // First create mirror matrix (X-axis flip)
            const scaleMatrix = new THREE.Matrix4();
            scaleMatrix.makeScale(-1, 1, 1);
            
            // Then create translation matrix
            const translationMatrix = new THREE.Matrix4();
            translationMatrix.makeTranslation(x, 0, z);
            
            // Combine: mirror first, then translate
            matrix.multiplyMatrices(translationMatrix, scaleMatrix);
          } 
          // Mirror third instance (instanceIndex === 2) on Z-axis
          else if (instanceIndex === 2) {
            // First create mirror matrix (Z-axis flip)
            const scaleMatrix = new THREE.Matrix4();
            scaleMatrix.makeScale(1, 1, -1);
            
            // Then create translation matrix
            const translationMatrix = new THREE.Matrix4();
            translationMatrix.makeTranslation(x, 0, z);
            
            // Combine: mirror first, then translate
            matrix.multiplyMatrices(translationMatrix, scaleMatrix);
          }
          // Mirror fourth instance (instanceIndex === 3) on both X and Z axes (simultaneously)
          else if (instanceIndex === 3) {
            // First create mirror matrix (X and Z axes flip simultaneously)
            const scaleMatrix = new THREE.Matrix4();
            scaleMatrix.makeScale(-1, 1, -1);
            
            // Then create translation matrix
            const translationMatrix = new THREE.Matrix4();
            translationMatrix.makeTranslation(x, 0, z);
            
            // Combine: mirror first, then translate
            matrix.multiplyMatrices(translationMatrix, scaleMatrix);
          } else {
            // Other instances handled normally (translation only)
            matrix.makeTranslation(x, 0, z);
          }
          
          blockInstancedMeshRef.current.setMatrixAt(instanceIndex, matrix);
          
          // Save base matrix (for later updating only scale in useFrame)
          instanceBaseMatricesRef.current[instanceIndex] = matrix.clone();
          
          instanceIndex++;
        }
      }
      
      // Ensure instance count is correct
      blockInstancedMeshRef.current.count = instanceIndex;
      blockInstancedMeshRef.current.instanceMatrix.needsUpdate = true;
      
      console.log(`InstancedMesh position initialization complete: ${instanceIndex} instances (2x2 grid)`, {
        spacingX: instanceData.spacingX,
        spacingZ: instanceData.spacingZ,
        gridSize: instanceData.gridSize,
        instanceCount: instanceData.instanceCount,
        actualCount: instanceIndex,
        positions: positions, // Display all positions for debugging
      });
    }
  }, [blockInstanceReady]); // Initialize when instance data is ready

  // Cache all meshes to avoid traversing scene every frame
  useEffect(() => {
    if (scene && cachedMeshesRef.current.length === 0) {
      scene.traverse((child) => {
        if (child.isMesh) {
          cachedMeshesRef.current.push(child);
        }
      });
    }
  }, [scene]);

  useFrame(() => {
      // Section8 uses independent logic: use InstancedMesh to display 2x2 grid of blockGroup copies
      if (activeSection === 'section8') {
        // Only update visibility when activeSection changes
        if (lastActiveSectionRef.current !== 'section8') {
          // Hide original blockGroup
          if (blockGroupRef.current) {
            blockGroupRef.current.visible = false;
          }
          
          // Hide white lines
          if (lineSegmentsRef.current) {
            lineSegmentsRef.current.visible = false;
          }
          
          // Use cached mesh list to avoid traversing scene every frame
          const meshes = cachedMeshesRef.current;
          for (let i = 0; i < meshes.length; i++) {
            meshes[i].visible = false;
          }
          
          lastActiveSectionRef.current = 'section8';
        }
        
        // Ensure InstancedMesh is visible and correctly set
        if (blockInstancedMeshRef.current && blockInstanceDataRef.current) {
          blockInstancedMeshRef.current.visible = true;
          
          // Ensure instance count is correct
          blockInstancedMeshRef.current.count = blockInstanceDataRef.current.instanceCount;
          
          // Calculate current vh value (Section8 height is 300vh, scrollProgress is 0-1)
          const currentVh = (scrollProgress || 0) * 300;
          
          // Control instance show/hide: based on current vh value (reversible animation)
          // Initially only show first instance (instanceIndex 0)
          // When vh reaches 100vh, show second, third, fourth instances in sequence
          // When scrolling up, they will be hidden again (reversible animation)
          
          const triggerVh = 100; // vh value that triggers animation
          const animationDuration = 50; // Animation duration for each instance appearance (vh)
          
          // Define trigger time for each instance
          const instanceTriggers = [
            0,      // Instance 0: show immediately
            triggerVh,                    // Instance 1: show at 100vh
            triggerVh + animationDuration,    // Instance 2: show at 150vh
            triggerVh + animationDuration * 2  // Instance 3: show at 200vh
          ];
          
          // Use current vh value (not max vh value) to achieve reversible animation
          const displayVh = currentVh;
          const instanceData = blockInstanceDataRef.current;
          
          // Update visibility of each instance based on vh value (only modify scale)
          // Optimization: reuse objects to avoid creating new objects in loop
          const position = tempVector3Ref.current;
          const rotation = tempQuaternionRef.current;
          const baseScale = tempScaleRef.current;
          const finalMatrix = tempMatrixRef.current;
          
          for (let i = 0; i < instanceData.instanceCount; i++) {
            const shouldShow = displayVh >= instanceTriggers[i];
            
            if (instanceBaseMatricesRef.current[i]) {
              // Extract position, rotation and original scale from base matrix (reuse objects)
              instanceBaseMatricesRef.current[i].decompose(position, rotation, baseScale);
              
              // Set final scale based on visibility
              // Need to save original scale because baseScale will be modified
              const originalScaleX = baseScale.x;
              const originalScaleY = baseScale.y;
              const originalScaleZ = baseScale.z;
              
              if (!shouldShow) {
                baseScale.set(0, 0, 0);
              }
              
              // Compose final matrix and update (reuse objects)
              finalMatrix.compose(position, rotation, baseScale);
              blockInstancedMeshRef.current.setMatrixAt(i, finalMatrix);
              
              // Restore original scale (prepare for next use)
              baseScale.set(originalScaleX, originalScaleY, originalScaleZ);
            }
          }
          
          // Mark matrix needs update
          if (blockInstancedMeshRef.current.instanceMatrix) {
            blockInstancedMeshRef.current.instanceMatrix.needsUpdate = true;
          }
          
          // Debug info (only print on first time)
          if (!blockInstancedMeshRef.current._debugLogged) {
            console.log('Section8 InstancedMesh state:', {
              visible: blockInstancedMeshRef.current.visible,
              currentVh: currentVh,
              instanceCount: blockInstancedMeshRef.current.count,
            });
            blockInstancedMeshRef.current._debugLogged = true;
          }
        } else {
          console.warn('Section8: blockInstancedMeshRef.current or blockInstanceDataRef.current does not exist');
        }
        
        return;
    }
    
    // Section5 original logic
    const progress = scrollProgress || 0;
    const vh = progress * 1300;
    
    // Restore visibility of all meshes (restore when rolling back from section8)
    // Optimization: only update visibility when activeSection changes, use cached mesh list
    if (lastActiveSectionRef.current !== 'section5') {
      const meshes = cachedMeshesRef.current;
      const blockGroupChildren = blockGroupRef.current ? new Set(blockGroupRef.current.children) : new Set();
      
      for (let i = 0; i < meshes.length; i++) {
        const mesh = meshes[i];
        // Restore mesh visibility (except blockGroup, which is controlled separately)
        if (!blockGroupChildren.has(mesh)) {
          mesh.visible = true;
        }
      }
      
      lastActiveSectionRef.current = 'section5';
    }
    
    // Control layer groups display
    const layerGroups = [
      { ref: layer1GroupRef, name: 'layer1Group', index: 0 },
      { ref: layer2GroupRef, name: 'layer2Group', index: 1 },
      { ref: layer3GroupRef, name: 'layer3Group', index: 2 },
      { ref: layer4GroupRef, name: 'layer4Group', index: 3 },
      { ref: layer5GroupRef, name: 'layer5Group', index: 4 },
      { ref: layer6GroupRef, name: 'layer6Group', index: 5 },
      { ref: layer7GroupRef, name: 'layer7Group', index: 6 },
    ];
    
    // 0-200vh: layer and attach groups are invisible, visible after 200vh
    // 200-210vh: fast scale entrance animation (from 0 to 1)
    const layerAnimationStart = 200;
    const layerAnimationDuration = 10; // Animation duration of 10vh
    const layerAnimationEnd = layerAnimationStart + layerAnimationDuration;
    
    const shouldShowLayers = vh > layerAnimationStart;
    let layerScale = 1;
    
    if (vh >= layerAnimationStart && vh <= layerAnimationEnd) {
      // Calculate scale progress (0 to 1)
      const scaleProgress = (vh - layerAnimationStart) / layerAnimationDuration;
      // Use easeOutCubic easing function for more natural animation
      const easedProgress = 1 - Math.pow(1 - scaleProgress, 3);
      layerScale = easedProgress;
    } else if (vh < layerAnimationStart) {
      layerScale = 0;
    }
    
    layerGroups.forEach(({ ref }) => {
      if (ref.current) {
        ref.current.visible = shouldShowLayers;
        // Apply scale animation (reuse object to avoid creating new Vector3)
        layerScaleRef.current.set(layerScale, layerScale, layerScale);
        ref.current.scale.copy(layerScaleRef.current);
      }
    });
    
    // Restore aeGroup visibility (if exists)
    if (aeGroupRef.current) {
      aeGroupRef.current.visible = true;
    }
    
    // In Section5: blockGroup is invisible (only shown in section8)
    if (blockGroupRef.current) {
      blockGroupRef.current.visible = false;
    }
    
    // 0-200vh: white lines invisible
    if (lineSegmentsRef.current) {
      lineSegmentsRef.current.visible = vh > 200;
    }
    
    let layerSpacing = 0.2;
    
    if (vh < 300) {
      // 0-300vh: maintain minimum spacing
      layerSpacing = 0.2;
    } else if (vh < 400) {
      // 300-400vh: maintain 0.2
      layerSpacing = 0.2;
    } else if (vh < STAGES.PHASE2_SPACING_EXPAND_END) {
      // 400-600vh: layer spacing expansion period, expand from 0.2 to 5
      const spacingProgress = (vh - 400) / 200; // 0-1
      layerSpacing = THREE.MathUtils.lerp(0.2, 5, spacingProgress);
    } else {
      // 600vh+: maintain 5 (enter layer-by-layer viewing stage)
      layerSpacing = 5;
    }
    
    // Use initial positions saved in originalPositions, these positions come from layerDefaultPositions
    const layer1BaseY = originalPositions.current['layer1Group'] || layerDefaultPositions.layer1;
    
    layerGroups.forEach(({ ref, name, index }) => {
      if (ref.current && ref.current.children.length > 0) {
        // Get original position of this layer (from layerDefaultPositions)
        const originalY = originalPositions.current[name] || layerDefaultPositions[`layer${index + 1}`];
        
        if (index === 0) {
          // Layer1 maintains original position, apply layerSpacing on top of it
          ref.current.position.y = originalY;
        } else {
          // Other layers: start from original position, adjust according to layerSpacing
          // Calculate offset relative to layer1
          const relativeOffset = (originalY - layer1BaseY) + (index * layerSpacing);
          ref.current.position.y = layer1BaseY + relativeOffset;
        }
      }
    });
    
    // Update line segment endpoint positions to keep in sync with layer positions (6 segments, 10 lines per segment, 60 lines total)
    if (linesGeometryRef.current && linePointsXZRef.current) {
      const allLayerGroups = [
        layer1GroupRef.current,
        layer2GroupRef.current,
        layer3GroupRef.current,
        layer4GroupRef.current,
        layer5GroupRef.current,
        layer6GroupRef.current,
        layer7GroupRef.current,
      ];
      
      const allLayersExist = allLayerGroups.every(layer => layer !== null);
      
      if (allLayersExist) {
        // Define color for each layer
        const layerColors = [
          new THREE.Color(0xffeb3b), // Layer 1: Yellow
          new THREE.Color(0xffa726), // Layer 2: Orange-yellow
          new THREE.Color(0xff5722), // Layer 3: Orange-red
          new THREE.Color("#6A1A59"), // Layer 4: Plum purple
          new THREE.Color(0x2196f3), // Layer 5: Blue
          new THREE.Color(0x388e3c), // Layer 6: Dark green
          new THREE.Color(0x4dd0e1), // Layer 7: Mint
        ];
        
        const lineCountPerSegment = linePointsXZRef.current.length; // 10
        const totalSegments = 6; // layer1->2, layer2->3, ..., layer6->7
        
        // Update geometry vertex positions and colors
        const positions = linesGeometryRef.current.attributes.position;
        const colors = linesGeometryRef.current.attributes.color;
        
        if (positions && colors) {
          const positionArray = positions.array;
          const colorArray = colors.array;
          let idx = 0;
          let colorIdx = 0;
          
          // Update position and color for each line segment
          for (let segmentIndex = 0; segmentIndex < totalSegments; segmentIndex++) {
            const bottomLayerIndex = segmentIndex;
            const topLayerIndex = segmentIndex + 1;
            
            // Get current segment's layer bounding boxes
            const bottomLayerBox = new THREE.Box3().setFromObject(allLayerGroups[bottomLayerIndex]);
            const topLayerBox = new THREE.Box3().setFromObject(allLayerGroups[topLayerIndex]);
            
            const bottomMinY = bottomLayerBox.min.y;
            const topMinY = topLayerBox.min.y;
            
            const bottomColor = layerColors[bottomLayerIndex];
            const topColor = layerColors[topLayerIndex];
            
            // Update each line in this segment
            for (const { x, z } of linePointsXZRef.current) {
              // Start point: bottom layer's bottom surface
              positionArray[idx++] = x;
              positionArray[idx++] = bottomMinY;
              positionArray[idx++] = z;
              colorArray[colorIdx++] = bottomColor.r;
              colorArray[colorIdx++] = bottomColor.g;
              colorArray[colorIdx++] = bottomColor.b;
              
              // End point: top layer's bottom surface
              positionArray[idx++] = x;
              positionArray[idx++] = topMinY;
              positionArray[idx++] = z;
              colorArray[colorIdx++] = topColor.r;
              colorArray[colorIdx++] = topColor.g;
              colorArray[colorIdx++] = topColor.b;
            }
          }
          
          positions.needsUpdate = true;
          colors.needsUpdate = true;
        }
      }
    }
  });

  return (
    <group>
      {/* 60 gradient color line segments between adjacent layers (6 segments, 10 lines per segment, each segment gradients from bottom layer color to top layer color) */}
      {linesGeometryRef.current && linesMaterialRef.current && (
        <lineSegments
          ref={lineSegmentsRef}
          geometry={linesGeometryRef.current}
          material={linesMaterialRef.current}
          renderOrder={1000}
          frustumCulled={false}
        />
      )}
      
      {/* Section8 InstancedMesh: 2x2 grid of blockGroup copies */}
      {blockInstanceDataRef.current && blockInstanceDataRef.current.geometry && blockInstanceDataRef.current.material && (
        <instancedMesh
          ref={blockInstancedMeshRef}
          args={[
            blockInstanceDataRef.current.geometry,
            blockInstanceDataRef.current.material,
            blockInstanceDataRef.current.instanceCount
          ]}
          frustumCulled={true}
          visible={activeSection === 'section8'}
        />
      )}
      
      <primitive object={scene} />
      
      {/* 2D label coordinate calculation component - only display at 0-100vh */}
      {activeSection === 'section5' && (() => {
        const currentVh = scrollProgress * 1300;
        const showLabels = currentVh >= 0 && currentVh < 100;
        
        if (!showLabels) return null;
        
        return (
          <LabelPositionCalculator 
            labelMeshRefs={labelMeshRefs.current}
            showLabels={showLabels}
          />
        );
      })()}
    </group>
  );
}

// Label coordinate calculation component - convert 3D coordinates to 2D screen coordinates
function LabelPositionCalculator({ labelMeshRefs, showLabels }) {
  const { camera, size } = useThree();
  const positionsRef = useRef({});
  const rafIdRef = useRef(null);
  // Optimization: reuse Vector3 object to avoid creating new objects every frame
  const worldPosRef = useRef(new THREE.Vector3());
  
  useFrame(() => {
    if (!showLabels) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }
    
    // Optimization: reuse positions object, only create new objects when needed
    const positions = positionsRef.current;
    const worldPos = worldPosRef.current;
    
    LABEL_DATA.forEach(({ meshName }) => {
      const mesh = labelMeshRefs[meshName];
      if (mesh) {
        mesh.updateMatrixWorld();
        // Reuse Vector3 object
        mesh.getWorldPosition(worldPos);
        
        // Convert 3D world coordinates to 2D screen coordinates
        worldPos.project(camera);
        
        // Convert to screen pixel coordinates
        const x = (worldPos.x * 0.5 + 0.5) * size.width;
        const y = (worldPos.y * -0.5 + 0.5) * size.height; // Y axis needs to be flipped
        
        // Label position slightly below object (offset 40px downward)
        // Directly update existing object to avoid creating new objects
        if (!positions[meshName]) {
          positions[meshName] = { x: 0, y: 0 };
        }
        positions[meshName].x = x + 5;
        positions[meshName].y = y + 40;
      }
    });
    
    // Use requestAnimationFrame to update, avoid directly calling setState in useFrame
    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(() => {
        window.dispatchEvent(new CustomEvent('meshLabelPositions', { 
          detail: positionsRef.current 
        }));
        rafIdRef.current = null;
      });
    }
  });
  
  return null; // This component doesn't render anything, only calculates coordinates
}

function ModelControls({ scrollProgress, activeSection }) {
  // activeSection can be 'section5', 'section8', 'section5-final', or null
  // 'section5-final' means maintain section5's final state
  const effectiveProgress = activeSection ? (scrollProgress || 0) : 0;
  return <ValueBlueprintModel scrollProgress={effectiveProgress} activeSection={activeSection} />;
}

function CameraRig({ scrollProgress = 0, scrollProgress8 = 0, activeSection }) {
  const { camera } = useThree();
  // activeSection can be 'section5', 'section8', 'section5-final', or null
  // 'section5-final' means maintain section5's final state, at this time scrollProgress should be 1
  const effectiveProgress = activeSection ? scrollProgress : 0;
  const lookRef = useRef(new THREE.Vector3(0, 0, 0));
  const initializedRef = useRef(false);
  
  // Camera view configuration
  const VIEW_CONFIG = {
    // Top view configuration (Phase 1: 0-300vh) - looking down from above Y-axis, left-right in view is X-axis, up-down is Z-axis
    topView: {
      position: { x: 0, y: 15, z: 0 },
      lookAt: { x: 0, y: 0, z: 0 },
      up: { x: 0, y: 0, z: -1 }, // Set up vector to -Z axis, so up-down in view is Z-axis
      zoom: 200,
    },
    // Side view configuration (Phase 2 and after)
    sideView: {
      position: { x: 1, y: 7, z: 10 },
      zoom: 200,
    },
  };
  
  // Easing function: cubic ease in-out
  const easeInOutCubic = (t) => {
    const clampedT = Math.max(0, Math.min(1, t));
    return clampedT < 0.5
      ? 4 * clampedT * clampedT * clampedT
      : 1 - Math.pow(-2 * clampedT + 2, 3) / 2;
  };
  
  // Helper function: calculate progress and apply easing
  const getEasedProgress = (vh, start, end, delay = 0) => {
    const progress = Math.max(0, Math.min(1, (vh - start) / (end - start)));
    if (delay > 0 && progress < delay) return 0;
    const adjustedProgress = delay > 0 ? (progress - delay) / (1 - delay) : progress;
    return easeInOutCubic(Math.max(0, Math.min(1, adjustedProgress)));
  };
  
  // Helper function: interpolate within range
  const lerpInRange = (vh, start, end, from, to, delay = 0) => {
    const t = getEasedProgress(vh, start, end, delay);
    return THREE.MathUtils.lerp(from, to, t);
  };
  
  useEffect(() => {
    if (camera.isOrthographicCamera && !initializedRef.current) {
      // Initialize camera = sideView initial pose, but y position higher, x position moved in -x direction, zoom out a bit
      const { position, zoom } = VIEW_CONFIG.sideView;
      const initialY = position.y - 1; // y position higher (changed from -4 to -1, increased by 3 units)
      const initialX = position.x - 1; // x position moved 1 unit in -x direction
      const initialZoom = zoom * 0.5; // zoom out more (smaller zoom value, objects smaller)
      
      camera.position.set(initialX, initialY, position.z);
      lookRef.current.set(-1.5 - 1, 1.5 - 4, 0); // Side view observation point, x position moved 1 unit in -x direction, y position unchanged (maintain 1.5 - 4)
      camera.zoom = initialZoom;
      camera.updateProjectionMatrix();
      camera.lookAt(lookRef.current);
      camera.updateMatrixWorld();
      
      initializedRef.current = true;
    }
  }, [camera]);
  
  useFrame(() => {
    if (!camera.isOrthographicCamera || !initializedRef.current) return;
    
    // Section8 uses independent logic: isometric view to observe blockGroup
    if (activeSection === 'section8') {
      // Classic isometric view: observe origin from isometric angle
      // Position at isometric angle (approximately 35.264 degrees), observation point at (0,0,0)
      // 0-100vh: smooth transition from X-axis offset -100 to -2
      // 100vh+: maintain at -2
      const currentVh = (scrollProgress8 || 0) * 300; // Section8 height is 300vh
      const isometricDistance = 15; // Isometric view distance
      
      // Determine X and Z axis offsets based on vh: X-axis offset -100 at 0vh, X-axis transitions to -2 and Z-axis transitions to +2 at 100vh
      let xOffset = 0;
      let zOffset = 0;
      if (currentVh < 100) {
        // 0-100vh: X-axis smooth transition from -100 to -2, Z-axis transition from 0 to +2
        const transitionProgress = currentVh / 100; // 0-1
        const easedProgress = easeInOutCubic(transitionProgress);
        xOffset = THREE.MathUtils.lerp(-100, -2, easedProgress);
        zOffset = THREE.MathUtils.lerp(0, 2, easedProgress); // Z-axis transition from 0 to +2
      } else {
        // 100vh+: X-axis maintain at -2, Z-axis maintain at +2
        xOffset = -2;
        zOffset = 2; // Z-axis maintain at +2
      }
      
      const isometricX = isometricDistance + xOffset;
      const isometricY = isometricDistance;
      const isometricZ = isometricDistance + zOffset;
      
      camera.position.set(isometricX, isometricY, isometricZ);
      lookRef.current.set(xOffset, 0, zOffset); // Observation point X and Z axes also transition based on vh
      camera.zoom = 100; // Isometric view zoom value
      camera.updateProjectionMatrix();
      camera.lookAt(lookRef.current);
      camera.updateMatrixWorld();
      return;
    }
    
    // Solution B: when effectiveProgress === 0, completely skip animation logic, maintain initialization pose
    if (effectiveProgress === 0) {
      return;
    }
    
    const globalProgress = Math.max(0, Math.min(1, effectiveProgress || 0));
    const vh = globalProgress * 1300; // Total scroll height (vh units)
    
    // ========== 0-100vh: maintain side view, camera unchanged ==========
    if (vh <= 100) {
      // Maintain initialization state (side view, y position higher, x position moved in -x direction, zoom out a bit), no animation
      const { position, zoom } = VIEW_CONFIG.sideView;
      const initialY = position.y - 1; // y position higher (changed from -4 to -1, increased by 3 units)
      const initialX = position.x - 1; // x position moved 1 unit in -x direction
      const initialZoom = zoom * 0.5; // zoom out more (smaller zoom value, objects smaller)
      camera.position.set(initialX, initialY, position.z);
      lookRef.current.set(-1.5 - 1, 1.5 - 4, 0); // Side view observation point, x position moved 1 unit in -x direction, y position unchanged (maintain 1.5 - 4)
      camera.zoom = initialZoom;
      camera.updateProjectionMatrix();
      camera.lookAt(lookRef.current);
      camera.updateMatrixWorld();
      return;
    }
    
    // ========== 100-200vh: transition from side view to top view ==========
    if (vh <= 200) {
      const transitionProgress = (vh - 100) / 100; // 0-1 progress
      const easedProgress = easeInOutCubic(transitionProgress);
      
      // Camera position interpolate from side view (higher y position, x position moved in -x direction) to top view
      const initialSideY = VIEW_CONFIG.sideView.position.y - 1; // Initial higher y position (changed from -4 to -1)
      const initialSideX = VIEW_CONFIG.sideView.position.x - 1; // Initial x position moved 1 unit in -x direction
      const cameraX = THREE.MathUtils.lerp(
        initialSideX,
        VIEW_CONFIG.topView.position.x,
        easedProgress
      );
      const cameraY = THREE.MathUtils.lerp(
        initialSideY,
        VIEW_CONFIG.topView.position.y,
        easedProgress
      );
      const cameraZ = THREE.MathUtils.lerp(
        VIEW_CONFIG.sideView.position.z,
        VIEW_CONFIG.topView.position.z,
        easedProgress
      );
      
      // Observation point interpolate from side view (lower y position, x position moved in -x direction) to top view
      const initialLookAtY = 1.5 - 4; // Initial observation point y position also moved down 4 units
      const initialLookAtX = -1.5 - 1; // Initial observation point x position moved 1 unit in -x direction
      const lookAtX = THREE.MathUtils.lerp(initialLookAtX, VIEW_CONFIG.topView.lookAt.x, easedProgress);
      const lookAtY = THREE.MathUtils.lerp(initialLookAtY, VIEW_CONFIG.topView.lookAt.y, easedProgress);
      const lookAtZ = THREE.MathUtils.lerp(0, VIEW_CONFIG.topView.lookAt.z, easedProgress);
      
      // Zoom interpolate from side view (zoom out) to top view
      const initialSideZoom = VIEW_CONFIG.sideView.zoom * 0.5; // Initial zoom out more (objects smaller)
      const currentZoom = THREE.MathUtils.lerp(
        initialSideZoom,
        VIEW_CONFIG.topView.zoom,
        easedProgress
      );
      
      camera.position.set(cameraX, cameraY, cameraZ);
      lookRef.current.set(lookAtX, lookAtY, lookAtZ);
      camera.zoom = currentZoom;
      // In transition stage, up vector also needs to transition from default (0,1,0) to -Z axis (0,0,-1)
      const upProgress = easedProgress;
      camera.up.set(
        THREE.MathUtils.lerp(0, 0, upProgress),
        THREE.MathUtils.lerp(1, 0, upProgress),
        THREE.MathUtils.lerp(0, -1, upProgress)
      );
      camera.updateProjectionMatrix();
      camera.lookAt(lookRef.current);
      camera.updateMatrixWorld();
      return;
    }
    
    // ========== Phase 1: Top view (200-300vh) ==========
    if (vh < STAGES.PHASE1_TOP_VIEW) {
      const { position, zoom, up } = VIEW_CONFIG.topView;
      camera.position.set(position.x, position.y, position.z);
      lookRef.current.set(VIEW_CONFIG.topView.lookAt.x, VIEW_CONFIG.topView.lookAt.y, VIEW_CONFIG.topView.lookAt.z);
      camera.zoom = zoom;
      if (up) {
        camera.up.set(up.x, up.y, up.z); // Set up vector to Z-axis, so up-down in view is Z-axis
      }
      camera.updateProjectionMatrix();
      camera.lookAt(lookRef.current);
      camera.updateMatrixWorld();
      return;
    }
    
    // ========== Phase 2 and after: side view related animations ==========
    // Calculate camera position (X, Y, Z)
    // After 1500vh: X-axis offset -100 (smooth transition)
    let baseCameraX = vh <= STAGES.TRANSITION_END
      ? lerpInRange(vh, STAGES.TRANSITION_START, STAGES.TRANSITION_END, 
          VIEW_CONFIG.topView.position.x, VIEW_CONFIG.sideView.position.x)
      : VIEW_CONFIG.sideView.position.x;
    
    // Add X-axis offset after 1500vh (smooth transition, duration 100vh)
    const xOffsetTransitionDuration = 100; // Transition duration 100vh
    const xOffsetProgress = vh >= STAGES.PHASE5_X_OFFSET_START
      ? Math.min(1, (vh - STAGES.PHASE5_X_OFFSET_START) / xOffsetTransitionDuration)
      : 0;
    const easedXOffsetProgress = easeInOutCubic(xOffsetProgress);
    const xOffset = easedXOffsetProgress * -100;
    const cameraX = baseCameraX + xOffset;
    
    // Camera Y slightly higher at 400vh
    const targetCameraY = 7.5; // Target Y position at 400vh (slightly higher)
    const cameraY = vh <= STAGES.TRANSITION_END
      ? lerpInRange(vh, STAGES.TRANSITION_START, STAGES.TRANSITION_END,
          VIEW_CONFIG.topView.position.y, targetCameraY)
      : targetCameraY;
    
    const cameraZ = vh <= STAGES.TRANSITION_END
      ? lerpInRange(vh, STAGES.TRANSITION_START, STAGES.TRANSITION_END,
          VIEW_CONFIG.topView.position.z, VIEW_CONFIG.sideView.position.z)
      : VIEW_CONFIG.sideView.position.z;
    
    // Calculate observation point (LookAt) X and Z (with delay)
    // After 1500vh: X-axis offset -100 (smooth transition)
    let baseLookAtX = vh <= STAGES.TRANSITION_END
      ? lerpInRange(vh, STAGES.TRANSITION_START, STAGES.TRANSITION_END,
          VIEW_CONFIG.topView.lookAt.x, -1.5)
      : -1.5;
    
    // Add X-axis offset after 1500vh (smooth transition, duration 100vh)
    const lookAtXOffsetTransitionDuration = 100; // Transition duration 100vh
    const lookAtXOffsetProgress = vh >= STAGES.PHASE5_X_OFFSET_START
      ? Math.min(1, (vh - STAGES.PHASE5_X_OFFSET_START) / lookAtXOffsetTransitionDuration)
      : 0;
    const easedLookAtXOffsetProgress = easeInOutCubic(lookAtXOffsetProgress);
    const lookAtXOffset = easedLookAtXOffsetProgress * -100;
    const lookAtX = baseLookAtX + lookAtXOffset;
    
    const lookAtZ = vh <= STAGES.TRANSITION_END
      ? lerpInRange(vh, STAGES.TRANSITION_START, STAGES.TRANSITION_END,
          VIEW_CONFIG.topView.lookAt.z, 0)
      : 0;
    
    // Calculate observation point (LookAt) Y
    let lookAtY;
    if (vh <= STAGES.TRANSITION_END) {
      // Transition stage (300-400vh): observation point Y moves from 0 to 1 (slightly higher at 400vh)
      lookAtY = lerpInRange(vh, STAGES.TRANSITION_START, STAGES.TRANSITION_END, 0, 1);
    } else if (vh < STAGES.PHASE2_SPACING_EXPAND_END) {
      // Spacing expansion period (400-600vh): observation point Y maintain at 1
      lookAtY = 1;
    } else {
      // Phase 4 (600vh+): observation point Y moves layer by layer (starting from 600vh, switch layer every 100vh)
      const phase4Start = STAGES.PHASE4_START;
      const layerDuration = 100; // Each layer lasts 100vh
      const layerCount = 7;
      const layerIndex = Math.min(layerCount - 1, Math.floor((vh - phase4Start) / layerDuration));
      const layerProgress = ((vh - phase4Start) % layerDuration) / layerDuration;
      
      // Calculate target layer's Y position (always use interpolation to ensure smoothness)
      const currentLayerY = layerIndex * 5;
      const nextLayerY = Math.min(layerCount - 1, layerIndex + 1) * 5;
      let targetLayerY = THREE.MathUtils.lerp(currentLayerY, nextLayerY, layerProgress);
      
      // At 600vh, smooth transition from 1 to layer 0's position (0)
      // Use 50vh transition period to ensure smooth connection
      const transitionDuration = 50;
      if (vh <= phase4Start + transitionDuration) {
        // 600-650vh: transition from 1 to targetLayerY (targetLayerY=0 at 600vh)
        lookAtY = lerpInRange(vh, phase4Start, phase4Start + transitionDuration, 1, targetLayerY);
      } else {
        // For the last layer (layer 6), add offset to center it vertically on screen
        const lastLayerY = (layerCount - 1) * 5; // Layer 6's Y position = 30
        const verticalCenterOffset = 1; // Offset to center layer 6 on screen
        
        // Smoothly apply offset: gradually increase offset from 1100vh, fully applied at 1200vh
        const lastLayerStartVh = phase4Start + (layerCount - 1) * layerDuration; // 1200vh
        const offsetTransitionStart = lastLayerStartVh - layerDuration; // 1100vh
        const offsetTransitionDuration = layerDuration; // 100vh
        
        if (vh >= offsetTransitionStart) {
          // 1100-1200vh: smoothly increase offset
          const offsetProgress = Math.min(1, (vh - offsetTransitionStart) / offsetTransitionDuration);
          const easedOffsetProgress = easeInOutCubic(offsetProgress);
          const appliedOffset = verticalCenterOffset * easedOffsetProgress;
          lookAtY = targetLayerY + appliedOffset;
        } else {
          lookAtY = targetLayerY;
        }
      }
    }
    
    // Calculate camera Y position (needs to follow observation point in Phase 4)
    let finalCameraY = cameraY;
    if (vh >= STAGES.PHASE4_START) {
      const phase4Start = STAGES.PHASE4_START;
      const layerDuration = 100; // Each layer lasts 100vh
      const layerCount = 7;
      const cameraOffsetY = 8;
      
      const layerIndex = Math.min(layerCount - 1, Math.floor((vh - phase4Start) / layerDuration));
      const layerProgress = ((vh - phase4Start) % layerDuration) / layerDuration;
      
      // Calculate target layer's Y position (always use interpolation to ensure smoothness)
      const currentLayerY = layerIndex * 5;
      const nextLayerY = Math.min(layerCount - 1, layerIndex + 1) * 5;
      let targetLayerY = THREE.MathUtils.lerp(currentLayerY, nextLayerY, layerProgress);
      
      // For the last layer (layer 6), add offset to center it vertically on screen
      const lastLayerY = (layerCount - 1) * 5; // Layer 6's Y position = 30
      const verticalCenterOffset = 1; // Offset to center layer 6 on screen
      
      // Smoothly apply offset: gradually increase offset from 1100vh, fully applied at 1200vh
      const lastLayerStartVh = phase4Start + (layerCount - 1) * layerDuration; // 1200vh
      const offsetTransitionStart = lastLayerStartVh - layerDuration; // 1100vh
      const offsetTransitionDuration = layerDuration; // 100vh
      
      let adjustedTargetLayerY = targetLayerY;
      if (vh >= offsetTransitionStart) {
        // 1100-1200vh: smoothly increase offset
        const offsetProgress = Math.min(1, (vh - offsetTransitionStart) / offsetTransitionDuration);
        const easedOffsetProgress = easeInOutCubic(offsetProgress);
        const appliedOffset = verticalCenterOffset * easedOffsetProgress;
        adjustedTargetLayerY = targetLayerY + appliedOffset;
      }
      
      const targetCameraY = adjustedTargetLayerY + cameraOffsetY;
      
      // Smooth transition from Y position at 600vh (7.5) to following observation point's Y position
      // At 600vh: Camera Y transitions from 7.5 to 8 (layer 0's Y=0, so cameraY=0+8=8)
      // During transition period (600-650vh), targetCameraY will change with layerProgress, need smooth transition
      const transitionDuration = 50;
      if (vh <= phase4Start + transitionDuration) {
        // Starting Camera Y value at 600vh (consistent with value at 400vh)
        const startCameraY = 7.5;
        // Use easing function for smooth transition
        const transitionProgress = (vh - phase4Start) / transitionDuration;
        const easedProgress = easeInOutCubic(transitionProgress);
        // Smooth transition from startCameraY to current targetCameraY
        finalCameraY = THREE.MathUtils.lerp(startCameraY, targetCameraY, easedProgress);
      } else {
        finalCameraY = targetCameraY;
      }
    }
    
    // Calculate zoom level
    const zoom = vh <= STAGES.TRANSITION_END
      ? lerpInRange(vh, STAGES.TRANSITION_START, STAGES.TRANSITION_END,
          VIEW_CONFIG.topView.zoom, VIEW_CONFIG.sideView.zoom)
      : VIEW_CONFIG.sideView.zoom;
    
    // Apply all calculated values
    camera.position.set(cameraX, finalCameraY, cameraZ);
    lookRef.current.set(lookAtX, lookAtY, lookAtZ);
    camera.zoom = zoom;
    // In transition stage and side view stage, up vector transitions from -Z axis (0,0,-1) back to default Y axis (0,1,0)
    if (vh <= STAGES.TRANSITION_END) {
      const upTransitionProgress = (vh - STAGES.TRANSITION_START) / (STAGES.TRANSITION_END - STAGES.TRANSITION_START);
      const easedUpProgress = easeInOutCubic(Math.max(0, Math.min(1, upTransitionProgress)));
      camera.up.set(
        THREE.MathUtils.lerp(0, 0, easedUpProgress),
        THREE.MathUtils.lerp(0, 1, easedUpProgress),
        THREE.MathUtils.lerp(-1, 0, easedUpProgress)
      );
    } else {
      // Side view stage, up vector restored to default Y axis
      camera.up.set(0, 1, 0);
    }
    camera.updateProjectionMatrix();
    camera.lookAt(lookRef.current);
    camera.updateMatrixWorld();
  });
  
  return null;
}

export default function GlobalCanvasContainer({ 
  activeSection, 
  scrollProgress5, 
  scrollProgress8, 
  mounted,
  layerInfo 
}) {
  // Canvas always renders, does not unmount based on activeSection
  // If no active section, can hide or show default content
  
  // Calculate effective scrollProgress:
  // - When section5 is active: use scrollProgress5
  // - When section8 is active: use scrollProgress8
  // - Other cases: if section5 is complete (scrollProgress5 = 1), maintain final state; otherwise use 0
  const getEffectiveScrollProgress = () => {
    if (activeSection === 'section5') {
      return scrollProgress5;
    } else if (activeSection === 'section8') {
      return scrollProgress8;
    } else {
      // If section5 is complete, maintain final state to avoid model suddenly disappearing
      if (scrollProgress5 >= 1) {
        return 1;
      }
      return 0;
    }
  };
  
  const effectiveScrollProgress = getEffectiveScrollProgress();
  // Determine effective activeSection: if section5 is complete but activeSection is null, use 'section5-final' marker
  const effectiveActiveSection = activeSection || (scrollProgress5 >= 1 ? 'section5-final' : null);
  
  return (
    <div 
      className="fixed top-0 left-0 w-full h-screen bg-black pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <Canvas
        dpr={[1, 2]} // 限制 pixel ratio 最高为 2
        gl={{ 
          antialias: true,
          alpha: false,
          sortObjects: true,
        }}
        style={{ 
          width: '100%',
          height: '100%',
        }}
      >
        <OrthographicCamera 
          makeDefault 
          position={[0, 15, 0]}
          zoom={250}
          near={0.1}
          far={1000}
        />

        {/* Debug: coordinate axis helper */}
        {/* <axesHelper args={[5]} /> */}

        {/* All 3D content always exists, control animation based on activeSection */}
        {mounted && (
          <>
            {/* Determine which scrollProgress to use based on activeSection */}
            <CameraRig 
              scrollProgress={effectiveScrollProgress}
              scrollProgress8={scrollProgress8}
              activeSection={effectiveActiveSection}
            />
            <ModelControls 
              scrollProgress={effectiveScrollProgress}
              activeSection={effectiveActiveSection}
            />
          </>
        )}

        <EffectComposer multisampling={0}>
          <Vignette
            eskil={false}
            offset={0.8}
            darkness={0.3}
          />
          {/* <Bloom 
            intensity={10.0} 
            luminanceThreshold={1.0} 
            luminanceSmoothing={0.9} 
          /> */}
        </EffectComposer>
      </Canvas>
    </div>
  );
}
