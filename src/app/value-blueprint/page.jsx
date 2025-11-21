"use client";

import React, { useRef, useEffect, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrthographicCamera, useGLTF, Environment, Edges } from "@react-three/drei";
import { easing } from "maath";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import * as THREE from "three";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";

gsap.registerPlugin(ScrollTrigger);

// 动画时间线配置函数 - 集中管理所有阶段的参数
// 返回: { camera: { position, lookAt, zoom }, layer: { y, opacity } }
function getAnimationState(vh, layerIndex, originalLayerY, originalPositions) {
  const baseY = originalPositions[1]?.y || 0;
  
  // 默认相机参数
  const defaultCamera = {
    position: [8, 2, 10],
    lookAt: [0, -3, 0],
    zoom: 150, // 增加 zoom 值让相机更靠近物体（原来 100，现在 150）
  };
  
  // 默认layer参数
  const defaultLayer = {
    y: originalLayerY,
    opacity: 1.0,
  };
  
  // === 0-100vh: 保持初始间隔0.1的状态（不改变位置） ===
  if (vh <= 100) {
    return {
      camera: defaultCamera,
      layer: {
        y: originalLayerY,
        opacity: 1.0,
      },
    };
  }
  
  // === 100-200vh: 所有layer的y轴距离增加到1 ===
  if (vh >= 100 && vh < 200) {
    const spacingProgress = (vh - 100) / 100;
    const initialSpacing = 0.1;
    const targetSpacing = 1.0;
    const currentSpacing = THREE.MathUtils.lerp(initialSpacing, targetSpacing, spacingProgress);
    
    let targetY = originalLayerY;
    if (layerIndex > 1) {
      const initialY = originalLayerY;
      const targetSpacingY = baseY - (layerIndex - 1) * currentSpacing;
      targetY = THREE.MathUtils.lerp(initialY, targetSpacingY, spacingProgress);
    }
    
    return {
      camera: defaultCamera,
      layer: {
        y: targetY,
        opacity: 1.0,
      },
    };
  }
  
  // === 200-800vh: layer1到layer6单独显示 ===
  if (vh >= 200 && vh < 800) {
    const sectionStart = 200 + (layerIndex - 1) * 100;
    const sectionEnd = sectionStart + 100;
    const spacing1Y = baseY - (layerIndex - 1) * 1.0;
    
    if (vh >= sectionStart && vh < sectionEnd) {
      return {
        camera: defaultCamera,
        layer: {
          y: spacing1Y,
          opacity: 1.0,
        },
      };
    } else {
      return {
        camera: defaultCamera,
        layer: {
          y: spacing1Y,
          opacity: 0,
        },
      };
    }
  }
  
  // === 800-900vh: layer7单独显示 ===
  if (vh >= 800 && vh < 900) {
    const spacing1Y = baseY - (layerIndex - 1) * 1.0;
    
    if (layerIndex === 7) {
      return {
        camera: defaultCamera,
        layer: {
          y: spacing1Y,
          opacity: 1.0,
        },
      };
    } else {
      return {
        camera: defaultCamera,
        layer: {
          y: spacing1Y,
          opacity: 0,
        },
      };
    }
  }
  
  // === 900-1000vh: 所有layer从间距1回到初始间隔0.1的状态（合并） ===
  if (vh >= 900 && vh < 1000) {
    const tightProgress = (vh - 900) / 100;
    const spacing1Y = baseY - (layerIndex - 1) * 1.0;
    const initialSpacingY = originalLayerY;
    const targetY = THREE.MathUtils.lerp(spacing1Y, initialSpacingY, tightProgress);
    
    return {
      camera: defaultCamera,
      layer: {
        y: targetY,
        opacity: 1.0,
      },
    };
  }
  
  // === 1000-1100vh: 顶视图阶段，layer透明度变为0.5，y轴距离从0.1增大到0.12 ===
  // 注意：相机参数在CameraRig中单独处理，这里只返回layer参数
  if (vh >= 1000) {
    const topViewProgress = (vh - 1000) / 100;
    
    // Layer参数
    const initialSpacingY = originalLayerY;
    const targetSpacingY = baseY - (layerIndex - 1) * 0.12;
    const layerY = THREE.MathUtils.lerp(initialSpacingY, targetSpacingY, topViewProgress);
    const layerOpacity = THREE.MathUtils.lerp(1.0, 0.5, topViewProgress);
    
    return {
      camera: defaultCamera, // 相机参数在CameraRig中单独处理
      layer: {
        y: layerY,
        opacity: layerOpacity,
      },
    };
  }
  
  // 默认返回
  return {
    camera: defaultCamera,
    layer: defaultLayer,
  };
}

// 相机控制器 - 管理相机位置、lookAt 和 zoom，支持动画
function CameraRig({ 
  position = [8, 2, 10], 
  lookAt = [0, -3, 0],
  zoom = 150, // 增加 zoom 值让相机更靠近物体（原来 100，现在 150）
  scrollProgress = 0
}) {
  const { camera } = useThree();
  const lookRef = useRef(new THREE.Vector3(...lookAt));
  const zoomRef = useRef(zoom);
  const initialStateRef = useRef(null); // 记录进入1000vh时的实际相机状态
  
  const totalVh = 1100;
  const vh = scrollProgress * totalVh;
  
  useFrame((state, delta) => {
    if (!camera) return;
    
    // 在998vh时记录实际相机状态，作为1000vh阶段的起始值
    if (vh >= 998 && vh < 1000 && initialStateRef.current === null) {
      initialStateRef.current = {
        position: state.camera.position.clone(),
        lookAt: lookRef.current.clone(),
        zoom: camera.isOrthographicCamera ? camera.zoom : zoom,
      };
    }
    
    if (vh < 998) {
      initialStateRef.current = null;
    }
    
    let targetPosition, targetLookAt, targetZoom;
    
    if (vh >= 1000) {
      // 顶视图阶段：使用记录的起始值进行过渡
      const topViewProgress = (vh - 1000) / 100;
      
      if (!initialStateRef.current) {
        initialStateRef.current = {
          position: state.camera.position.clone(),
          lookAt: lookRef.current.clone(),
          zoom: camera.isOrthographicCamera ? camera.zoom : zoom,
        };
      }
      
      const startPos = initialStateRef.current.position;
      const topViewPos = new THREE.Vector3(-0.01, 10, 0.01);
      const startLookAt = initialStateRef.current.lookAt;
      const topViewLookAt = new THREE.Vector3(-0.01, -0.01, 0.01);
      
      targetPosition = [
        THREE.MathUtils.lerp(startPos.x, topViewPos.x, topViewProgress),
        THREE.MathUtils.lerp(startPos.y, topViewPos.y, topViewProgress),
        THREE.MathUtils.lerp(startPos.z, topViewPos.z, topViewProgress),
      ];
      
      targetLookAt = [
        THREE.MathUtils.lerp(startLookAt.x, topViewLookAt.x, topViewProgress),
        THREE.MathUtils.lerp(startLookAt.y, topViewLookAt.y, topViewProgress),
        THREE.MathUtils.lerp(startLookAt.z, topViewLookAt.z, topViewProgress),
      ];
      
      targetZoom = THREE.MathUtils.lerp(initialStateRef.current.zoom, 120, topViewProgress); // 按比例调整（原来 80，现在 120）
      
      // 直接设置值，不使用easing
      state.camera.position.set(...targetPosition);
      lookRef.current.set(...targetLookAt);
      if (camera.isOrthographicCamera) {
        camera.zoom = targetZoom;
        camera.updateProjectionMatrix();
      }
      state.camera.lookAt(lookRef.current);
      state.camera.updateMatrixWorld();
    } else {
      // 非顶视图阶段：使用getAnimationState获取目标值，然后用easing平滑过渡
      const animState = getAnimationState(vh, 1, 0, {});
      targetPosition = animState.camera.position;
      targetLookAt = animState.camera.lookAt;
      targetZoom = animState.camera.zoom;
      
      const damping = vh >= 998 ? 0.3 : 0.2; // 998-1000vh使用更快的damping
      
      easing.damp3(state.camera.position, targetPosition, damping, delta);
      easing.damp3(lookRef.current, targetLookAt, damping, delta);
      
      if (camera.isOrthographicCamera) {
        easing.damp(zoomRef, 'current', targetZoom, damping, delta);
        camera.zoom = zoomRef.current;
        camera.updateProjectionMatrix();
      }
      
      state.camera.lookAt(lookRef.current);
      state.camera.updateMatrixWorld();
    }
  });
  
  return null;
}

// GLB 模型组件 - 直接使用 THREE.EdgesGeometry 创建红色轮廓
function ValueBlueprintModel({ scrollProgress }) {
  const { scene } = useGLTF('/models/value-blueprint3.glb');
  const [meshData, setMeshData] = React.useState([]);
  const [layerMeshes, setLayerMeshes] = React.useState({});
  const originalPositions = useRef({});
  const layerInitialStateRef = useRef(null); // 记录进入1000vh时的实际layer位置

  // 定义颜色数组（按顺序）
  const colors = [
    0x5BABA8, // #5BABA8
    0x8BDBDC, // #8BDBDC
    0x428ADE, // #428ADE
    0x6A1A59, // #6A1A59
    0xEB5242, // #EB5242
    0xE87729, // #E87729
    0xFFE35F, // #FFE35F
  ];

  useEffect(() => {
    if (scene) {
      const foundMeshes = [];
      const layerMeshes = {}; // 用于存储按 layer 编号排序的 mesh
      const createdMaterials = []; // 跟踪创建的材质，用于清理
      
      scene.traverse((child) => {
        if (child.isMesh) {
          child.visible = true;
          // 保存 mesh 的变换信息
          child.updateMatrixWorld();
          
          // 检查是否是 layer mesh (layer1 到 layer7)
          const name = child.name.toLowerCase();
          const layerMatch = name.match(/layer(\d+)/);
          
          if (layerMatch) {
            const layerNumber = parseInt(layerMatch[1], 10);
            if (layerNumber >= 1 && layerNumber <= 7) {
              layerMeshes[layerNumber] = {
                mesh: child,
                geometry: child.geometry,
                matrix: child.matrixWorld.clone(),
                position: child.position.clone(),
                rotation: child.rotation.clone(),
                scale: child.scale.clone(),
                layerNumber: layerNumber,
              };
            }
          }
          
          // 也保存到 foundMeshes 中（用于轮廓线）
          foundMeshes.push({
            mesh: child,
            geometry: child.geometry,
            matrix: child.matrixWorld.clone(),
            position: child.position.clone(),
            rotation: child.rotation.clone(),
            scale: child.scale.clone(),
          });
        }
      });
      
      // 保存原始位置（在设置 layerMeshes 之后）
      
      // 按照 layer1 到 layer7 的顺序分配颜色
      for (let i = 1; i <= 7; i++) {
        if (layerMeshes[i]) {
          const data = layerMeshes[i];
          const colorIndex = i - 1; // layer1 对应索引 0，layer7 对应索引 6
          const color = colors[colorIndex];
          
          // 创建新的材质来替换原有材质，使用 MeshStandardMaterial 保持光照效果
          // 初始状态完全不透明（opacity = 1.0）
          const newMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            metalness: 0.3,
            roughness: 0.7,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1.0,
          });
          
          // 保存材质引用用于清理
          createdMaterials.push(newMaterial);
          
          if (Array.isArray(data.mesh.material)) {
            const clonedMaterials = data.mesh.material.map(() => {
              const cloned = newMaterial.clone();
              createdMaterials.push(cloned);
              return cloned;
            });
            data.mesh.material = clonedMaterials;
          } else {
            data.mesh.material = newMaterial;
          }
          
          // 确保材质更新
          if (Array.isArray(data.mesh.material)) {
            data.mesh.material.forEach(mat => mat.needsUpdate = true);
          } else {
            data.mesh.material.needsUpdate = true;
          }
          
          const colorHex = `#${color.toString(16).toUpperCase().padStart(6, '0')}`;
        }
      }
      
      // 保存原始位置（在设置 layerMeshes 之后）
      // 设置初始状态：layer2比layer1的y小0.1，layer3比layer2的y小0.1，以此类推
      const originalPos = {};
      let baseY = null;
      for (let i = 1; i <= 7; i++) {
        if (layerMeshes[i]) {
          const mesh = layerMeshes[i].mesh;
          if (baseY === null) {
            // layer1 保持原始y值
            baseY = mesh.position.y;
            originalPos[i] = mesh.position.clone();
          } else {
            // layer2及以后：y值递减0.1
            const targetY = baseY - (i - 1) * 0.1;
            mesh.position.y = targetY;
            originalPos[i] = mesh.position.clone();
            
            // 同时更新 foundMeshes 中对应mesh的position，使轮廓线初始位置正确
            const foundMeshData = foundMeshes.find(m => m.mesh === mesh);
            if (foundMeshData) {
              foundMeshData.position.y = targetY;
            }
          }
        }
      }
      originalPositions.current = originalPos;
      
      setMeshData(foundMeshes);
      setLayerMeshes(layerMeshes);
      
      // 清理函数：组件卸载时释放材质资源
      return () => {
        createdMaterials.forEach(mat => {
          if (mat) {
            mat.dispose();
          }
        });
      };
    }
  }, [scene]);

  // 获取渲染器尺寸用于 LineMaterial
  const { size } = useThree();
  
  // 创建白色线条材质 - 用于标准轮廓描边
  const whiteLineMaterial = React.useMemo(() => {
    return new LineMaterial({ 
      color: '#ffffff', // 白色
      linewidth: 2, // 线条宽度（像素）
      transparent: false,
      resolution: new THREE.Vector2(size.width, size.height), // 需要设置分辨率
    });
  }, [size.width, size.height]);
  
  // 创建红色线条材质 - 用于layer1的额外自定义线条
  const redLineMaterial = React.useMemo(() => {
    return new LineMaterial({ 
      color: '#ff0000', // 红色
      linewidth: 1, // 线条宽度（像素）
      transparent: false,
      resolution: new THREE.Vector2(size.width, size.height), // 需要设置分辨率
    });
  }, [size.width, size.height]);
  
  // 创建白色线条材质 - 用于垂直向上的线条
  const whiteLineMaterial2px = React.useMemo(() => {
    return new LineMaterial({ 
      color: '#ffffff', // 白色
      linewidth: 2, // 线条宽度（像素）
      transparent: false,
      resolution: new THREE.Vector2(size.width, size.height), // 需要设置分辨率
    });
  }, [size.width, size.height]);

  // 从layer1的顶点颜色中提取标记的顶点并创建线条
  const layer1CustomLines = React.useMemo(() => {
    if (meshData.length === 0) return [];
    
    // 找到layer1的mesh数据
    const layer1Data = meshData.find(data => {
      const name = data.mesh.name.toLowerCase();
      return name.match(/layer1/);
    });
    
    if (!layer1Data) return [];
    
    const geometry = layer1Data.geometry;
    
    // 直接 console.log 出模型信息
    console.log('\n=== 完整模型信息 ===');
    console.log('Scene:', scene);
    console.log('\n=== Layer1 Mesh 完整信息 ===');
    console.log('Layer1 Mesh:', layer1Data.mesh);
    console.log('\n=== Layer1 Geometry 完整信息 ===');
    console.log('Layer1 Geometry:', geometry);
    console.log('\n=== Layer1 所有 Attributes 详细信息 ===');
    Object.keys(geometry.attributes).forEach(attrName => {
      const attr = geometry.attributes[attrName];
      console.log(`\n${attrName}:`, attr);
      console.log(`  - 类型: ${attr.constructor.name}`);
      console.log(`  - 顶点数量: ${attr.count}`);
      console.log(`  - 每个顶点的分量数: ${attr.itemSize}`);
      console.log(`  - 数组长度: ${attr.array.length}`);
      console.log(`  - 数组前20个值:`, Array.from(attr.array.slice(0, 20)));
      if (attrName === 'position' || attrName === 'color' || attrName === 'lineColor') {
        console.log(`  - 完整数组:`, attr.array);
      }
    });
    
    // 将 layer1 的 geometry 和 attributes 暴露到全局作用域，方便在控制台中探索
    if (typeof window !== 'undefined') {
      window.layer1Geometry = geometry;
      window.layer1Attributes = geometry.attributes;
      window.layer1Mesh = layer1Data.mesh;
      window.layer1Scene = scene;
      
      // 创建一个辅助对象，方便访问
      window.layer1 = {
        geometry: geometry,
        attributes: geometry.attributes,
        mesh: layer1Data.mesh,
        // 辅助方法：获取指定 attribute 的数据
        getAttribute: (name) => {
          const attr = geometry.attributes[name];
          if (!attr) {
            console.log(`Attribute "${name}" 不存在`);
            console.log('可用的 attributes:', Object.keys(geometry.attributes));
            return null;
          }
          return {
            name: name,
            type: attr.constructor.name,
            count: attr.count,
            itemSize: attr.itemSize,
            array: attr.array,
            // 获取指定顶点的值
            getVertex: (index) => {
              if (index < 0 || index >= attr.count) {
                console.log(`顶点索引 ${index} 超出范围 (0-${attr.count - 1})`);
                return null;
              }
              const start = index * attr.itemSize;
              const values = [];
              for (let i = 0; i < attr.itemSize; i++) {
                values.push(attr.array[start + i]);
              }
              return values;
            },
            // 获取所有顶点的值（作为数组的数组）
            getAllVertices: () => {
              const vertices = [];
              for (let i = 0; i < attr.count; i++) {
                vertices.push(window.layer1.getAttribute(name).getVertex(i));
              }
              return vertices;
            }
          };
        },
        // 列出所有 attributes
        listAttributes: () => {
          console.log('\n=== Layer1 的所有 Attribute ===');
          Object.keys(geometry.attributes).forEach(attrName => {
            const attr = geometry.attributes[attrName];
            console.log(`  ${attrName}:`);
            console.log(`    类型: ${attr.constructor.name}`);
            console.log(`    顶点数量: ${attr.count}`);
            console.log(`    每个顶点的分量数: ${attr.itemSize}`);
          });
        }
      };
      
      console.log('\n=== Layer1 已暴露到全局作用域 ===');
      console.log('你可以在控制台中使用以下方式探索:');
      console.log('  window.layer1.listAttributes() - 列出所有 attributes');
      console.log('  window.layer1.getAttribute("position") - 获取 position attribute');
      console.log('  window.layer1.getAttribute("color") - 获取 color attribute');
      console.log('  window.layer1.getAttribute("lineColor") - 获取 lineColor attribute');
      console.log('  window.layer1Attributes - 直接访问所有 attributes 对象');
      console.log('  window.layer1Geometry - 直接访问 geometry 对象');
      console.log('\n示例:');
      console.log('  const pos = window.layer1.getAttribute("position");');
      console.log('  pos.getVertex(0) - 获取第0个顶点的位置');
      console.log('  pos.getAllVertices() - 获取所有顶点的位置');
    }
    
    // 输出 layer1 的所有 attribute
    console.log('\n=== Layer1 的所有 Attribute ===');
    console.log(`Mesh名称: ${layer1Data.mesh.name}`);
    Object.keys(geometry.attributes).forEach(attrName => {
      const attr = geometry.attributes[attrName];
      console.log(`  ${attrName}:`);
      console.log(`    类型: ${attr.constructor.name}`);
      console.log(`    顶点数量: ${attr.count}`);
      console.log(`    每个顶点的分量数: ${attr.itemSize}`);
      if (attrName === 'position' && attr.count > 0) {
        const pos = attr.array;
        console.log(`    示例值 (前3个顶点): [${pos[0].toFixed(3)}, ${pos[1].toFixed(3)}, ${pos[2].toFixed(3)}], [${pos[3].toFixed(3)}, ${pos[4].toFixed(3)}, ${pos[5].toFixed(3)}], [${pos[6].toFixed(3)}, ${pos[7].toFixed(3)}, ${pos[8].toFixed(3)}]`);
      }
      if ((attrName === 'color' || attrName === 'lineColor') && attr.count > 0) {
        const col = attr.array;
        console.log(`    示例值 (前3个顶点的RGB): [${col[0].toFixed(3)}, ${col[1].toFixed(3)}, ${col[2].toFixed(3)}], [${col[3].toFixed(3)}, ${col[4].toFixed(3)}, ${col[5].toFixed(3)}], [${col[6].toFixed(3)}, ${col[7].toFixed(3)}, ${col[8].toFixed(3)}]`);
      }
    });
    
    // 优先查找 "lineColor" 属性，如果没有则使用默认的 "color"
    const colorAttribute = geometry.attributes.lineColor || geometry.attributes.color;
    
    if (!colorAttribute) {
      console.log('\n⚠️ Layer1 没有找到顶点颜色属性（lineColor 或 color）');
      return [];
    }
    
    const colorAttrName = geometry.attributes.lineColor ? 'lineColor' : 'color';
    console.log(`\n使用的颜色属性: ${colorAttrName}`);
    
    // 获取顶点位置和颜色
    const positionAttribute = geometry.attributes.position;
    const positions = positionAttribute.array;
    const colors = colorAttribute.array;
    const vertexCount = positionAttribute.count;
    const colorItemSize = colorAttribute.itemSize; // 3 (RGB) 或 4 (RGBA)
    
    console.log(`颜色属性 itemSize: ${colorItemSize} (${colorItemSize === 3 ? 'RGB' : 'RGBA'})`);
    
    // 检查颜色数组的数据类型并标准化
    const isUint16 = colors instanceof Uint16Array;
    const isUint8 = colors instanceof Uint8Array;
    const isFloat32 = colors instanceof Float32Array;
    
    console.log(`颜色数据类型: ${colors.constructor.name}`);
    console.log(`示例原始值: [${colors[0]}, ${colors[1]}, ${colors[2]}${colorItemSize === 4 ? `, ${colors[3]}` : ''}]`);
    
    // 标准化颜色值到 0-1 范围
    let normalizedColors = colors;
    if (isUint16) {
      // 16位整数 (0-65535) 转换为 0-1
      normalizedColors = new Float32Array(colors.length);
      for (let i = 0; i < colors.length; i++) {
        normalizedColors[i] = colors[i] / 65535;
      }
      console.log(`已转换 16位整数到浮点数 (除以 65535)`);
      console.log(`示例转换后值: [${normalizedColors[0].toFixed(3)}, ${normalizedColors[1].toFixed(3)}, ${normalizedColors[2].toFixed(3)}${colorItemSize === 4 ? `, ${normalizedColors[3].toFixed(3)}` : ''}]`);
    } else if (isUint8) {
      // 8位整数 (0-255) 转换为 0-1
      normalizedColors = new Float32Array(colors.length);
      for (let i = 0; i < colors.length; i++) {
        normalizedColors[i] = colors[i] / 255;
      }
      console.log(`已转换 8位整数到浮点数 (除以 255)`);
    } else if (isFloat32) {
      // 已经是浮点数，直接使用
      normalizedColors = colors;
      console.log(`颜色数据已经是浮点数格式`);
    } else {
      // 未知格式，尝试转换
      normalizedColors = new Float32Array(colors.length);
      for (let i = 0; i < colors.length; i++) {
        normalizedColors[i] = colors[i] / 65535; // 假设是 16 位
      }
      console.log(`未知格式，尝试转换为浮点数`);
    }
    
    // 只选择 G=0 且 B=0 的顶点（允许小的浮点误差）
    const TOLERANCE = 0.001; // 浮点数精度容差
    const markedVertices = [];
    
    // 检查数组位置 256-271 的原始值和标准化值
    console.log('\n=== 检查数组位置 256-271 的顶点 ===');
    for (let arrayIdx = 256; arrayIdx <= 271 && arrayIdx < colors.length; arrayIdx++) {
      const vertexIdx = Math.floor(arrayIdx / colorItemSize);
      const channelIdx = arrayIdx % colorItemSize;
      const channelNames = colorItemSize === 4 ? ['R', 'G', 'B', 'A'] : ['R', 'G', 'B'];
      const channelName = channelNames[channelIdx];
      const originalValue = colors[arrayIdx];
      const normalizedValue = normalizedColors[arrayIdx];
      
      console.log(`数组索引 ${arrayIdx}: 顶点 ${vertexIdx} 的 ${channelName}, 原始值=${originalValue}, 标准化值=${normalizedValue.toFixed(6)}`);
    }
    
    for (let i = 0; i < vertexCount; i++) {
      const arrayIdxR = i * colorItemSize;
      const arrayIdxG = i * colorItemSize + 1;
      const arrayIdxB = i * colorItemSize + 2;
      
      const r = normalizedColors[arrayIdxR];     // 红色通道（已标准化）
      const g = normalizedColors[arrayIdxG];     // 绿色通道（已标准化）
      const b = normalizedColors[arrayIdxB];     // 蓝色通道（已标准化）
      
      // 检查是否是用户提到的位置范围（256-271）
      if (arrayIdxR >= 256 && arrayIdxR <= 271) {
        console.log(`顶点 ${i} (数组索引 ${arrayIdxR}-${arrayIdxB}): R=${r.toFixed(6)}, G=${g.toFixed(6)}, B=${b.toFixed(6)}, 原始值=[${colors[arrayIdxR]}, ${colors[arrayIdxG]}, ${colors[arrayIdxB]}]`);
        console.log(`  是否满足条件 (G<${TOLERANCE} && B<${TOLERANCE}): G=${Math.abs(g) < TOLERANCE}, B=${Math.abs(b) < TOLERANCE}`);
      }
      
      // 只选择 G=0 且 B=0 的顶点
      if (Math.abs(g) < TOLERANCE && Math.abs(b) < TOLERANCE) {
        markedVertices.push({
          index: i,
          position: new THREE.Vector3(
            positions[i * 3],
            positions[i * 3 + 1],
            positions[i * 3 + 2]
          ),
          color: { r, g, b }
        });
      }
    }
    
    // 输出信息
    console.log(`\n标记顶点说明：只选择 G=0 且 B=0 的顶点`);
    console.log(`Layer1 标记的顶点 (G=0, B=0): ${markedVertices.length} 个`);
    if (markedVertices.length > 0) {
      console.log('标记的顶点索引:', markedVertices.map(v => v.index));
    }
    
    if (markedVertices.length < 2) {
      return [];
    }
    
    // 根据顶点颜色值分组：相同颜色的顶点会被连接
    // 使用G和B通道来区分不同的线段组
    const lineGroups = {};
    markedVertices.forEach(vertex => {
      // 使用G和B通道的组合作为组ID（保留1位小数精度）
      const groupId = `${Math.round(vertex.color.g * 10)}_${Math.round(vertex.color.b * 10)}`;
      if (!lineGroups[groupId]) {
        lineGroups[groupId] = [];
      }
      lineGroups[groupId].push(vertex);
    });
    
    // 为每个组创建线条
    const lines = [];
    Object.values(lineGroups).forEach(group => {
      if (group.length < 2) return;
      
      // 按顺序连接组内的顶点：v0->v1->v2->...->vn-1
      for (let i = 0; i < group.length - 1; i++) {
        const v1 = group[i];
        const v2 = group[i + 1];
        
        const lineGeo = new LineGeometry();
        lineGeo.setPositions([
          v1.position.x, v1.position.y, v1.position.z,
          v2.position.x, v2.position.y, v2.position.z,
        ]);
        lines.push(new Line2(lineGeo, redLineMaterial));
      }
      
      // 闭合线条：连接最后一个顶点回到第一个顶点
      if (group.length >= 2) {
        const lastVertex = group[group.length - 1];
        const firstVertex = group[0];
        
        const lineGeo = new LineGeometry();
        lineGeo.setPositions([
          lastVertex.position.x, lastVertex.position.y, lastVertex.position.z,
          firstVertex.position.x, firstVertex.position.y, firstVertex.position.z,
        ]);
        lines.push(new Line2(lineGeo, redLineMaterial));
      }
    });
    
    return lines;
  }, [meshData, redLineMaterial]);

  // 在 layer1 的顶面上生成 10 个垂直向上的白色线条
  const layer1VerticalLines = React.useMemo(() => {
    if (meshData.length === 0) return [];
    
    // 找到 layer1 的 mesh 数据
    const layer1Data = meshData.find(data => {
      const name = data.mesh.name.toLowerCase();
      return name.match(/layer1/);
    });
    
    if (!layer1Data) return [];
    
    const geometry = layer1Data.geometry;
    const positionAttribute = geometry.attributes.position;
    const positions = positionAttribute.array;
    const vertexCount = positionAttribute.count;
    
    // 收集所有顶点的位置和 Y 值
    const vertices = [];
    for (let i = 0; i < vertexCount; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      vertices.push({ index: i, x, y, z });
    }
    
    // 找到 Y 值的最大值（顶面）
    const maxY = Math.max(...vertices.map(v => v.y));
    const tolerance = 0.01; // 容差，用于判断是否在顶面上
    
    // 筛选出顶面上的顶点（Y 值接近最大值）
    const topVertices = vertices.filter(v => Math.abs(v.y - maxY) < tolerance);
    
    // 计算顶面的边界框（X 和 Z 的范围）
    if (topVertices.length === 0) {
      console.log('Layer1 顶面垂直线条: 没有找到顶面顶点');
      return [];
    }
    
    const minX = Math.min(...topVertices.map(v => v.x));
    const maxX = Math.max(...topVertices.map(v => v.x));
    const minZ = Math.min(...topVertices.map(v => v.z));
    const maxZ = Math.max(...topVertices.map(v => v.z));
    
    console.log(`Layer1 顶面边界: X[${minX.toFixed(3)}, ${maxX.toFixed(3)}], Z[${minZ.toFixed(3)}, ${maxZ.toFixed(3)}], Y=${maxY.toFixed(3)}`);
    
    // 在顶面上随机生成 10 个点
    const numLines = 10;
    const randomPoints = [];
    for (let i = 0; i < numLines; i++) {
      const randomX = minX + Math.random() * (maxX - minX);
      const randomZ = minZ + Math.random() * (maxZ - minZ);
      randomPoints.push({
        x: randomX,
        y: maxY,
        z: randomZ
      });
    }
    
    // 生成垂直向上的线条（向上 0.5 单位）
    const lineHeight = 0.5;
    const lines = [];
    
    randomPoints.forEach(point => {
      const lineGeo = new LineGeometry();
      lineGeo.setPositions([
        point.x, point.y, point.z,                    // 起点（顶面随机位置）
        point.x, point.y + lineHeight, point.z,      // 终点（向上）
      ]);
      lines.push(new Line2(lineGeo, whiteLineMaterial2px));
    });
    
    console.log(`Layer1 顶面垂直线条: 在顶面上随机生成了 ${lines.length} 条垂直线`);
    
    return lines;
  }, [meshData, whiteLineMaterial2px]);

  // 为每个 mesh 创建 edges geometry 并转换为 Line2 对象数组
  // LineGeometry 不支持 NaN 分隔符，所以我们需要为每条线段创建独立的 Line2
  // 但可以通过批量渲染来优化性能
  const edgesLines = React.useMemo(() => {
    if (meshData.length === 0) return [];
    return meshData.map(data => {
      // 所有layer都使用EdgesGeometry，使用5度阈值（包括layer1）
      const angleThreshold = 5;
      
      // 先创建 EdgesGeometry（这个会被自动管理，不需要手动释放）
      const edgesGeo = new THREE.EdgesGeometry(data.geometry, angleThreshold);
      
      // 获取顶点位置（EdgesGeometry 的顶点是成对的，每2个点组成一条线段）
      const positions = edgesGeo.attributes.position.array;
      const lineCount = positions.length / 6; // 每条线段2个点，每个点3个坐标
      
      // 应用mesh的变换矩阵到顶点位置（如果需要）
      // 由于我们使用group的position/rotation/scale，这里使用本地坐标即可
      const lines = [];
      for (let i = 0; i < lineCount; i++) {
        const lineGeo = new LineGeometry();
        const points = [
          positions[i * 6],     positions[i * 6 + 1],     positions[i * 6 + 2],     // 起点
          positions[i * 6 + 3], positions[i * 6 + 4], positions[i * 6 + 5],  // 终点
        ];
        lineGeo.setPositions(points);
        lines.push(new Line2(lineGeo, whiteLineMaterial));
      }
      
      // 清理 EdgesGeometry（LineGeometry 会被 Line2 管理）
      edgesGeo.dispose();
      
      return lines;
    });
  }, [meshData, whiteLineMaterial]);
  
  // 清理函数：组件卸载时释放 Line2 和 LineGeometry 资源
  useEffect(() => {
    return () => {
      edgesLines.forEach(lineArray => {
        if (lineArray) {
          lineArray.forEach(line => {
            if (line && line.geometry) {
              line.geometry.dispose();
            }
            if (line) {
              line.dispose?.(); // Line2 可能没有 dispose 方法，但尝试调用
            }
          });
        }
      });
      // 清理layer1自定义线条
      layer1CustomLines.forEach(line => {
        if (line && line.geometry) {
          line.geometry.dispose();
        }
        if (line) {
          line.dispose?.();
        }
      });
      // 清理layer1垂直线条
      layer1VerticalLines.forEach(line => {
        if (line && line.geometry) {
          line.geometry.dispose();
        }
        if (line) {
          line.dispose?.();
        }
      });
    };
  }, [edgesLines, layer1CustomLines, layer1VerticalLines]);

  // 存储轮廓线组件的引用，用于更新位置
  const edgeGroupsRef = useRef({});

  // 根据滚动进度更新layer位置和透明度
  useFrame(() => {
    if (Object.keys(layerMeshes).length === 0) return;
    if (scrollProgress === undefined) return;
    
    const vh = scrollProgress * 1100;
    
    // 在998vh时记录layer的实际状态，作为1000vh阶段的起始值
    if (vh >= 998 && vh < 1000 && layerInitialStateRef.current === null) {
      const layerStates = {};
      for (let i = 1; i <= 7; i++) {
        const layer = layerMeshes[i];
        if (layer && layer.mesh) {
          const mat = Array.isArray(layer.mesh.material) ? layer.mesh.material[0] : layer.mesh.material;
          layerStates[i] = {
            y: layer.mesh.position.y,
            opacity: mat?.opacity || 1.0,
          };
        }
      }
      layerInitialStateRef.current = layerStates;
    }
    
    if (vh < 998) {
      layerInitialStateRef.current = null;
    }
    
    // 更新每个layer
    for (let i = 1; i <= 7; i++) {
      const layer = layerMeshes[i];
      if (!layer || !layer.mesh) continue;
      
      const originalPos = originalPositions.current[i];
      if (!originalPos) continue;
      
      let targetY, opacity;
      
      if (vh >= 1000) {
        // 顶视图阶段：使用记录的起始值
        const topViewProgress = (vh - 1000) / 100;
        
        if (!layerInitialStateRef.current?.[i]) {
          if (!layerInitialStateRef.current) layerInitialStateRef.current = {};
          const mat = Array.isArray(layer.mesh.material) ? layer.mesh.material[0] : layer.mesh.material;
          layerInitialStateRef.current[i] = {
            y: layer.mesh.position.y,
            opacity: mat?.opacity || 1.0,
          };
        }
        
        const startY = layerInitialStateRef.current[i].y;
        const baseY = originalPositions.current[1]?.y || 0;
        const targetSpacingY = baseY - (i - 1) * 0.12;
        targetY = THREE.MathUtils.lerp(startY, targetSpacingY, topViewProgress);
        opacity = THREE.MathUtils.lerp(layerInitialStateRef.current[i].opacity, 0.5, topViewProgress);
      } else {
        // 非顶视图阶段：使用getAnimationState
        const animState = getAnimationState(vh, i, originalPos.y, originalPositions.current);
        targetY = animState.layer.y;
        opacity = animState.layer.opacity;
      }
      
      // 更新位置
      layer.mesh.position.y = targetY;
      const edgeGroup = edgeGroupsRef.current[i];
      if (edgeGroup) {
        // 同步所有坐标，确保轮廓线位置正确
        edgeGroup.position.set(
          layer.mesh.position.x,
          targetY,
          layer.mesh.position.z
        );
      }
      
      // 如果是layer1，同时更新自定义线条和垂直线条的位置
      if (i === 1) {
        const layer1CustomLinesGroup = edgeGroupsRef.current['layer1-custom'];
        if (layer1CustomLinesGroup) {
          layer1CustomLinesGroup.position.set(
            layer.mesh.position.x,
            targetY,
            layer.mesh.position.z
          );
        }
        const layer1VerticalLinesGroup = edgeGroupsRef.current['layer1-vertical'];
        if (layer1VerticalLinesGroup) {
          layer1VerticalLinesGroup.position.set(
            layer.mesh.position.x,
            targetY,
            layer.mesh.position.z
          );
        }
      }
      
      // 更新透明度
      const materials = Array.isArray(layer.mesh.material) ? layer.mesh.material : [layer.mesh.material];
      materials.forEach(mat => {
        if (mat) {
          mat.opacity = opacity;
          mat.needsUpdate = true;
        }
      });
    }
  });

  // 获取layer1的mesh数据用于定位自定义线条
  const layer1MeshData = React.useMemo(() => {
    return meshData.find(data => {
      const name = data.mesh.name.toLowerCase();
      return name.match(/layer1/);
    });
  }, [meshData]);

  return (
    <group>
      {/* 渲染原始模型 */}
      <primitive object={scene} />
      
      {/* 为每个 mesh 添加白色轮廓线 - 使用 Line2 支持 LineMaterial */}
      {meshData.map((data, index) => {
        // 检查是否是 layer mesh
        const name = data.mesh.name.toLowerCase();
        const layerMatch = name.match(/layer(\d+)/);
        const layerNumber = layerMatch ? parseInt(layerMatch[1], 10) : null;
        
        // 使用mesh的实际位置，确保轮廓线位置正确
        const meshPosition = data.mesh.position;
        const meshRotation = data.mesh.rotation;
        const meshScale = data.mesh.scale;
        
        return (
          <group
            key={`edges-${data.mesh.uuid || index}`}
            ref={(ref) => {
              if (layerNumber && ref) {
                edgeGroupsRef.current[layerNumber] = ref;
                // 初始化位置
                ref.position.set(meshPosition.x, meshPosition.y, meshPosition.z);
                ref.rotation.set(meshRotation.x, meshRotation.y, meshRotation.z);
                ref.scale.set(meshScale.x, meshScale.y, meshScale.z);
              }
            }}
            position={meshPosition}
            rotation={meshRotation}
            scale={meshScale}
          >
            {edgesLines[index]?.map((line, lineIndex) => (
              <primitive 
                key={`line-${index}-${lineIndex}`}
                object={line} 
              />
            ))}
          </group>
        );
      })}
      
      {/* Layer1 自定义线条 - 基于顶点颜色标记（红色） */}
      {layer1MeshData && layer1CustomLines.length > 0 && (
        <group
          key="layer1-custom-lines"
          ref={(ref) => {
            if (ref) {
              edgeGroupsRef.current['layer1-custom'] = ref;
              // 初始化位置
              const mesh = layer1MeshData.mesh;
              ref.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
              ref.rotation.set(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z);
              ref.scale.set(mesh.scale.x, mesh.scale.y, mesh.scale.z);
            }
          }}
          position={layer1MeshData.mesh.position}
          rotation={layer1MeshData.mesh.rotation}
          scale={layer1MeshData.mesh.scale}
        >
          {layer1CustomLines.map((line, lineIndex) => (
            <primitive 
              key={`layer1-custom-line-${lineIndex}`}
              object={line} 
            />
          ))}
        </group>
      )}
      
      {/* Layer1 顶面垂直向上的白色线条 */}
      {layer1MeshData && layer1VerticalLines.length > 0 && (
        <group
          key="layer1-vertical-lines"
          ref={(ref) => {
            if (ref) {
              edgeGroupsRef.current['layer1-vertical'] = ref;
              // 初始化位置
              const mesh = layer1MeshData.mesh;
              ref.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
              ref.rotation.set(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z);
              ref.scale.set(mesh.scale.x, mesh.scale.y, mesh.scale.z);
            }
          }}
          position={layer1MeshData.mesh.position}
          rotation={layer1MeshData.mesh.rotation}
          scale={layer1MeshData.mesh.scale}
        >
          {layer1VerticalLines.map((line, lineIndex) => (
            <primitive 
              key={`layer1-vertical-line-${lineIndex}`}
              object={line} 
            />
          ))}
        </group>
      )}
    </group>
  );
}

export default function ValueBlueprintPage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
      // 创建滚动触发器 - 使用 window 作为滚动容器
      const trigger = ScrollTrigger.create({
        start: "top top",
        end: "+=1100vh", // 1100vh 的滚动范围
        scrub: true,
        onUpdate: (self) => {
          // progress 是 0-1，对应 0-1100vh
          setScrollProgress(self.progress);
        },
      });

    return () => {
      trigger.kill();
    };
  }, []);

  // 计算当前vh值
  const currentVh = scrollProgress * 1100;

  return (
    <>
      {/* 滚动空间 - 1100vh，用于 ScrollTrigger */}
      <div 
        ref={scrollContainerRef}
        style={{ 
          height: '1100vh',
          width: '100%',
          position: 'relative',
          zIndex: 0,
        }}
      />
      
      {/* 滚动量显示 - 左下角 */}
      <div 
        className="fixed bottom-4 left-16 z-50 pointer-events-none"
        style={{
          color: '#ffffff',
          fontFamily: 'monospace',
          fontSize: '14px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '8px 12px',
          borderRadius: '4px',
          backdropFilter: 'blur(4px)',
        }}
      >
        {currentVh.toFixed(1)}vh / 1100vh
      </div>
      
      {/* 3D Canvas - 固定在视口 */}
      <div className="fixed inset-0 w-full h-full bg-black" style={{ zIndex: 1, pointerEvents: 'none' }}>
        <Canvas
          dpr={[1, 2]}
          gl={{ 
            antialias: true,
            alpha: false,
          }}
          style={{ 
            width: '100%',
            height: '100%',
          }}
        >
          {/* 正交相机 */}
          <OrthographicCamera 
            makeDefault 
            position={[0, 0, 10]}
            zoom={150}
            near={0.1}
            far={1000}
          />
          
          {/* 相机控制器 - 管理相机位置和 lookAt */}
          {/* 修改函数定义中的默认参数即可生效 */}
          <CameraRig scrollProgress={scrollProgress} />

          {/* 环境光 */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} />

          {/* 环境贴图 */}
          <Environment preset="city" />

          {/* 加载 GLB 模型 - 使用 Edges 组件添加红色轮廓 */}
          <ValueBlueprintModel scrollProgress={scrollProgress} />
        </Canvas>
      </div>
    </>
  );
}

