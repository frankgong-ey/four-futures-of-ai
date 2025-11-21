"use client";

import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, OrthographicCamera } from "@react-three/drei";
import { useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom, DepthOfField, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { LABEL_DATA } from "./MeshLabels";

// 阶段配置（使用实际 vh 值）- 移到文件顶部，供所有组件使用
const STAGES = {
  INITIAL_ANIMATION: 100,       // 初始动画阶段（0-100vh）：10个box聚集
  PHASE1_TOP_VIEW: 300,        // 第一阶段：俯视图（100-300vh）
  TRANSITION_START: 300,        // 过渡阶段开始（300vh）
  TRANSITION_END: 400,          // 过渡阶段结束（400vh）
  PHASE2_SPACING_EXPAND_END: 600, // 第二阶段：layer间距扩大期（400-600vh）
  PHASE3_LOOKAT_DOWN_END: 800, // 第三阶段结束（600-800vh）
  PHASE4_START: 600,           // 第四阶段开始：逐层聚焦（600vh+）
  PHASE5_X_OFFSET_START: 1500,  // 第五阶段开始：X轴偏移（1500vh+）
  // 第四阶段：逐层聚焦（600-1500vh）
  // 第五阶段：X轴偏移-100（1500vh+）
};

// Layer 默认 y 位置配置
const layerDefaultPositions = {
  layer1: 0,
  layer2: 0.2,
  layer3: 0.4,
  layer4: 0.6,
  layer5: 0.8,
  layer6: 1.0,
  layer7: 1.2,
};

// GLB 模型组件
function ValueBlueprintModel({ scrollProgress, activeSection }) {
  const { scene } = useGLTF('/models/value-blueprint5.glb');
  const meshRefs = useRef({});
  const originalPositions = useRef({});
  const layer1GroupRef = useRef(null);
  const layer2GroupRef = useRef(null);
  const layer3GroupRef = useRef(null);
  const layer4GroupRef = useRef(null);
  const layer5GroupRef = useRef(null);
  const layer6GroupRef = useRef(null);
  const layer7GroupRef = useRef(null);
  const aeGroupRef = useRef(null); // Agentic Enterprise group引用
  const blockGroupRef = useRef(null); // Block group引用（包含Cube247的mesh）
  const labelMeshRefs = useRef({}); // 存储标签相关的 mesh 引用
  const blockInstancedMeshRef = useRef(null); // Block InstancedMesh引用
  const blockInstanceDataRef = useRef(null); // Block实例数据（几何、材质等）
  const [blockInstanceReady, setBlockInstanceReady] = useState(false); // 标记实例数据是否准备好
  const linesGeometryRef = useRef(null); // 线段几何体引用（用于动态更新）
  const linesMaterialRef = useRef(null); // 线段材质引用
  const linePointsXZRef = useRef(null); // 存储线段的XZ坐标（固定不变）
  const lineSegmentsRef = useRef(null); // 线段渲染引用
  // 不再需要记录动画状态，使用当前vh值实现可逆动画
  const instanceBaseMatricesRef = useRef([]); // 存储每个实例的基础矩阵（包含位置和镜像变换）
  
  // 优化：复用对象，避免在 useFrame 中创建新对象
  const tempVector3Ref = useRef(new THREE.Vector3());
  const tempQuaternionRef = useRef(new THREE.Quaternion());
  const tempScaleRef = useRef(new THREE.Vector3());
  const tempMatrixRef = useRef(new THREE.Matrix4());
  const cachedMeshesRef = useRef([]); // 缓存所有 mesh，避免每帧遍历 scene
  const lastActiveSectionRef = useRef(null); // 缓存上次的 activeSection
  const layerScaleRef = useRef(new THREE.Vector3(1, 1, 1)); // 复用scale对象，用于layer groups的scale动画

  // 缓动函数：三次缓入缓出
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
      
      // 创建Agentic Enterprise group，包含所有带有"ae"的mesh
      const aeGroup = new THREE.Group();
      aeGroup.name = 'aeGroup';
      const aeMeshes = [];
      
      // 收集所有 layer groups
      const layerGroupsForAESearch = [
        layer1Group, layer2Group, layer3Group, layer4Group,
        layer5Group, layer6Group, layer7Group
      ].filter(Boolean);
      
      // 先打印所有 mesh 的名字，用于调试
      console.log('=== 所有 mesh 名称列表 ===');
      const allMeshes = [];
      scene.traverse((child) => {
        if (child.isMesh) {
          const meshName = child.name || child.uuid;
          allMeshes.push(meshName);
        }
      });
      console.log('所有 mesh 名称:', allMeshes);
      console.log('包含 "ae" 的 mesh:', allMeshes.filter(name => name.toLowerCase().includes('ae')));
      console.log('包含 "ball" 的 mesh:', allMeshes.filter(name => name.toLowerCase().includes('ball')));
      console.log('=== mesh 名称列表结束 ===');
      
      // 从 scene 和所有 layer groups 中查找包含 "ae" 的 mesh
      const searchInObject = (obj) => {
        obj.traverse((child) => {
          if (child.isMesh) {
            const meshName = child.name || child.uuid;
            const nameLower = meshName.toLowerCase();
            
            // 检查是否包含"ae"（不区分大小写）
            if (nameLower.includes('ae')) {
              // 避免重复添加
              if (!aeMeshes.includes(child)) {
                aeMeshes.push(child);
                console.log(`找到 ae mesh: "${meshName}" (来自: ${obj.name || 'scene'})`);
              }
            }
          }
        });
      };
      
      // 先搜索 scene
      searchInObject(scene);
      
      // 再搜索所有 layer groups
      layerGroupsForAESearch.forEach(group => {
        searchInObject(group);
      });
      
      // 将ae相关的mesh添加到aeGroup
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
        
        // 打印 aeGroup 中的所有 mesh
        console.log('=== aeGroup 中的 mesh 列表 ===');
        console.log(`总共有 ${aeGroup.children.length} 个子对象`);
        aeGroup.children.forEach((child, index) => {
          if (child.isMesh) {
            console.log(`${index + 1}. Mesh名称: "${child.name || child.uuid}", 类型: Mesh`);
          } else {
            console.log(`${index + 1}. 子对象名称: "${child.name || child.uuid}", 类型: ${child.type}`);
          }
        });
        console.log('=== aeGroup mesh 列表结束 ===');
      }
      
      // 查找标签相关的 mesh - 从 LABEL_DATA 中获取所有 mesh 名称
      const labelMeshNames = LABEL_DATA.map(item => item.meshName);
      console.log('查找标签 mesh 名称列表:', labelMeshNames);
      
      scene.traverse((child) => {
        if (child.isMesh) {
          const meshName = child.name || child.uuid;
          // 检查精确匹配或大小写不敏感的匹配
          const matchedName = labelMeshNames.find(labelName => 
            meshName === labelName || 
            meshName.toLowerCase() === labelName.toLowerCase() ||
            meshName.replace(/\./g, '') === labelName.replace(/\./g, '') // 处理点号的差异
          );
          
          if (matchedName) {
            labelMeshRefs.current[matchedName] = child;
            console.log(`找到标签 mesh: "${meshName}" -> 匹配到 "${matchedName}"`);
          }
        }
      });
      
      // 创建Block group，包含所有名字带有"Cube247"的mesh
      const blockGroup = new THREE.Group();
      blockGroup.name = 'blockGroup';
      const blockMeshes = [];
      
      scene.traverse((child) => {
        if (child.isMesh) {
          const meshName = child.name || child.uuid;
          const nameLower = meshName.toLowerCase();
          
          // 检查是否包含"Cube247"（不区分大小写）
          if (nameLower.includes('cube247')) {
            blockMeshes.push(child);
          }
        }
      });
      
      // 调试信息：打印找到的block mesh
      if (blockMeshes.length > 0) {
        console.log(`找到 ${blockMeshes.length} 个Cube247 mesh:`, blockMeshes.map(m => m.name));
      } else {
        console.log('未找到Cube247 mesh');
      }
      
      // 将Cube247相关的mesh添加到blockGroup
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
        
        // 为InstancedMesh准备数据：合并blockGroup中所有mesh的几何体
        // 使用之前保存的blockMeshTransforms来获取正确的变换
        if (blockMeshes.length > 0 && blockMeshTransforms.length > 0) {
          // 合并所有mesh的几何体
          const geometries = [];
          const mergedMaterials = [];
          
          blockMeshTransforms.forEach(({ mesh, worldPos, worldQuat, worldScale }, index) => {
            const geometry = mesh.geometry.clone();
            const materials = Array.isArray(mesh.material) 
              ? mesh.material 
              : [mesh.material];
            
            // 创建变换矩阵（相对于blockWorldPos）
            const transformMatrix = new THREE.Matrix4();
            transformMatrix.compose(
              worldPos.clone().sub(blockWorldPos), // 相对位置
              worldQuat,
              worldScale
            );
            
            // 应用变换矩阵到几何体
            geometry.applyMatrix4(transformMatrix);
            geometries.push(geometry);
            
            // 收集材质（使用第一个mesh的材质）
            if (index === 0) {
              materials.forEach((material) => {
                mergedMaterials.push(material.clone());
              });
            }
          });
          
          // 合并所有几何体
          let mergedGeometry = geometries[0];
          if (geometries.length > 1) {
            // 手动合并几何体（不使用BufferGeometryUtils）
            // 合并顶点、索引等属性
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
                // 如果没有索引，直接使用顶点索引
                for (let i = 0; i < positions.count; i++) {
                  mergedIndices.push(vertexOffset + i);
                }
              }
              
              vertexOffset += positions.count;
            });
            
            // 设置合并后的属性
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
          
          // 如果没有材质，使用默认材质
          if (mergedMaterials.length === 0) {
            mergedMaterials.push(new THREE.MeshStandardMaterial({ color: 0xffffff }));
          }
          
          // InstancedMesh只需要单个材质（使用第一个材质）
          const instancedMaterial = mergedMaterials[0] || new THREE.MeshStandardMaterial({ color: 0xffffff });
          
          // 调试信息
          console.log(`BlockGroup: 找到 ${blockMeshes.length} 个mesh，合并后几何体顶点数: ${mergedGeometry.attributes.position.count}，使用材质:`, instancedMaterial);
          
          // 计算blockGroup的边界框来确定间距
          const blockBox = new THREE.Box3().setFromObject(blockGroup);
          const blockSize = blockBox.getSize(new THREE.Vector3());
          
          // 使用固定的很小间距，让实例紧挨着排列
          // 直接使用边界框大小 + 很小的间隙
          let spacingX = blockSize.x > 0 ? blockSize.x + 0.1 : 0.5; // X方向：边界框宽度 + 0.1
          let spacingZ = blockSize.z > 0 ? blockSize.z + 0.1 : 0.5; // Z方向：边界框深度 + 0.1
          
          // 2x2网格 = 4个实例
          const instanceCount = 4;
          const gridSize = 2;
          
          console.log(`BlockGroup间距计算: blockSize=(${blockSize.x.toFixed(2)}, ${blockSize.y.toFixed(2)}, ${blockSize.z.toFixed(2)}), spacingX=${spacingX.toFixed(2)}, spacingZ=${spacingZ.toFixed(2)}`);
          
          // 存储实例数据
          blockInstanceDataRef.current = {
            geometry: mergedGeometry,
            material: instancedMaterial, // 使用单个材质
            instanceCount: instanceCount,
            spacingX: spacingX,
            spacingZ: spacingZ,
            gridSize: gridSize,
          };
          
          // 标记实例数据已准备好
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
      
      // 创建相邻layer之间的连接线段：layer1底部到layer2底部，layer2底部到layer3底部，...到layer6底部到layer7底部
      // 共6段，每段10条线，总共60条线，每条线都有渐变色（从底部layer颜色到顶部layer颜色）
      const allLayerGroups = [
        layer1GroupRef.current,
        layer2GroupRef.current,
        layer3GroupRef.current,
        layer4GroupRef.current,
        layer5GroupRef.current,
        layer6GroupRef.current,
        layer7GroupRef.current,
      ];
      
      // 定义每个layer的颜色
      const layerColors = [
        new THREE.Color(0xffeb3b), // Layer 1: 黄色
        new THREE.Color(0xffa726), // Layer 2: 橙黄色
        new THREE.Color(0xff5722), // Layer 3: 橙红色
        new THREE.Color("#6A1A59"), // Layer 4: 梅紫色 (plum)
        new THREE.Color(0x2196f3), // Layer 5: 蓝色
        new THREE.Color(0x388e3c), // Layer 6: 深绿色
        new THREE.Color(0x4dd0e1), // Layer 7: 薄荷色
      ];
      
      // 检查所有layer groups是否都存在
      const allLayersExist = allLayerGroups.every(layer => layer !== null);
      
      if (allLayersExist) {
        // 计算layer1的边界框来确定XZ坐标分布
        const layer1Box = new THREE.Box3().setFromObject(allLayerGroups[0]);
        const layer1MinX = layer1Box.min.x;
        const layer1MaxX = layer1Box.max.x;
        const layer1MinZ = layer1Box.min.z;
        const layer1MaxZ = layer1Box.max.z;
        
        // 在layer1的底面区域内均匀分布10个点
        const lineCountPerSegment = 10;
        const totalSegments = 6; // layer1->2, layer2->3, ..., layer6->7
        const totalLineCount = lineCountPerSegment * totalSegments; // 60条线
        
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
        
        // 存储XZ坐标供useFrame使用（每段都使用相同的XZ坐标）
        linePointsXZRef.current = xzPoints;
        
        // 创建所有线段的几何体（Y坐标会在useFrame中动态更新）
        const initialPoints = [];
        const initialColors = [];
        
        // 创建6段线条：layer1->2, layer2->3, ..., layer6->7
        for (let segmentIndex = 0; segmentIndex < totalSegments; segmentIndex++) {
          const bottomLayerIndex = segmentIndex; // 底部layer索引
          const topLayerIndex = segmentIndex + 1; // 顶部layer索引
          
          const bottomColor = layerColors[bottomLayerIndex];
          const topColor = layerColors[topLayerIndex];
          
          // 获取当前段的layer边界框（初始值，会在useFrame中更新）
          const bottomLayerBox = new THREE.Box3().setFromObject(allLayerGroups[bottomLayerIndex]);
          const topLayerBox = new THREE.Box3().setFromObject(allLayerGroups[topLayerIndex]);
          
          // 为这段的每条线创建起点和终点
          for (const { x, z } of xzPoints) {
            // 起点：底部layer的底面
            initialPoints.push(new THREE.Vector3(x, bottomLayerBox.min.y, z));
            initialColors.push(bottomColor.r, bottomColor.g, bottomColor.b);
            
            // 终点：顶部layer的底面
            initialPoints.push(new THREE.Vector3(x, topLayerBox.min.y, z));
            initialColors.push(topColor.r, topColor.g, topColor.b);
          }
        }
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(initialPoints);
        
        // 添加颜色属性（实现渐变色）
        lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(initialColors, 3));
        
        // 添加linePosition属性：用于在shader中计算opacity渐变（0=起点，1=终点）
        const linePositions = [];
        const totalLines = lineCountPerSegment * totalSegments; // 60条线
        
        for (let i = 0; i < totalLines; i++) {
          // 每条线有两个点：起点和终点
          linePositions.push(0.0); // 起点：opacity = 0
          linePositions.push(1.0); // 终点：opacity = 0
        }
        
        lineGeometry.setAttribute('linePosition', new THREE.Float32BufferAttribute(linePositions, 1));
        
        linesGeometryRef.current = lineGeometry;
        
        // 创建自定义ShaderMaterial实现两端到中间的opacity渐变
        const lineMaterial = new THREE.ShaderMaterial({
          vertexShader: `
            // color 属性由 Three.js 自动提供（vertexColors: true）
            attribute float linePosition;
            varying vec3 vColor;
            varying float vLinePosition;
            
            void main() {
              vColor = color; // 使用 Three.js 提供的 color 属性
              vLinePosition = linePosition;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            varying vec3 vColor;
            varying float vLinePosition;
            
            void main() {
              // 计算opacity：中间（0.5）是1，两端（0和1）是0
              // 使用平滑的曲线：1 - 4 * (position - 0.5)^2
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

  // 初始化InstancedMesh的位置（4x4网格）- 只在数据准备好时执行一次
  useEffect(() => {
    if (blockInstancedMeshRef.current && blockInstanceDataRef.current && blockInstanceReady) {
      const instanceData = blockInstanceDataRef.current;
      
      // 计算网格中心偏移（使网格以原点为中心）
      const centerOffsetX = (instanceData.gridSize - 1) * instanceData.spacingX / 2;
      const centerOffsetZ = (instanceData.gridSize - 1) * instanceData.spacingZ / 2;
      
      const positions = [];
      let instanceIndex = 0;
      
      // 创建4x4网格
      for (let row = 0; row < instanceData.gridSize && instanceIndex < instanceData.instanceCount; row++) {
        for (let col = 0; col < instanceData.gridSize && instanceIndex < instanceData.instanceCount; col++) {
          const x = col * instanceData.spacingX - centerOffsetX;
          const z = row * instanceData.spacingZ - centerOffsetZ;
          
          positions.push({ x, z, row, col, instanceIndex });
          
          // 每次都创建新的矩阵，避免重用导致的问题
          const matrix = new THREE.Matrix4();
          
          // 对第二个实例（instanceIndex === 1）进行X轴镜像
          if (instanceIndex === 1) {
            // 先创建镜像矩阵（X轴翻转）
            const scaleMatrix = new THREE.Matrix4();
            scaleMatrix.makeScale(-1, 1, 1);
            
            // 再创建平移矩阵
            const translationMatrix = new THREE.Matrix4();
            translationMatrix.makeTranslation(x, 0, z);
            
            // 组合：先镜像，再平移
            matrix.multiplyMatrices(translationMatrix, scaleMatrix);
          } 
          // 对第三个实例（instanceIndex === 2）进行Z轴镜像
          else if (instanceIndex === 2) {
            // 先创建镜像矩阵（Z轴翻转）
            const scaleMatrix = new THREE.Matrix4();
            scaleMatrix.makeScale(1, 1, -1);
            
            // 再创建平移矩阵
            const translationMatrix = new THREE.Matrix4();
            translationMatrix.makeTranslation(x, 0, z);
            
            // 组合：先镜像，再平移
            matrix.multiplyMatrices(translationMatrix, scaleMatrix);
          }
          // 对第四个实例（instanceIndex === 3）进行X轴和Z轴镜像（同时）
          else if (instanceIndex === 3) {
            // 先创建镜像矩阵（X轴和Z轴同时翻转）
            const scaleMatrix = new THREE.Matrix4();
            scaleMatrix.makeScale(-1, 1, -1);
            
            // 再创建平移矩阵
            const translationMatrix = new THREE.Matrix4();
            translationMatrix.makeTranslation(x, 0, z);
            
            // 组合：先镜像，再平移
            matrix.multiplyMatrices(translationMatrix, scaleMatrix);
          } else {
            // 其他实例正常处理（只平移）
            matrix.makeTranslation(x, 0, z);
          }
          
          blockInstancedMeshRef.current.setMatrixAt(instanceIndex, matrix);
          
          // 保存基础矩阵（用于后续在useFrame中只更新scale）
          instanceBaseMatricesRef.current[instanceIndex] = matrix.clone();
          
          instanceIndex++;
        }
      }
      
      // 确保实例数量正确
      blockInstancedMeshRef.current.count = instanceIndex;
      blockInstancedMeshRef.current.instanceMatrix.needsUpdate = true;
      
      console.log(`InstancedMesh位置初始化完成: ${instanceIndex}个实例 (2x2网格)`, {
        spacingX: instanceData.spacingX,
        spacingZ: instanceData.spacingZ,
        gridSize: instanceData.gridSize,
        instanceCount: instanceData.instanceCount,
        actualCount: instanceIndex,
        positions: positions, // 显示所有位置用于调试
      });
    }
  }, [blockInstanceReady]); // 当实例数据准备好时初始化

  // 缓存所有 mesh，避免每帧遍历 scene
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
      // Section8使用独立的逻辑：使用InstancedMesh显示4x4网格的blockGroup复制
      if (activeSection === 'section8') {
        // 只在 activeSection 改变时更新可见性
        if (lastActiveSectionRef.current !== 'section8') {
          // 隐藏原始的blockGroup
          if (blockGroupRef.current) {
            blockGroupRef.current.visible = false;
          }
          
          // 隐藏白色线条
          if (lineSegmentsRef.current) {
            lineSegmentsRef.current.visible = false;
          }
          
          // 使用缓存的 mesh 列表，避免每帧遍历 scene
          const meshes = cachedMeshesRef.current;
          for (let i = 0; i < meshes.length; i++) {
            meshes[i].visible = false;
          }
          
          lastActiveSectionRef.current = 'section8';
        }
        
        // 确保InstancedMesh可见并正确设置
        if (blockInstancedMeshRef.current && blockInstanceDataRef.current) {
          blockInstancedMeshRef.current.visible = true;
          
          // 确保实例数量正确
          blockInstancedMeshRef.current.count = blockInstanceDataRef.current.instanceCount;
          
          // 计算当前的vh值（Section8高度是300vh，scrollProgress是0-1）
          const currentVh = (scrollProgress || 0) * 300;
          
          // 控制实例的显示/隐藏：基于当前vh值（可逆动画）
          // 最初只显示第一个实例（instanceIndex 0）
          // 当vh到达100vh时，依次显示第二、三、四个实例
          // 向上滑动时会重新隐藏（可逆动画）
          
          const triggerVh = 100; // 触发动画的vh值
          const animationDuration = 50; // 每个实例出现的动画时长（vh）
          
          // 定义每个实例的触发时间
          const instanceTriggers = [
            0,      // 实例0：立即显示
            triggerVh,                    // 实例1：在100vh显示
            triggerVh + animationDuration,    // 实例2：在150vh显示
            triggerVh + animationDuration * 2  // 实例3：在200vh显示
          ];
          
          // 使用当前vh值（不是最大vh值），实现可逆动画
          const displayVh = currentVh;
          const instanceData = blockInstanceDataRef.current;
          
          // 根据vh值更新每个实例的可见性（只修改scale）
          // 优化：复用对象，避免在循环中创建新对象
          const position = tempVector3Ref.current;
          const rotation = tempQuaternionRef.current;
          const baseScale = tempScaleRef.current;
          const finalMatrix = tempMatrixRef.current;
          
          for (let i = 0; i < instanceData.instanceCount; i++) {
            const shouldShow = displayVh >= instanceTriggers[i];
            
            if (instanceBaseMatricesRef.current[i]) {
              // 从基础矩阵提取位置、旋转和原始scale（复用对象）
              instanceBaseMatricesRef.current[i].decompose(position, rotation, baseScale);
              
              // 根据可见性设置最终scale
              // 需要保存原始 scale，因为 baseScale 会被修改
              const originalScaleX = baseScale.x;
              const originalScaleY = baseScale.y;
              const originalScaleZ = baseScale.z;
              
              if (!shouldShow) {
                baseScale.set(0, 0, 0);
              }
              
              // 组合最终矩阵并更新（复用对象）
              finalMatrix.compose(position, rotation, baseScale);
              blockInstancedMeshRef.current.setMatrixAt(i, finalMatrix);
              
              // 恢复原始 scale（为下次使用准备）
              baseScale.set(originalScaleX, originalScaleY, originalScaleZ);
            }
          }
          
          // 标记矩阵需要更新
          if (blockInstancedMeshRef.current.instanceMatrix) {
            blockInstancedMeshRef.current.instanceMatrix.needsUpdate = true;
          }
          
          // 调试信息（只在第一次时打印）
          if (!blockInstancedMeshRef.current._debugLogged) {
            console.log('Section8 InstancedMesh状态:', {
              visible: blockInstancedMeshRef.current.visible,
              currentVh: currentVh,
              instanceCount: blockInstancedMeshRef.current.count,
            });
            blockInstancedMeshRef.current._debugLogged = true;
          }
        } else {
          console.warn('Section8: blockInstancedMeshRef.current 或 blockInstanceDataRef.current 不存在');
        }
        
        return;
    }
    
    // Section5的原有逻辑
    const progress = scrollProgress || 0;
    const vh = progress * 1300;
    
    // 恢复所有mesh的可见性（从section8回滚时恢复）
    // 优化：只在 activeSection 改变时更新可见性，使用缓存的 mesh 列表
    if (lastActiveSectionRef.current !== 'section5') {
      const meshes = cachedMeshesRef.current;
      const blockGroupChildren = blockGroupRef.current ? new Set(blockGroupRef.current.children) : new Set();
      
      for (let i = 0; i < meshes.length; i++) {
        const mesh = meshes[i];
        // 恢复mesh的可见性（除了blockGroup，它会单独控制）
        if (!blockGroupChildren.has(mesh)) {
          mesh.visible = true;
        }
      }
      
      lastActiveSectionRef.current = 'section5';
    }
    
    // 控制layer groups的显示
    const layerGroups = [
      { ref: layer1GroupRef, name: 'layer1Group', index: 0 },
      { ref: layer2GroupRef, name: 'layer2Group', index: 1 },
      { ref: layer3GroupRef, name: 'layer3Group', index: 2 },
      { ref: layer4GroupRef, name: 'layer4Group', index: 3 },
      { ref: layer5GroupRef, name: 'layer5Group', index: 4 },
      { ref: layer6GroupRef, name: 'layer6Group', index: 5 },
      { ref: layer7GroupRef, name: 'layer7Group', index: 6 },
    ];
    
    // 0-200vh：layer和attach的group都不可见，200vh以后才可见
    // 200-210vh：快速scale入场动画（从0到1）
    const layerAnimationStart = 200;
    const layerAnimationDuration = 10; // 10vh的动画时长
    const layerAnimationEnd = layerAnimationStart + layerAnimationDuration;
    
    const shouldShowLayers = vh > layerAnimationStart;
    let layerScale = 1;
    
    if (vh >= layerAnimationStart && vh <= layerAnimationEnd) {
      // 计算scale进度（0到1）
      const scaleProgress = (vh - layerAnimationStart) / layerAnimationDuration;
      // 使用easeOutCubic缓动函数，让动画更自然
      const easedProgress = 1 - Math.pow(1 - scaleProgress, 3);
      layerScale = easedProgress;
    } else if (vh < layerAnimationStart) {
      layerScale = 0;
    }
    
    layerGroups.forEach(({ ref }) => {
      if (ref.current) {
        ref.current.visible = shouldShowLayers;
        // 应用scale动画（复用对象，避免创建新Vector3）
        layerScaleRef.current.set(layerScale, layerScale, layerScale);
        ref.current.scale.copy(layerScaleRef.current);
      }
    });
    
    // 恢复aeGroup的可见性（如果有）
    if (aeGroupRef.current) {
      aeGroupRef.current.visible = true;
    }
    
    // Section5中：blockGroup不可见（只在section8显示）
    if (blockGroupRef.current) {
      blockGroupRef.current.visible = false;
    }
    
    // 0-200vh：白色线条不可见
    if (lineSegmentsRef.current) {
      lineSegmentsRef.current.visible = vh > 200;
    }
    
    let layerSpacing = 0.2;
    
    if (vh < 300) {
      // 0-300vh：保持最小的spacing
      layerSpacing = 0.2;
    } else if (vh < 400) {
      // 300-400vh：保持0.2
      layerSpacing = 0.2;
    } else if (vh < STAGES.PHASE2_SPACING_EXPAND_END) {
      // 400-600vh：layer间距扩大期，从0.2扩大到5
      const spacingProgress = (vh - 400) / 200; // 0-1
      layerSpacing = THREE.MathUtils.lerp(0.2, 5, spacingProgress);
    } else {
      // 600vh+：保持5（进入逐层查看阶段）
      layerSpacing = 5;
    }
    
    // 使用 originalPositions 中保存的初始位置，这些位置来自 layerDefaultPositions
    const layer1BaseY = originalPositions.current['layer1Group'] || layerDefaultPositions.layer1;
    
    layerGroups.forEach(({ ref, name, index }) => {
      if (ref.current && ref.current.children.length > 0) {
        // 获取该层的原始位置（来自 layerDefaultPositions）
        const originalY = originalPositions.current[name] || layerDefaultPositions[`layer${index + 1}`];
        
        if (index === 0) {
          // Layer1 保持原始位置，在此基础上应用 layerSpacing
          ref.current.position.y = originalY;
        } else {
          // 其他层：从原始位置开始，根据 layerSpacing 调整
          // 计算相对于 layer1 的偏移
          const relativeOffset = (originalY - layer1BaseY) + (index * layerSpacing);
          ref.current.position.y = layer1BaseY + relativeOffset;
        }
      }
    });
    
    // 更新线段端点位置，使其与layer位置保持同步（6段，每段10条线，共60条）
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
        // 定义每个layer的颜色
        const layerColors = [
          new THREE.Color(0xffeb3b), // Layer 1: 黄色
          new THREE.Color(0xffa726), // Layer 2: 橙黄色
          new THREE.Color(0xff5722), // Layer 3: 橙红色
          new THREE.Color("#6A1A59"), // Layer 4: 梅紫色 (plum)
          new THREE.Color(0x2196f3), // Layer 5: 蓝色
          new THREE.Color(0x388e3c), // Layer 6: 深绿色
          new THREE.Color(0x4dd0e1), // Layer 7: 薄荷色
        ];
        
        const lineCountPerSegment = linePointsXZRef.current.length; // 10
        const totalSegments = 6; // layer1->2, layer2->3, ..., layer6->7
        
        // 更新几何体的顶点位置和颜色
        const positions = linesGeometryRef.current.attributes.position;
        const colors = linesGeometryRef.current.attributes.color;
        
        if (positions && colors) {
          const positionArray = positions.array;
          const colorArray = colors.array;
          let idx = 0;
          let colorIdx = 0;
          
          // 更新每段线条的位置和颜色
          for (let segmentIndex = 0; segmentIndex < totalSegments; segmentIndex++) {
            const bottomLayerIndex = segmentIndex;
            const topLayerIndex = segmentIndex + 1;
            
            // 获取当前段的layer边界框
            const bottomLayerBox = new THREE.Box3().setFromObject(allLayerGroups[bottomLayerIndex]);
            const topLayerBox = new THREE.Box3().setFromObject(allLayerGroups[topLayerIndex]);
            
            const bottomMinY = bottomLayerBox.min.y;
            const topMinY = topLayerBox.min.y;
            
            const bottomColor = layerColors[bottomLayerIndex];
            const topColor = layerColors[topLayerIndex];
            
            // 更新这段的每条线
            for (const { x, z } of linePointsXZRef.current) {
              // 起点：底部layer的底面
              positionArray[idx++] = x;
              positionArray[idx++] = bottomMinY;
              positionArray[idx++] = z;
              colorArray[colorIdx++] = bottomColor.r;
              colorArray[colorIdx++] = bottomColor.g;
              colorArray[colorIdx++] = bottomColor.b;
              
              // 终点：顶部layer的底面
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
      {/* 相邻layer之间的60条渐变色线段（6段，每段10条线，每段从底部layer颜色渐变到顶部layer颜色） */}
      {linesGeometryRef.current && linesMaterialRef.current && (
        <lineSegments
          ref={lineSegmentsRef}
          geometry={linesGeometryRef.current}
          material={linesMaterialRef.current}
          renderOrder={1000}
          frustumCulled={false}
        />
      )}
      
      {/* Section8的InstancedMesh：4x4网格的blockGroup复制 */}
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
      
      {/* 2D 标签坐标计算组件 - 只在 0-100vh 显示 */}
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

// 标签坐标计算组件 - 将 3D 坐标转换为 2D 屏幕坐标
function LabelPositionCalculator({ labelMeshRefs, showLabels }) {
  const { camera, size } = useThree();
  const positionsRef = useRef({});
  const rafIdRef = useRef(null);
  // 优化：复用 Vector3 对象，避免每帧创建新对象
  const worldPosRef = useRef(new THREE.Vector3());
  
  useFrame(() => {
    if (!showLabels) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }
    
    // 优化：复用 positions 对象，只在需要时创建新对象
    const positions = positionsRef.current;
    const worldPos = worldPosRef.current;
    
    LABEL_DATA.forEach(({ meshName }) => {
      const mesh = labelMeshRefs[meshName];
      if (mesh) {
        mesh.updateMatrixWorld();
        // 复用 Vector3 对象
        mesh.getWorldPosition(worldPos);
        
        // 将 3D 世界坐标转换为 2D 屏幕坐标
        worldPos.project(camera);
        
        // 转换为屏幕像素坐标
        const x = (worldPos.x * 0.5 + 0.5) * size.width;
        const y = (worldPos.y * -0.5 + 0.5) * size.height; // Y 轴需要翻转
        
        // 标签位置在物体下方一点（向下偏移 40px）
        // 直接更新现有对象，避免创建新对象
        if (!positions[meshName]) {
          positions[meshName] = { x: 0, y: 0 };
        }
        positions[meshName].x = x + 5;
        positions[meshName].y = y + 40;
      }
    });
    
    // 使用 requestAnimationFrame 来更新，避免在 useFrame 中直接调用 setState
    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(() => {
        window.dispatchEvent(new CustomEvent('meshLabelPositions', { 
          detail: positionsRef.current 
        }));
        rafIdRef.current = null;
      });
    }
  });
  
  return null; // 这个组件不渲染任何内容，只计算坐标
}

function ModelControls({ scrollProgress, activeSection }) {
  const { scene } = useGLTF('/models/value-blueprint3.glb');
  // activeSection 可能是 'section5', 'section8', 'section5-final', 或 null
  // 'section5-final' 表示保持 section5 的最终状态
  const effectiveProgress = activeSection ? (scrollProgress || 0) : 0;
  return <ValueBlueprintModel scrollProgress={effectiveProgress} activeSection={activeSection} />;
}

function CameraRig({ scrollProgress = 0, scrollProgress8 = 0, activeSection }) {
  const { camera } = useThree();
  // activeSection 可能是 'section5', 'section8', 'section5-final', 或 null
  // 'section5-final' 表示保持 section5 的最终状态，此时 scrollProgress 应该是 1
  const effectiveProgress = activeSection ? scrollProgress : 0;
  const lookRef = useRef(new THREE.Vector3(0, 0, 0));
  const initializedRef = useRef(false);
  
  // 摄像机视图配置
  const VIEW_CONFIG = {
    // 俯视图配置（第一阶段：0-300vh）- 从Y轴上方往下看，画面中左右是X轴，上下是Z轴
    topView: {
      position: { x: 0, y: 15, z: 0 },
      lookAt: { x: 0, y: 0, z: 0 },
      up: { x: 0, y: 0, z: -1 }, // 设置up向量为-Z轴，使画面中上下是Z轴
      zoom: 200,
    },
    // 侧视图配置（第二阶段及之后）
    sideView: {
      position: { x: 1, y: 7, z: 10 },
      zoom: 200,
    },
  };
  
  // 缓动函数：三次缓入缓出
  const easeInOutCubic = (t) => {
    const clampedT = Math.max(0, Math.min(1, t));
    return clampedT < 0.5
      ? 4 * clampedT * clampedT * clampedT
      : 1 - Math.pow(-2 * clampedT + 2, 3) / 2;
  };
  
  // 辅助函数：计算进度并应用缓动
  const getEasedProgress = (vh, start, end, delay = 0) => {
    const progress = Math.max(0, Math.min(1, (vh - start) / (end - start)));
    if (delay > 0 && progress < delay) return 0;
    const adjustedProgress = delay > 0 ? (progress - delay) / (1 - delay) : progress;
    return easeInOutCubic(Math.max(0, Math.min(1, adjustedProgress)));
  };
  
  // 辅助函数：在范围内插值
  const lerpInRange = (vh, start, end, from, to, delay = 0) => {
    const t = getEasedProgress(vh, start, end, delay);
    return THREE.MathUtils.lerp(from, to, t);
  };
  
  useEffect(() => {
    if (camera.isOrthographicCamera && !initializedRef.current) {
      // 初始化 camera = sideView 的初始姿态，但y位置更高，x位置往-x方向移动，zoom out一点
      const { position, zoom } = VIEW_CONFIG.sideView;
      const initialY = position.y - 1; // y位置更高（从 -4 改为 -1，提高3个单位）
      const initialX = position.x - 1; // x位置往-x方向移动1个单位
      const initialZoom = zoom * 0.5; // zoom out更多（zoom值更小，物体更小）
      
      camera.position.set(initialX, initialY, position.z);
      lookRef.current.set(-1.5 - 1, 1.5 - 4, 0); // 侧视图观察点，x位置往-x方向移动1个单位，y位置不变（保持 1.5 - 4）
      camera.zoom = initialZoom;
      camera.updateProjectionMatrix();
      camera.lookAt(lookRef.current);
      camera.updateMatrixWorld();
      
      initializedRef.current = true;
    }
  }, [camera]);
  
  useFrame(() => {
    if (!camera.isOrthographicCamera || !initializedRef.current) return;
    
    // Section8使用独立的逻辑：isometric view观察blockGroup
    if (activeSection === 'section8') {
      // 经典的isometric view：从等轴角度观察原点
      // 位置在等轴角度（约35.264度），观察点在(0,0,0)
      // 0-100vh：从X轴偏移-100平滑过渡到-2
      // 100vh+：保持在-2
      const currentVh = (scrollProgress8 || 0) * 300; // Section8高度是300vh
      const isometricDistance = 15; // 等轴视图距离
      
      // 根据vh决定X轴和Z轴偏移：0vh时X轴偏移-100，100vh时X轴过渡到-2，Z轴过渡到+2
      let xOffset = 0;
      let zOffset = 0;
      if (currentVh < 100) {
        // 0-100vh：X轴从-100平滑过渡到-2，Z轴从0过渡到+2
        const transitionProgress = currentVh / 100; // 0-1
        const easedProgress = easeInOutCubic(transitionProgress);
        xOffset = THREE.MathUtils.lerp(-100, -2, easedProgress);
        zOffset = THREE.MathUtils.lerp(0, 2, easedProgress); // Z轴从0过渡到+2
      } else {
        // 100vh+：X轴保持在-2，Z轴保持在+2
        xOffset = -2;
        zOffset = 2; // Z轴保持在+2
      }
      
      const isometricX = isometricDistance + xOffset;
      const isometricY = isometricDistance;
      const isometricZ = isometricDistance + zOffset;
      
      camera.position.set(isometricX, isometricY, isometricZ);
      lookRef.current.set(xOffset, 0, zOffset); // 观察点X和Z轴同样根据vh过渡
      camera.zoom = 100; // isometric view的zoom值
      camera.updateProjectionMatrix();
      camera.lookAt(lookRef.current);
      camera.updateMatrixWorld();
      return;
    }
    
    // 方案 B：effectiveProgress === 0 时完全跳过动画逻辑，保持初始化姿态
    if (effectiveProgress === 0) {
      return;
    }
    
    const globalProgress = Math.max(0, Math.min(1, effectiveProgress || 0));
    const vh = globalProgress * 1300; // 总滚动高度（vh单位）
    
    // ========== 0-100vh：保持侧视图，摄像头不变 ==========
    if (vh <= 100) {
      // 保持初始化状态（侧视图，y位置更高，x位置往-x方向移动，zoom out一点），不做任何动画
      const { position, zoom } = VIEW_CONFIG.sideView;
      const initialY = position.y - 1; // y位置更高（从 -4 改为 -1，提高3个单位）
      const initialX = position.x - 1; // x位置往-x方向移动1个单位
      const initialZoom = zoom * 0.5; // zoom out更多（zoom值更小，物体更小）
      camera.position.set(initialX, initialY, position.z);
      lookRef.current.set(-1.5 - 1, 1.5 - 4, 0); // 侧视图观察点，x位置往-x方向移动1个单位，y位置不变（保持 1.5 - 4）
      camera.zoom = initialZoom;
      camera.updateProjectionMatrix();
      camera.lookAt(lookRef.current);
      camera.updateMatrixWorld();
      return;
    }
    
    // ========== 100-200vh：从侧视图过渡到顶视图 ==========
    if (vh <= 200) {
      const transitionProgress = (vh - 100) / 100; // 0-1的进度
      const easedProgress = easeInOutCubic(transitionProgress);
      
      // 摄像机位置从侧视图（更高的y位置，x位置往-x方向移动）插值到顶视图
      const initialSideY = VIEW_CONFIG.sideView.position.y - 1; // 初始更高的y位置（从 -4 改为 -1）
      const initialSideX = VIEW_CONFIG.sideView.position.x - 1; // 初始x位置往-x方向移动1个单位
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
      
      // 观察点从侧视图（更低的y位置，x位置往-x方向移动）插值到顶视图
      const initialLookAtY = 1.5 - 4; // 初始观察点y位置也往下4个单位
      const initialLookAtX = -1.5 - 1; // 初始观察点x位置往-x方向移动1个单位
      const lookAtX = THREE.MathUtils.lerp(initialLookAtX, VIEW_CONFIG.topView.lookAt.x, easedProgress);
      const lookAtY = THREE.MathUtils.lerp(initialLookAtY, VIEW_CONFIG.topView.lookAt.y, easedProgress);
      const lookAtZ = THREE.MathUtils.lerp(0, VIEW_CONFIG.topView.lookAt.z, easedProgress);
      
      // 缩放从侧视图（zoom out）插值到顶视图
      const initialSideZoom = VIEW_CONFIG.sideView.zoom * 0.5; // 初始zoom out更多（物体更小）
      const currentZoom = THREE.MathUtils.lerp(
        initialSideZoom,
        VIEW_CONFIG.topView.zoom,
        easedProgress
      );
      
      camera.position.set(cameraX, cameraY, cameraZ);
      lookRef.current.set(lookAtX, lookAtY, lookAtZ);
      camera.zoom = currentZoom;
      // 在过渡阶段，up向量也需要从默认的(0,1,0)过渡到-Z轴(0,0,-1)
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
    
    // ========== 第一阶段：俯视图（200-300vh） ==========
    if (vh < STAGES.PHASE1_TOP_VIEW) {
      const { position, zoom, up } = VIEW_CONFIG.topView;
      camera.position.set(position.x, position.y, position.z);
      lookRef.current.set(VIEW_CONFIG.topView.lookAt.x, VIEW_CONFIG.topView.lookAt.y, VIEW_CONFIG.topView.lookAt.z);
      camera.zoom = zoom;
      if (up) {
        camera.up.set(up.x, up.y, up.z); // 设置up向量为Z轴，使画面中上下是Z轴
      }
      camera.updateProjectionMatrix();
      camera.lookAt(lookRef.current);
      camera.updateMatrixWorld();
      return;
    }
    
    // ========== 第二阶段及之后：侧视图相关动画 ==========
    // 计算摄像机位置（X, Y, Z）
    // 1700vh之后：X轴偏移-100（平滑过渡）
    let baseCameraX = vh <= STAGES.TRANSITION_END
      ? lerpInRange(vh, STAGES.TRANSITION_START, STAGES.TRANSITION_END, 
          VIEW_CONFIG.topView.position.x, VIEW_CONFIG.sideView.position.x)
      : VIEW_CONFIG.sideView.position.x;
    
    // 1700vh之后添加X轴偏移（平滑过渡，持续100vh）
    const xOffsetTransitionDuration = 100; // 过渡持续100vh
    const xOffsetProgress = vh >= STAGES.PHASE5_X_OFFSET_START
      ? Math.min(1, (vh - STAGES.PHASE5_X_OFFSET_START) / xOffsetTransitionDuration)
      : 0;
    const easedXOffsetProgress = easeInOutCubic(xOffsetProgress);
    const xOffset = easedXOffsetProgress * -100;
    const cameraX = baseCameraX + xOffset;
    
    // 400vh时摄像机Y稍微高一点
    const targetCameraY = 7.5; // 400vh时的目标Y位置（稍微高一点）
    const cameraY = vh <= STAGES.TRANSITION_END
      ? lerpInRange(vh, STAGES.TRANSITION_START, STAGES.TRANSITION_END,
          VIEW_CONFIG.topView.position.y, targetCameraY)
      : targetCameraY;
    
    const cameraZ = vh <= STAGES.TRANSITION_END
      ? lerpInRange(vh, STAGES.TRANSITION_START, STAGES.TRANSITION_END,
          VIEW_CONFIG.topView.position.z, VIEW_CONFIG.sideView.position.z)
      : VIEW_CONFIG.sideView.position.z;
    
    // 计算观察点（LookAt）的 X 和 Z（带延迟）
    // 1700vh之后：X轴偏移-100（平滑过渡）
    let baseLookAtX = vh <= STAGES.TRANSITION_END
      ? lerpInRange(vh, STAGES.TRANSITION_START, STAGES.TRANSITION_END,
          VIEW_CONFIG.topView.lookAt.x, -1.5)
      : -1.5;
    
    // 1700vh之后添加X轴偏移（平滑过渡，持续100vh）
    const lookAtXOffsetTransitionDuration = 100; // 过渡持续100vh
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
    
    // 计算观察点（LookAt）的 Y
    let lookAtY;
    if (vh <= STAGES.TRANSITION_END) {
      // 过渡阶段（300-400vh）：观察点Y从0移动到1（400vh时稍微高一点）
      lookAtY = lerpInRange(vh, STAGES.TRANSITION_START, STAGES.TRANSITION_END, 0, 1);
    } else if (vh < STAGES.PHASE2_SPACING_EXPAND_END) {
      // 间距扩大期（400-600vh）：观察点Y保持在1
      lookAtY = 1;
    } else {
      // 第四阶段（600vh+）：观察点Y逐层移动（从600vh开始，每100vh切换一层）
      const phase4Start = STAGES.PHASE4_START;
      const layerDuration = 100; // 每层持续100vh
      const layerCount = 7;
      const layerIndex = Math.min(layerCount - 1, Math.floor((vh - phase4Start) / layerDuration));
      const layerProgress = ((vh - phase4Start) % layerDuration) / layerDuration;
      
      // 计算目标layer的Y位置（始终使用插值，确保平滑）
      const currentLayerY = layerIndex * 5;
      const nextLayerY = Math.min(layerCount - 1, layerIndex + 1) * 5;
      let targetLayerY = THREE.MathUtils.lerp(currentLayerY, nextLayerY, layerProgress);
      
      // 600vh时从1平滑过渡到layer 0的位置（0）
      // 使用50vh的过渡期，确保平滑衔接
      const transitionDuration = 50;
      if (vh <= phase4Start + transitionDuration) {
        // 600-650vh：从1过渡到targetLayerY（600vh时targetLayerY=0）
        lookAtY = lerpInRange(vh, phase4Start, phase4Start + transitionDuration, 1, targetLayerY);
      } else {
        // 对于最后一个layer（layer 6），增加偏移量使其在屏幕垂直中心
        const lastLayerY = (layerCount - 1) * 5; // layer 6的Y位置 = 30
        const verticalCenterOffset = 1; // 偏移量，让layer 6在屏幕中心
        
        // 平滑应用偏移量：从1100vh开始逐渐增加偏移量，到1200vh时完全应用
        const lastLayerStartVh = phase4Start + (layerCount - 1) * layerDuration; // 1200vh
        const offsetTransitionStart = lastLayerStartVh - layerDuration; // 1100vh
        const offsetTransitionDuration = layerDuration; // 100vh
        
        if (vh >= offsetTransitionStart) {
          // 1100-1200vh：平滑增加偏移量
          const offsetProgress = Math.min(1, (vh - offsetTransitionStart) / offsetTransitionDuration);
          const easedOffsetProgress = easeInOutCubic(offsetProgress);
          const appliedOffset = verticalCenterOffset * easedOffsetProgress;
          lookAtY = targetLayerY + appliedOffset;
        } else {
          lookAtY = targetLayerY;
        }
      }
    }
    
    // 计算摄像机Y位置（在第四阶段需要跟随观察点移动）
    let finalCameraY = cameraY;
    if (vh >= STAGES.PHASE4_START) {
      const phase4Start = STAGES.PHASE4_START;
      const layerDuration = 100; // 每层持续100vh
      const layerCount = 7;
      const cameraOffsetY = 8;
      
      const layerIndex = Math.min(layerCount - 1, Math.floor((vh - phase4Start) / layerDuration));
      const layerProgress = ((vh - phase4Start) % layerDuration) / layerDuration;
      
      // 计算目标layer的Y位置（始终使用插值，确保平滑）
      const currentLayerY = layerIndex * 5;
      const nextLayerY = Math.min(layerCount - 1, layerIndex + 1) * 5;
      let targetLayerY = THREE.MathUtils.lerp(currentLayerY, nextLayerY, layerProgress);
      
      // 对于最后一个layer（layer 6），增加偏移量使其在屏幕垂直中心
      const lastLayerY = (layerCount - 1) * 5; // layer 6的Y位置 = 30
      const verticalCenterOffset = 1; // 偏移量，让layer 6在屏幕中心
      
      // 平滑应用偏移量：从1100vh开始逐渐增加偏移量，到1200vh时完全应用
      const lastLayerStartVh = phase4Start + (layerCount - 1) * layerDuration; // 1200vh
      const offsetTransitionStart = lastLayerStartVh - layerDuration; // 1100vh
      const offsetTransitionDuration = layerDuration; // 100vh
      
      let adjustedTargetLayerY = targetLayerY;
      if (vh >= offsetTransitionStart) {
        // 1100-1200vh：平滑增加偏移量
        const offsetProgress = Math.min(1, (vh - offsetTransitionStart) / offsetTransitionDuration);
        const easedOffsetProgress = easeInOutCubic(offsetProgress);
        const appliedOffset = verticalCenterOffset * easedOffsetProgress;
        adjustedTargetLayerY = targetLayerY + appliedOffset;
      }
      
      const targetCameraY = adjustedTargetLayerY + cameraOffsetY;
      
      // 从600vh时的Y位置（7.5）平滑过渡到跟随观察点的Y位置
      // 600vh时：Camera Y从7.5过渡到8（layer 0的Y=0，所以cameraY=0+8=8）
      // 在过渡期间（600-650vh），targetCameraY会随着layerProgress变化，需要平滑过渡
      const transitionDuration = 50;
      if (vh <= phase4Start + transitionDuration) {
        // 600vh时的起始Camera Y值（与400vh时的值一致）
        const startCameraY = 7.5;
        // 使用缓动函数平滑过渡
        const transitionProgress = (vh - phase4Start) / transitionDuration;
        const easedProgress = easeInOutCubic(transitionProgress);
        // 从startCameraY平滑过渡到当前的targetCameraY
        finalCameraY = THREE.MathUtils.lerp(startCameraY, targetCameraY, easedProgress);
      } else {
        finalCameraY = targetCameraY;
      }
    }
    
    // 计算缩放级别
    const zoom = vh <= STAGES.TRANSITION_END
      ? lerpInRange(vh, STAGES.TRANSITION_START, STAGES.TRANSITION_END,
          VIEW_CONFIG.topView.zoom, VIEW_CONFIG.sideView.zoom)
      : VIEW_CONFIG.sideView.zoom;
    
    // 应用所有计算好的值
    camera.position.set(cameraX, finalCameraY, cameraZ);
    lookRef.current.set(lookAtX, lookAtY, lookAtZ);
    camera.zoom = zoom;
    // 在过渡阶段和侧视图阶段，up向量从-Z轴(0,0,-1)恢复回默认的Y轴(0,1,0)
    if (vh <= STAGES.TRANSITION_END) {
      const upTransitionProgress = (vh - STAGES.TRANSITION_START) / (STAGES.TRANSITION_END - STAGES.TRANSITION_START);
      const easedUpProgress = easeInOutCubic(Math.max(0, Math.min(1, upTransitionProgress)));
      camera.up.set(
        THREE.MathUtils.lerp(0, 0, easedUpProgress),
        THREE.MathUtils.lerp(0, 1, easedUpProgress),
        THREE.MathUtils.lerp(-1, 0, easedUpProgress)
      );
    } else {
      // 侧视图阶段，up向量恢复为默认的Y轴
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
  // Canvas始终渲染，不根据activeSection卸载
  // 如果没有激活的section，可以隐藏或显示默认内容
  
  // 计算有效的 scrollProgress：
  // - section5 激活时：使用 scrollProgress5
  // - section8 激活时：使用 scrollProgress8
  // - 其他情况：如果 section5 已经完成（scrollProgress5 = 1），保持最终状态；否则使用 0
  const getEffectiveScrollProgress = () => {
    if (activeSection === 'section5') {
      return scrollProgress5;
    } else if (activeSection === 'section8') {
      return scrollProgress8;
    } else {
      // 如果 section5 已经完成，保持最终状态，避免模型突然消失
      if (scrollProgress5 >= 1) {
        return 1;
      }
      return 0;
    }
  };
  
  const effectiveScrollProgress = getEffectiveScrollProgress();
  // 确定有效的 activeSection：如果 section5 已完成但 activeSection 为 null，使用 'section5-final' 标记
  const effectiveActiveSection = activeSection || (scrollProgress5 >= 1 ? 'section5-final' : null);
  
  return (
    <div 
      className="fixed top-0 left-0 w-full h-screen bg-black pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <Canvas
        dpr={[1, 2]}
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

        {/* 调试用：坐标轴辅助线 */}
        {/* <axesHelper args={[5]} /> */}

        {/* 所有3D内容始终存在，根据activeSection控制动画 */}
        {mounted && (
          <>
            {/* 根据activeSection决定使用哪个scrollProgress */}
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
