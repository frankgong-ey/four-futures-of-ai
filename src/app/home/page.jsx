"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, useTexture, Text, Html, Stats } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, DepthOfField } from "@react-three/postprocessing";
import * as THREE from "three";
import React, { useMemo, useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import vertexShader from "../../shaders/neon.vert.glsl";
import fragmentShader from "../../shaders/neon.frag.glsl";
import questionLineVertexShader from "../../shaders/questionLine.vert.glsl";
import questionLineFragmentShader from "../../shaders/questionLine.frag.glsl";
import torusPointsVertexShader from "../../shaders/torusPoints.vert.glsl";
import torusPointsFragmentShader from "../../shaders/torusPoints.frag.glsl";
import circlePlaneVertexShader from "../../shaders/circlePlane.vert.glsl";
import circlePlaneFragmentShader from "../../shaders/circlePlane.frag.glsl";
import torusLinesVertexShader from "../../shaders/torusLines.vert.glsl";
import torusLinesFragmentShader from "../../shaders/torusLines.frag.glsl";
import LoadingScreen from "../components/LoadingScreen";
import Section1 from "../components/Section1";
import Section2 from "../components/Section2";
import Section3 from "../components/Section3";
import Section4 from "../components/Section4";
import SectionTitle from "../components/SectionTitle";
import Section9 from "../components/Section9";
import Section10 from "../components/Section10";
import GalleryTunnel from "../components/GalleryTunnel";
import Navigation from "../components/Navigation";
import DebugUI from "../components/DebugUI";
import SplitType from "split-type";

// 注册GSAP插件
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/*
* 加载模型组件，接收进度和可见性 ✅
*/ 
function ModelLoader({ scrollProgress, visible = true }) {
  const { scene } = useGLTF('/models/Neon_scene01.glb'); // 加载霓虹灯条模型。如果存在则返回，不存在则返回null。
  const group = useRef(null); // 是一个三维对象，用于存储所有的模型。
  const materialsRef = useRef([]); // 是一个数组，存储所有的材质。

  // 渲染和更新时间uniform用在材质中。
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!group.current) return; // 如果 group 不存在，则返回。
    
    // 更新时间uniform和progress
    materialsRef.current.forEach(material => {
      if (material && material.uniforms) {
        if (material.uniforms.time) {
        material.uniforms.time.value = t;
        }
        if (material.uniforms.progress) {
          material.uniforms.progress.value = scrollProgress;
        }
      }
    });
  });

  // 克隆场景并应用动画材质（只执行一次), 克隆场景是为了避免修改原始场景。
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    materialsRef.current = [];
    
    // 定义颜色数组和索引计数器
    const colors = ["#750D5D", "#2BB856", "#198CE6", "#FF4136"];
    let colorIndex = 0;
    
    // 遍历所有网格并应用动画材质
    cloned.traverse((child) => {
      if (child.isMesh) {
        // 按顺序为每个模型分配颜色
        const currentColor = colors[colorIndex % colors.length]; 
        colorIndex++; // 递增索引以便下一个模型使用下一个颜色
        
        const material = new THREE.ShaderMaterial({
          transparent: true,
          side: THREE.DoubleSide, // 双面渲染，避免背面被遮挡
          alphaTest: 0.0, // 允许完全透明的像素
          depthWrite: false, // 禁用深度写入，避免透明度排序问题
          blending: THREE.AdditiveBlending, // 使用加法混合，让重叠部分更亮
          toneMapped: false, // 禁用色调映射，让 tube 模型触发 bloom
          uniforms: {
            color: { value: new THREE.Color(currentColor) },
            progress: { value: 0.3 }, // 初始显示30%，让neon一开始就可见
            time: { value: 0 },
            fogNear: { value: 15.0 }, // 迷雾开始的距离
            fogFar: { value: 20.0 }, // 迷雾完全遮挡的距离
          },
          vertexShader,
          fragmentShader,
        });
        
        child.material = material;
        child.userData.bloom = true; // 标记为发光物体
        materialsRef.current.push(material);
      }
    });
    
    return cloned;
  }, [scene]);

  // 根据visible prop控制显示/隐藏
  useEffect(() => {
    if (group.current) {
      group.current.visible = visible;
    }
  }, [visible]);

  return (
    <group ref={group}>
      <primitive 
        object={clonedScene} 
      />
    </group>
  );
}

function Questions({ scrollProgress, visible }) {
  const { scene } = useGLTF('/models/question_consolidated_v5.glb');
  const group = useRef(null);
  const materialsRef = useRef([]);
  const dynamicLinesRef = useRef(null); // 动态连线的引用
  const lineMaterialsRef = useRef([]); // 连线材质的引用
  const torusPointsRef = useRef([]); // 保存Torus Points对象的引用，用于旋转
  const [torusPositions, setTorusPositions] = useState([]); // 保存Torus的位置和名称，用于标签
  const linesGroupRef = useRef(null); // 存储合并后的连线组，便于清理

  // 渲染和更新时间：集中一次更新共享的 time，避免多材质重复 set
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!group.current) return;
    
    // 共享 time 更新（line + points 材质池）
    if (lineMaterialsRef.current.length > 0) {
      const mat = lineMaterialsRef.current[0];
      if (mat && mat.uniforms && mat.uniforms.time) mat.uniforms.time.value = t;
    }
    // 更新所有非合并线段的材质（包括 line-like 与 circle 等），以确保它们的 time 驱动动画正常
    materialsRef.current.forEach((mat) => {
      if (!mat || !mat.uniforms) return;
      if (mat.uniforms.time) mat.uniforms.time.value = t;
      if (mat.uniforms.progress) mat.uniforms.progress.value = 1.0;
    });
    
    // 保持所有Points对象静止
    torusPointsRef.current.forEach(() => {});
  });

  // 克隆场景并为名称包含"line"的objects应用question line shader，为Torus应用points shader
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    materialsRef.current = [];
    torusPointsRef.current = []; // 重置Torus Points引用
    
    // 定义颜色数组
    const colors = ["#750D5D", "#2BB856", "#198CE6", "#FF4136"];
    let colorIndex = 0;
    
    // 先收集所有需要处理的对象
    const torusObjects = [];
    const lineLikeObjects = []; // 包含 line、Path、stagnate
    const circleObjects = [];
    const planeObjects = [];
    const wireframeObjects = []; // 名称包含 box、cone
    
    cloned.traverse((child) => {
      if (!child.isMesh) return;
      
      const childNameLower = child.name ? child.name.toLowerCase() : '';
      
      if (childNameLower.includes('torus') || childNameLower.includes('icosphere') || childNameLower.includes('cube') || childNameLower.includes('box') || childNameLower.includes('cone') || childNameLower.includes('human')) {
        torusObjects.push(child);
      } else if (childNameLower.includes('line') || childNameLower.includes('path') || childNameLower.includes('stagnate')) {
        lineLikeObjects.push(child);
      } else if (childNameLower.includes('circle')) {
        circleObjects.push(child);
      } else if (childNameLower.includes('plane')) {
        planeObjects.push(child);
      }

      // 需要使用wireframe显示的对象
      if (childNameLower.includes('box') || childNameLower.includes('cone')) {
        wireframeObjects.push(child);
      }
    });
    
    // 处理所有Torus/Icosphere/Cube对象（使用相同的points shader）
    torusObjects.forEach((child) => {
      console.log('Found Points object (Torus/Icosphere/Cube):', child.name); // Debug log
      
      // 创建Points对象来只显示点
      const geometry = child.geometry;
      
      // 根据对象类型设置不同的点大小
      const nameLower = child.name.toLowerCase();
      let pointSize = 2.0; // 默认大小（Torus）
      
      if (nameLower.includes('human')) {
        // human 仅显示连线，不显示点：将点大小设为 0
        pointSize = 0.0;
      } else if (nameLower.includes('icosphere') || nameLower.includes('cube') || nameLower.includes('box') || nameLower.includes('cone')) {
        pointSize = 12.0; // Icosphere/Cube/Box/Cone 使用更大的点
      }
      
      // 使用自定义ShaderMaterial for Points
      const pointsMaterial = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          color: { value: new THREE.Color('#ffffff') }, // 白色
          time: { value: 0 },
          pointSize: { value: pointSize } // 根据对象类型设置点大小
        },
        vertexShader: torusPointsVertexShader,
        fragmentShader: torusPointsFragmentShader,
      });
      
      // 创建Points对象替换原来的Mesh
      const points = new THREE.Points(geometry, pointsMaterial);
      points.name = child.name;
      points.position.copy(child.position);
      points.rotation.copy(child.rotation);
      points.scale.copy(child.scale);
      
      // 替换原来的mesh
      if (child.parent) {
        child.parent.add(points);
        child.parent.remove(child);
      }
      
      // 保存Points对象引用，用于旋转动画
      torusPointsRef.current.push(points);
      
      materialsRef.current.push(pointsMaterial);
    });
    
    
    // 处理所有 line-like 对象（line/Path/stagnate） - 使用专用shader带随机偏移
    lineLikeObjects.forEach((child) => {
      console.log('Found line-like object:', child.name); // Debug log
      
      // 所有line都使用蓝色
      const lineColor = "#198CE6";
      
      // 为每个line物体生成随机时间偏移（0-10秒范围）
      const randomTimeOffset = Math.random() * 10.0;
      
      const isFullVisible = child.name && child.name.toLowerCase().includes('lined');
      const material = new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        uniforms: {
          color: { value: new THREE.Color(lineColor) },
          progress: { value: 1.0 }, // 完全显示
          time: { value: 0 },
          timeOffset: { value: randomTimeOffset }, // 随机时间偏移！
          fogNear: { value: 100.0 }, // 禁用雾效果
          fogFar: { value: 200.0 },
          fullVisible: { value: isFullVisible ? 1.0 : 0.0 }
          // cameraPosition 是Three.js内置uniform，不需要手动添加
        },
        vertexShader: questionLineVertexShader,
        fragmentShader: questionLineFragmentShader,
      });
      
      child.material = material;
      child.userData.bloom = true;
      materialsRef.current.push(material);
    });
    
    // 处理所有Circle对象 - 使用类似line的shader但vuv.y从0-1全部可见
    circleObjects.forEach((child) => {
      console.log('Found Circle object:', child.name); // Debug log
      
      // 所有circle都使用蓝色
      const circleColor = "#198CE6";
      
      // 为每个circle物体生成随机时间偏移（0-10秒范围）
      const randomTimeOffset = Math.random() * 10.0;
      
      const material = new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        uniforms: {
          color: { value: new THREE.Color(circleColor) },
          progress: { value: 1.0 }, // 完全显示
          time: { value: 0 },
          timeOffset: { value: randomTimeOffset }, // 随机时间偏移
          fogNear: { value: 100.0 }, // 禁用雾效果
          fogFar: { value: 200.0 }
          // cameraPosition 是Three.js内置uniform，不需要手动添加
        },
        vertexShader: questionLineVertexShader,
        fragmentShader: questionLineFragmentShader,
      });
      
      child.material = material;
      child.userData.bloom = true;
      materialsRef.current.push(material);
    });
    
    // 处理所有Plane对象 - 应用白色圆圈shader
    planeObjects.forEach((child) => {
      console.log('Found Plane object:', child.name); // Debug log
      
      const planeMaterial = new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        uniforms: {
          color: { value: new THREE.Color('#ffffff') }, // 白色
          time: { value: 0 }
        },
        vertexShader: circlePlaneVertexShader,
        fragmentShader: circlePlaneFragmentShader,
      });
      
      child.material = planeMaterial;
      materialsRef.current.push(planeMaterial);
    });

    // 为需要wireframe显示的对象关闭线框模式（按需求）
    wireframeObjects.forEach((child) => {
      console.log('Disable wireframe for object:', child.name);
      if (child.material) {
        child.material.wireframe = false;
      }
    });
    
    // 为Torus/Icosphere/Cube/Box/Cone创建动态连线
    // 收集所选对象的顶点世界坐标与UV，尽量减少对象分配
    const torusVertexGroups = []; // 每个对象一个顶点数组（标量结构）
    
    torusObjects.forEach((mesh) => {
      const geometry = mesh.geometry;
      if (!geometry || !geometry.attributes || !geometry.attributes.position) return;
      const positionAttribute = geometry.attributes.position;
      const uvAttribute = geometry.attributes.uv;
      const worldMatrix = mesh.matrixWorld || mesh.matrix;
      
      // 复用临时向量，避免每顶点创建对象
      const temp = new THREE.Vector3();
      const vertices = [];
      for (let i = 0; i < positionAttribute.count; i++) {
        temp.fromBufferAttribute(positionAttribute, i);
        temp.applyMatrix4(worldMatrix);
        const uvx = uvAttribute ? uvAttribute.getX(i) : 0;
        const uvy = uvAttribute ? uvAttribute.getY(i) : 0;
        // 使用标量记录，减少GC压力
        vertices.push({ x: temp.x, y: temp.y, z: temp.z, uvx, uvy, originalIndex: i });
      }
      torusVertexGroups.push(vertices);
    });
    
    console.log('Total Points objects (Torus/Icosphere/Cube/Box/Cone):', torusVertexGroups.length);
    console.log('- Circle objects:', circleObjects.length, '(类似line的shader效果)');
    
    // 预计算随机连线（只连接UV.Y相同且相邻的顶点）
    const linePositions = [];
    const lineFadeOffsets = [];
    let linesCreated = 0;
    const MAX_TOTAL_SEGMENTS = 8000; // 全局上限：最多生成的线段数量（性能保护）
    const targetLines = 2000; // 增加到200条线
    
    // 对每个Points对象（Torus/Icosphere/Cube），按UV.Y分组并在同一圈上连接相邻顶点
    torusVertexGroups.forEach((vertices) => {
      // 按UV.Y分组（容差0.02，更精确）
      const uvYGroups = {};
      const tolerance = 0.02;
      
      vertices.forEach((vertexData) => {
        const uvY = vertexData.uvy;
        const key = Math.round(uvY / tolerance) * tolerance;
        
        if (!uvYGroups[key]) {
          uvYGroups[key] = [];
        }
        uvYGroups[key].push(vertexData);
      });
      
      // 在每个UV.Y组内，按UV.X排序后仅连接相邻两点（简化为纯线段）
      Object.values(uvYGroups).forEach((group) => {
        if (linesCreated >= MAX_TOTAL_SEGMENTS) return;
        if (group.length < 2) return;
        
        // 排序后连接相邻两点
        group.sort((a, b) => a.uvx - b.uvx);
        
        const sharedFadeOffset = Math.random() * Math.PI * 2;
        for (let j = 0; j < group.length - 1; j++) {
          if (linesCreated >= MAX_TOTAL_SEGMENTS) break;
          const v1 = group[j];
          const v2 = group[j + 1];
          
          const dx = v1.x - v2.x; const dy = v1.y - v2.y; const dz = v1.z - v2.z;
          const dist = Math.hypot(dx, dy, dz);
          if (dist < 0.01 || dist > 3.0) continue;
          
          linePositions.push(v1.x, v1.y, v1.z);
          linePositions.push(v2.x, v2.y, v2.z);
          lineFadeOffsets.push(sharedFadeOffset);
          linesCreated++;
        }
      });
    });
    
    console.log('Dynamic lines created (adjacent vertices only):', linesCreated, '(capped at', MAX_TOTAL_SEGMENTS, ')');
    
    // 单材质 + 单几何：将所有线段合并，使用 per-vertex fadeOffset attribute
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    
    // 每条线段两个顶点，各自对应一个 uv.x（0,1），已按对顺序填充
    const segmentCount = linePositions.length / 6;
    const uvs = new Float32Array(segmentCount * 4);
    for (let s = 0; s < segmentCount; s++) {
      uvs[s * 4 + 0] = 0.0; uvs[s * 4 + 1] = 0.0;
      uvs[s * 4 + 2] = 1.0; uvs[s * 4 + 3] = 0.0;
    }
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    
    // 将每条线段的 fadeOffset 展开到两个顶点
    const fadeAttr = new Float32Array(segmentCount * 2);
    for (let s = 0; s < segmentCount; s++) {
      const off = lineFadeOffsets[s];
      fadeAttr[s * 2 + 0] = off;
      fadeAttr[s * 2 + 1] = off;
    }
    geometry.setAttribute('fadeOffset', new THREE.BufferAttribute(fadeAttr, 1));
    
    // 单一材质，统一 time 与 color
    const lineMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        color: { value: new THREE.Color('#ffffff') },
        time: { value: 0 }
      },
      vertexShader: torusLinesVertexShader,
      fragmentShader: torusLinesFragmentShader,
    });
    lineMaterialsRef.current = [lineMaterial];
    
    const segmentGroup = new THREE.LineSegments(geometry, lineMaterial);
    const lineSegments = [segmentGroup];
    
    // 创建一个group来存储所有连线
    const linesGroup = new THREE.Group();
    lineSegments.forEach(seg => linesGroup.add(seg));
    cloned.add(linesGroup);
    linesGroupRef.current = linesGroup;
    
    return cloned;
  }, [scene]);

  // 根据visible prop控制显示/隐藏
  useEffect(() => {
    if (group.current) {
      group.current.visible = visible;
      console.log('Questions visibility:', visible);
      
      // Debug: 输出模型的位置和边界框
      if (visible && clonedScene) {
        const bbox = new THREE.Box3().setFromObject(clonedScene);
        console.log('Questions Model Bounding Box:', bbox);
        console.log('Questions Model Center:', bbox.getCenter(new THREE.Vector3()));
      }
    }
  }, [visible, clonedScene]);

  // 清理：组件卸载或克隆场景变更时，释放连线组几何与材质，并清空引用，避免内存缓慢增长
  useEffect(() => {
    return () => {
      // 移除并释放连线组
      if (linesGroupRef.current) {
        const groupNode = linesGroupRef.current;
        // 释放所有 LineSegments 的几何与材质
        groupNode.traverse((obj) => {
          if (obj.isLineSegments) {
            if (obj.geometry) {
              obj.geometry.dispose();
            }
            if (obj.material) {
              // 可能是数组或单材质
              const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
              mats.forEach(m => m && m.dispose && m.dispose());
            }
          }
        });
        if (groupNode.parent) {
          groupNode.parent.remove(groupNode);
        }
        linesGroupRef.current = null;
      }
      // 释放材质池
      materialsRef.current.forEach(m => m && m.dispose && m.dispose());
      lineMaterialsRef.current.forEach(m => m && m.dispose && m.dispose());
      materialsRef.current = [];
      lineMaterialsRef.current = [];
      torusPointsRef.current = [];
    };
  }, [clonedScene]);

  return (
    <group ref={group}>
      <primitive object={clonedScene} />
      
      {/* 为每个Points对象添加3D标签（仅在Questions可见时显示） */}
      {visible && torusPointsRef.current.map((torusPoints, idx) => {
        if (!torusPoints) return null;
        
        // 获取Points对象的位置
        const pos = torusPoints.position;
        
        // 根据名称判断标签（适用于Torus/Icosphere/Cube对象）
        const nameLower = torusPoints.name.toLowerCase();
        
        let label;
        if (nameLower === 'human_control') {
          label = 'people manage AI?';
        } else if (nameLower === 'human_controled') {
          label = 'AI manage people?';
        } else if (nameLower.includes('icosphere')) {
          label = 'the many?';
        } else if (nameLower.includes('cube')) {
          label = 'the few?';
        } else if (nameLower.includes('cone')) {
          label = 'rapid?';
        } else if (nameLower.includes('box')) {
          label = 'stagnate?';
        } else if (nameLower.includes('torus')) {
          // Torus对象使用原来的逻辑
          const isTorusB = nameLower.includes('b');
          label = isTorusB ? 'Breakthroughs?' : 'Breakdowns?';
        } else {
          // 默认标签
          label = 'Unknown';
        }
        
        // 计算callout的位置
        const anchorPoint = pos; // 锚点在Points对象位置
        const labelPosition = new THREE.Vector3(
          pos.x + 3, // 两个标签都向右偏移3单位
          pos.y + 1, // 向上偏移
          pos.z
        );
        
        // 直接让连线连接到标签中心，然后通过CSS调整标签显示位置
        const adjustedLabelPosition = labelPosition;
        
        return (
          <group key={idx}>
            {/* 锚点 - 小圆球 */}
            <mesh position={[anchorPoint.x, anchorPoint.y, anchorPoint.z]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            
            {/* 连接线 */}
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([
                    anchorPoint.x, anchorPoint.y, anchorPoint.z,
                    adjustedLabelPosition.x, adjustedLabelPosition.y, adjustedLabelPosition.z
                  ])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#ffffff" linewidth={2} />
            </line>
            
            {/* 标签 */}
          <Html
              position={[adjustedLabelPosition.x, adjustedLabelPosition.y, adjustedLabelPosition.z]}
            center
            distanceFactor={1}
              zIndexRange={[100, 200]}
            style={{
              pointerEvents: 'none',
              userSelect: 'none',
                fontSize: '20px',
                zIndex: 100
            }}
          >
              <div 
                className="text-white font-light whitespace-nowrap px-3 py-1"
                style={{
                  textShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backgroundColor: 'transparent',
                  transform: 'translateX(50%)', // 向右偏移50%，让连线看起来连接到左边缘
                  transformOrigin: 'left center'
                }}
              >
              {label}
            </div>
          </Html>
          </group>
        );
      })}
    </group>
  );
}

/*
* 相机组件，接收进度和调试控制 ✅
*/ 
function CameraRig({ scrollProgress, debugControls = false }) {
  const { camera, gl, size, set } = useThree();
  const startPos = useMemo(() => new THREE.Vector3(-5, 1, 8), []); 
  const midPos = useMemo(() => new THREE.Vector3(20, 4, 0), []); // 50%时的位置
  const endPos = useMemo(() => new THREE.Vector3(30, 4, -10), []); // 100%时的位置
  
  const startLookAt = useMemo(() => new THREE.Vector3(0, 0, -1), []);
  const midLookAt = useMemo(() => new THREE.Vector3(30, 4, 0), []); // 50%时看向的位置
  const endLookAt = useMemo(() => new THREE.Vector3(40, 4, 10), []); // 100%时看向的位置
  const currentLookAt = useMemo(() => new THREE.Vector3(), []);
  
  // 正交相机的基准位置（40%时落到此基准），以及从该基准向下的逐级位移
  const orthoBasePos = useMemo(() => new THREE.Vector3(-4, 0, 1), []); // 40%基准位置
  const orthoBaseLookAt = useMemo(() => new THREE.Vector3(-3, -0.5, 0), []); // 40%基准看向
  const orthoStartPos = useMemo(() => new THREE.Vector3(orthoBasePos.x, orthoBasePos.y + 20, orthoBasePos.z), []); // 初始在基准之上20
  const orthoStartLookAt = useMemo(() => new THREE.Vector3(orthoBaseLookAt.x, orthoBaseLookAt.y + 20, orthoBaseLookAt.z), []); // 初始lookAt同样上移20

  // 阶段化Y轴偏移：在对应滚动阈值时，相对基准向下偏移的量（单位：同场景单位）
  const ORTHO_Y_STEPS = useMemo(() => (
    [
      { at: 0.40, offsetY: 0 },    // 40%-50%：落到基准
      { at: 0.50, offsetY: -10 },  // 50%-60%：再向下10
      { at: 0.60, offsetY: -20 },  // 60%-70%：再向下10（累计-20）
      { at: 0.70, offsetY: -30 },  // 70%-80%：再向下10（累计-30）
    ]
  ), []);

  // 创建正交相机
  const orthographicCamera = useMemo(() => {
    const aspect = size.width / size.height;
    const frustumSize = 8;
    const cam = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    );
    // 设置初始位置为orthoStartPos（比最终位置向上20单位）
    cam.position.copy(orthoStartPos);
    cam.lookAt(orthoStartLookAt);
    console.log('Orthographic camera initial position:', orthoStartPos);
    console.log('Orthographic camera initial lookAt:', orthoStartLookAt);
    return cam;
  }, [size.width, size.height, orthoStartPos, orthoStartLookAt]);
  
  const perspectiveCamera = useRef(camera);
  const currentCameraType = useRef('perspective'); // 跟踪当前相机类型
  const orthoTransitionStartTime = useRef(null); // 正交相机过渡开始时间
  const currentStepIndexRef = useRef(-1); // 当前所处的分段索引
  const fromPosRef = useRef(null); // 过渡起始位置
  const fromLookAtRef = useRef(null); // 过渡起始lookAt
  const toPosRef = useRef(null); // 过渡目标位置
  const toLookAtRef = useRef(null); // 过渡目标lookAt

  // 根据滚动进度获取当前应处于的分段索引
  const getStepIndex = (p) => {
    let idx = -1;
    for (let i = 0; i < ORTHO_Y_STEPS.length; i++) {
      if (p >= ORTHO_Y_STEPS[i].at) idx = i; else break;
    }
    return idx;
  };

  const getTargetFromStep = (stepIndex) => {
    if (stepIndex < 0) {
      return { pos: orthoStartPos, lookAt: orthoStartLookAt };
    }
    const offsetY = ORTHO_Y_STEPS[stepIndex].offsetY;
    const pos = new THREE.Vector3(orthoBasePos.x, orthoBasePos.y + offsetY, orthoBasePos.z);
    const lookAt = new THREE.Vector3(orthoBaseLookAt.x, orthoBaseLookAt.y + offsetY, orthoBaseLookAt.z);
    return { pos, lookAt };
  };

  useFrame(({ gl, clock }) => {
    if (debugControls) return; // 调试时让 OrbitControls 接管相机
    const p = scrollProgress;
    
    // 40%之前使用透视相机
    if (p < 0.40) {
      // 如果当前是正交相机，切换回透视相机
      if (currentCameraType.current === 'orthographic') {
        set({ camera: perspectiveCamera.current });
        gl.render.camera = perspectiveCamera.current;
        currentCameraType.current = 'perspective';
        orthoTransitionStartTime.current = null;
        currentStepIndexRef.current = -1;
        fromPosRef.current = null;
        fromLookAtRef.current = null;
        toPosRef.current = null;
        toLookAtRef.current = null;
        console.log('Switched to Perspective Camera');
      }
    
    if (p <= 0.10) {
      // 第一阶段：0% -> 10%
      const t = p * 10; // 将0-0.10映射到0-1
      camera.position.lerpVectors(startPos, midPos, t);
      currentLookAt.lerpVectors(startLookAt, midLookAt, t);
    } else if (p <= 0.16) {
      // 第二阶段：10% -> 16% 保持不动
      camera.position.copy(midPos);
      currentLookAt.copy(midLookAt);
    } else {
        // 第三阶段：16% -> 40%
        const t = (p - 0.16) / 0.24; // 将0.16-0.40映射到0-1
        camera.position.lerpVectors(midPos, endPos, Math.min(t, 1));
        currentLookAt.lerpVectors(midLookAt, endLookAt, Math.min(t, 1));
    }
    
    camera.lookAt(currentLookAt);
    } else {
      // 40%之后使用正交相机
      if (currentCameraType.current === 'perspective') {
        // 首次切换到正交相机
        set({ camera: orthographicCamera });
        gl.render.camera = orthographicCamera;
        currentCameraType.current = 'orthographic';
        orthoTransitionStartTime.current = clock.getElapsedTime();
        // 切换至正交后，先从起始位置过渡到 40% 的基准位置
        const target = getTargetFromStep(0); // 40%段
        fromPosRef.current = orthoStartPos;
        fromLookAtRef.current = orthoStartLookAt;
        toPosRef.current = target.pos;
        toLookAtRef.current = target.lookAt;
        currentStepIndexRef.current = 0;
        console.log('Switched to Orthographic Camera, transitioning from start to 40% baseline');
      }
      // 依据滚动进度判断应处于的分段（40/50/60/70）
      const desiredStep = getStepIndex(p);
      if (desiredStep !== currentStepIndexRef.current && orthoTransitionStartTime.current === null) {
        // 分段发生变化，开始一次新的过渡
        const fromTarget = getTargetFromStep(currentStepIndexRef.current);
        const toTarget = getTargetFromStep(desiredStep);
        fromPosRef.current = fromTarget.pos;
        fromLookAtRef.current = fromTarget.lookAt;
        toPosRef.current = toTarget.pos;
        toLookAtRef.current = toTarget.lookAt;
        currentStepIndexRef.current = desiredStep;
        orthoTransitionStartTime.current = clock.getElapsedTime();
        console.log(`Starting ortho step transition to index ${desiredStep}`);
      }

      // 正交相机的1秒过渡动画（加入缓动）
      if (orthoTransitionStartTime.current !== null) {
        const elapsed = clock.getElapsedTime() - orthoTransitionStartTime.current;
        const transitionProgress = Math.min(elapsed / 1.0, 1.0); // 1秒过渡
        // 使用 easeInOutSine 缓动，让过渡更自然
        const easedProgress = 0.5 - 0.5 * Math.cos(Math.PI * transitionProgress);
        const tempPos = new THREE.Vector3();
        const tempLookAt = new THREE.Vector3();
        tempPos.lerpVectors(fromPosRef.current, toPosRef.current, easedProgress);
        tempLookAt.lerpVectors(fromLookAtRef.current, toLookAtRef.current, easedProgress);
        orthographicCamera.position.copy(tempPos);
        orthographicCamera.lookAt(tempLookAt);
        orthographicCamera.updateProjectionMatrix();
        
        // 过渡完成后清除时间标记
        if (transitionProgress >= 1.0) {
          orthoTransitionStartTime.current = null;
          fromPosRef.current = null;
          fromLookAtRef.current = null;
          toPosRef.current = null;
          toLookAtRef.current = null;
        }
      } else {
        // 过渡完成后，根据当前分段保持目标位置
        const target = getTargetFromStep(getStepIndex(p));
        orthographicCamera.position.copy(target.pos);
        orthographicCamera.lookAt(target.lookAt);
        orthographicCamera.updateProjectionMatrix();
      }
    }
  });
  return null;
}

/*
* 主组件 ✅
*/ 
export default function ChapterOnePage() {
  console.log('COMPONENT RENDERED');
  const scrollContainerRef = useRef(null);
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);
  const section3ChartRef = useRef(null);
  const section3BlurOverlayRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const section4Ref = useRef(null);
  const section5Ref = useRef(null);
  const section6Ref = useRef(null);
  const section7Ref = useRef(null);
  const section8Ref = useRef(null);
  const section9Ref = useRef(null);
  const section10Ref = useRef(null);
  
  // 使用React state存储滚动进度（声明式方式）
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldEnableBloom, setShouldEnableBloom] = useState(false);
  
  // 计算neon材质进度
  const neonProgress = useMemo(() => {
    const scrollFactor = Math.min(scrollProgress * 2, 1);
    return 0.3 + scrollFactor * 0.65; // 0.3 -> 0.95
  }, [scrollProgress]);

  // 根据scrollProgress更新Bloom状态
  useEffect(() => {
    console.log('USEEFFECT TRIGGERED - scrollProgress:', scrollProgress);
    const newBloomState = scrollProgress >= 0.70;
    setShouldEnableBloom(newBloomState);
    console.log('BLOOM STATE:', newBloomState ? 'bloom yes' : 'bloom no');
  }, [scrollProgress]);

  // 处理加载完成
  const handleLoadingComplete = () => {
    setIsLoading(false);
    // Loading screen消失后，播放Section1字符级炫酷闪现入场
    setTimeout(() => {
      if (section1Ref.current) {
        // 仅拆分主标题和右下角副标题，不处理小字段落
        const titleEl = section1Ref.current.querySelector('h1');
        const subEl = section1Ref.current.querySelector('.fancy-text');

        const splitTitle = titleEl ? new SplitType(titleEl, { types: 'chars,words' }) : null;
        const splitSub = subEl ? new SplitType(subEl, { types: 'chars,words' }) : null;

        const initChars = (chars) => {
          chars.forEach((char) => {
            char.style.opacity = '0';
            char.style.transform = 'translateY(20px)';
            char.style.filter = 'blur(6px)';
            char.style.textShadow = '0 0 0 rgba(80,200,255,0)';
            char.style.willChange = 'transform, opacity, filter, text-shadow';
          });
        };

        if (splitTitle) initChars(splitTitle.chars);
        if (splitSub) initChars(splitSub.chars);

        // 让Section可见
        gsap.set(section1Ref.current, { opacity: 1 });

        const tl = gsap.timeline();

        // 1) 主标题入场
        if (splitTitle && splitTitle.chars.length) {
          const titleChars = splitTitle.chars;
          tl.fromTo(titleChars,
            {
              opacity: 0,
              y: 20,
              filter: 'blur(6px)',
              textShadow: '0 0 0 rgba(80,200,255,0)'
            },
            {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 0.6,
              ease: 'power3.out',
              stagger: { each: 0.02, from: 'random' },
              onUpdate: function () {
                const progress = this.progress();
                const glow = Math.min(1, progress * 1.5);
                titleChars.forEach((c) => {
                  c.style.textShadow = `0 0 ${12 * glow}px rgba(80,200,255,${0.5 * glow})`;
                });
              }
            }
          );
        }

        // 2) 副标题（右下角）在主标题入场结束后立刻入场（无缝衔接）
        if (splitSub && splitSub.chars.length) {
          const subChars = splitSub.chars;
          tl.fromTo(subChars,
            {
              opacity: 0,
              y: 20,
              filter: 'blur(6px)',
              textShadow: '0 0 0 rgba(80,200,255,0)'
            },
            {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 0.55,
              ease: 'power3.out',
              stagger: { each: 0.02, from: 'random' },
              onUpdate: function () {
                const progress = this.progress();
                const glow = Math.min(1, progress * 1.5);
                subChars.forEach((c) => {
                  c.style.textShadow = `0 0 ${12 * glow}px rgba(80,200,255,${0.5 * glow})`;
                });
              }
            }
          );
        }

        // 3) 两个标题的闪烁段，放在两个入场之后，保持节奏但无缝衔接
        if (splitTitle && splitTitle.chars.length) {
          const titleChars = splitTitle.chars;
          tl.to(titleChars, {
            duration: 0.2,
            ease: 'sine.inOut',
            opacity: (i, el) => 0.9 + Math.random() * 0.1,
            filter: 'blur(0.5px)',
            yoyo: true,
            repeat: 1,
            stagger: { each: 0.015, from: 'random' }
          });
        }

        if (splitSub && splitSub.chars.length) {
          const subChars = splitSub.chars;
          tl.to(subChars, {
            duration: 0.2,
            ease: 'sine.inOut',
            opacity: (i, el) => 0.9 + Math.random() * 0.1,
            filter: 'blur(0.5px)',
            yoyo: true,
            repeat: 1,
            stagger: { each: 0.012, from: 'random' }
          });
        }
      }
    }, 100);
  };


  // 滚动动画
  useEffect(() => {
    // 创建一个可被GSAP动画化的对象
    const scrollData = { progress: 0 };
    
    // 存储动画触发状态
    let s1Triggered = false;
    let s2FadeInTriggered = false;
    let s2FadeOutTriggered = false;
    let s3Triggered = false;
    let s3FadeOutTriggered = false;
    let s4Triggered = false;
    let s5Triggered = false;
    let s6Triggered = false;
    let s7Triggered = false;
    let s8Triggered = false;
    let s9Triggered = false;
    let s10Triggered = false;
    
    const ctx = gsap.context(() => {
      const container = scrollContainerRef.current;
      
      // ===== 创建所有动画时间轴 =====
      
      // Section 1: 标题淡出（初始状态为0，等待loading screen消失后淡入）
      gsap.set(section1Ref.current, { opacity: 0 });
      const s1FadeOut = gsap.timeline({ paused: true })
        .to(section1Ref.current, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut"
        });
      
      // Section 2: 文字淡入淡出
      gsap.set(section2Ref.current, { opacity: 0 });
      const s2FadeIn = gsap.timeline({ paused: true })
        .to(section2Ref.current, {
          opacity: 1,
          duration: 0.5,
          ease: "power2.inOut"
        });
      const s2FadeOut = gsap.timeline({ paused: true })
        .to(section2Ref.current, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut"
        });
      
      // Section 3: 图表淡入/淡出（全局遮罩，定位到图表区域，避免与section透明度冲突）
      gsap.set(section3Ref.current, { opacity: 0 });
      if (section3BlurOverlayRef.current) gsap.set(section3BlurOverlayRef.current, { opacity: 0, display: 'none' });
      const s3FadeIn = gsap.timeline({ paused: true })
        .to(section3Ref.current, {
          opacity: 1,
          duration: 0.5,
          ease: "power2.inOut"
        }, 0)
        .call(() => {
          if (!section3ChartRef.current || !section3BlurOverlayRef.current) return;
          
          const rect = section3ChartRef.current.getBoundingClientRect();
          const blurOverlay = section3BlurOverlayRef.current;
          // 将遮罩定位到图表区域（相对于视口）
          blurOverlay.style.left = rect.left + 'px';
          blurOverlay.style.top = rect.top + 'px';
          blurOverlay.style.width = rect.width + 'px';
          blurOverlay.style.height = rect.height + 'px';
          blurOverlay.style.display = 'block';
        }, null, 0)
        .to(section3BlurOverlayRef.current, {
          opacity: 1,
          duration: 0.5,
          ease: "power2.inOut"
        }, 0);
      const s3FadeOut = gsap.timeline({ paused: true })
        .to(section3Ref.current, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut"
        }, 0)
        .to(section3BlurOverlayRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut",
          onComplete: () => {
            if (section3BlurOverlayRef.current) {
              section3BlurOverlayRef.current.style.display = 'none';
            }
          }
        }, 0);
      
      // Section 4: Quotes Carousel淡入/淡出
      gsap.set(section4Ref.current, { opacity: 0 });
      const s4FadeIn = gsap.timeline({ paused: true })
        .to(section4Ref.current, {
          opacity: 1,
          duration: 0.5,
          ease: "power2.inOut"
        });
      const s4FadeOut = gsap.timeline({ paused: true })
        .to(section4Ref.current, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut"
        });
      
      // Section 5: Question scene淡入
      gsap.set(section5Ref.current, { opacity: 0 });
      const s5FadeIn = gsap.timeline({ paused: true })
        .to(section5Ref.current, {
          opacity: 1,
          duration: 0.5,
          ease: "power2.inOut"
        });
      
      // Section 6: Question B scene淡入
      gsap.set(section6Ref.current, { opacity: 0 });
      const s6FadeIn = gsap.timeline({ paused: true })
        .to(section6Ref.current, {
          opacity: 1,
          duration: 0.5,
          ease: "power2.inOut"
        });
      
      // Section 7: 预留场景淡入
      gsap.set(section7Ref.current, { opacity: 0 });
      const s7FadeIn = gsap.timeline({ paused: true })
        .to(section7Ref.current, {
          opacity: 1,
          duration: 0.5,
          ease: "power2.inOut"
        });
      
      // Section 8: 预留场景淡入
      gsap.set(section8Ref.current, { opacity: 0 });
      const s8FadeIn = gsap.timeline({ paused: true })
        .to(section8Ref.current, {
          opacity: 1,
          duration: 0.5,
          ease: "power2.inOut"
        });
      
      // Section 9: 预留场景淡入
      gsap.set(section9Ref.current, { opacity: 0 });
      const s9FadeIn = gsap.timeline({ paused: true })
        .to(section9Ref.current, {
          opacity: 1,
          duration: 0.5,
          ease: "power2.inOut"
        });
      
      // Section 10: 预留场景淡入
      gsap.set(section10Ref.current, { opacity: 0 });
      const s10FadeIn = gsap.timeline({ paused: true })
        .to(section10Ref.current, {
          opacity: 1,
          duration: 0.5,
          ease: "power2.inOut"
        });
      
      // ===== 主timeline：用scrub控制progress，用.call()触发HTML动画 =====
      const mainTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: 2, // 2秒阻尼
        }
      });
      
      // 动画一个dummy对象，让timeline有内容（受scrub控制）
      const dummy = { value: 0 };
      let lastProgress = 0;
      
      mainTimeline.to(dummy, {
        value: 1,
        duration: 1,
        ease: "none",
        onUpdate: function() {
          // 每帧更新progress（受scrub影响，有延迟）
          const p = this.progress();
          scrollData.progress = p;
          setScrollProgress(p);
          
          // 检测滚动方向
          const isReversing = p < lastProgress;
          
          // === 基于区间的状态管理（更可靠） ===
          
          // Section 1 应该可见的区间：0-8%
          if (p >= 0 && p < 0.08) {
            // 应该可见
            if (!s1Triggered) {
              s1Triggered = true;
              s1FadeOut.reverse();
            }
          } else {
            // 应该隐藏
            if (s1Triggered) {
              s1Triggered = false;
              s1FadeOut.play();
            }
          }
          
          // Section 2 应该可见的区间：10%-18%
          if (p >= 0.10 && p < 0.18) {
            // 应该可见
            if (s2FadeOutTriggered) {
              // 如果之前淡出了，重新淡入
              s2FadeOutTriggered = false;
              s2FadeInTriggered = true;
              s2FadeOut.pause();
              s2FadeIn.restart();
            } else if (!s2FadeInTriggered) {
              // 如果还没淡入过，触发淡入
              s2FadeInTriggered = true;
              s2FadeIn.restart();
            }
          } else {
            // 应该隐藏
            if (s2FadeInTriggered) {
              s2FadeInTriggered = false;
              s2FadeIn.reverse();
            }
          }
          
          // Section 3 应该可见的区间：20%-28%
          if (p >= 0.20 && p < 0.28) {
            // 应该可见
            if (s3FadeOutTriggered) {
              // 如果之前淡出了，重新淡入
              s3FadeOutTriggered = false;
              s3Triggered = true;
              s3FadeOut.pause();
              s3FadeIn.restart();
            } else if (!s3Triggered) {
              // 如果还没淡入过，触发淡入
              s3Triggered = true;
              s3FadeIn.restart();
            }
          } else {
            // 应该隐藏
            if (s3Triggered) {
              s3Triggered = false;
              s3FadeIn.reverse();
            }
          }
          
          // Section 4 应该可见的区间：30%-38%
          if (p >= 0.30 && p < 0.38) {
            // 应该可见
            if (!s4Triggered) {
              s4Triggered = true;
              s4FadeIn.restart();
            }
          } else {
            // 应该隐藏
            if (s4Triggered) {
              s4Triggered = false;
              s4FadeIn.reverse();
            }
          }
          
          // Section 5 应该可见的区间：40%-48%
          if (p >= 0.40 && p < 0.48) {
            // 应该可见
            if (!s5Triggered) {
              s5Triggered = true;
              s5FadeIn.restart();
            }
          } else {
            // 应该隐藏
            if (s5Triggered) {
              s5Triggered = false;
              s5FadeIn.reverse();
            }
          }
          
          // Section 6 应该可见的区间：50%-58%
          if (p >= 0.50 && p < 0.58) {
            // 应该可见
            if (!s6Triggered) {
              s6Triggered = true;
              s6FadeIn.restart();
            }
          } else {
            // 应该隐藏
            if (s6Triggered) {
              s6Triggered = false;
              s6FadeIn.reverse();
            }
          }
          
          // Section 7 应该可见的区间：60%-68%
          if (p >= 0.60 && p < 0.68) {
            // 应该可见
            if (!s7Triggered) {
              s7Triggered = true;
              s7FadeIn.restart();
            }
          } else {
            // 应该隐藏
            if (s7Triggered) {
              s7Triggered = false;
              s7FadeIn.reverse();
            }
          }
          
          // Section 8 应该可见的区间：70%-78%
          if (p >= 0.70 && p < 0.78) {
            // 应该可见
            if (!s8Triggered) {
              s8Triggered = true;
              s8FadeIn.restart();
            }
          } else {
            // 应该隐藏
            if (s8Triggered) {
              s8Triggered = false;
              s8FadeIn.reverse();
            }
          }
          
          // Section 9 应该可见的区间：80%-88%
          if (p >= 0.80 && p < 0.88) {
            // 应该可见
            if (!s9Triggered) {
              s9Triggered = true;
              s9FadeIn.restart();
            }
          } else {
            // 应该隐藏
            if (s9Triggered) {
              s9Triggered = false;
              s9FadeIn.reverse();
            }
          }
          
          // Section 10 应该可见的区间：90%-98%
          if (p >= 0.90 && p < 0.98) {
            // 应该可见
            if (!s10Triggered) {
              s10Triggered = true;
              s10FadeIn.restart();
            }
          } else {
            // 应该隐藏
            if (s10Triggered) {
              s10Triggered = false;
              s10FadeIn.reverse();
            }
          }
          
          lastProgress = p;
        }
      });
      
      // 在timeline的特定位置触发HTML动画（位置受scrub控制，但动画独立播放）
      mainTimeline.call(() => {
        if (!s1Triggered) {
          s1Triggered = true;
          s1FadeOut.reverse();
        }
      }, null, 0.00);
      
      mainTimeline.call(() => {
        if (!s2FadeInTriggered) {
          s2FadeInTriggered = true;
          s2FadeOutTriggered = false;
          s2FadeIn.play();
        }
      }, null, 0.10);
      
      mainTimeline.call(() => {
        if (!s3Triggered) {
          s3Triggered = true;
          s3FadeIn.play();
        }
      }, null, 0.20);
      
      mainTimeline.call(() => {
        if (!s4Triggered) {
          s4Triggered = true;
          s4FadeIn.play();
        }
      }, null, 0.30);
      
      mainTimeline.call(() => {
        if (!s5Triggered) {
          s5Triggered = true;
          s5FadeIn.play();
        }
      }, null, 0.40);
      
      mainTimeline.call(() => {
        if (!s6Triggered) {
          s6Triggered = true;
          s6FadeIn.play();
        }
      }, null, 0.50);
      
      mainTimeline.call(() => {
        if (!s7Triggered) {
          s7Triggered = true;
          s7FadeIn.play();
        }
      }, null, 0.60);
      
      mainTimeline.call(() => {
        if (!s8Triggered) {
          s8Triggered = true;
          s8FadeIn.play();
        }
      }, null, 0.70);
      
      mainTimeline.call(() => {
        if (!s9Triggered) {
          s9Triggered = true;
          s9FadeIn.play();
        }
      }, null, 0.80);
      
      mainTimeline.call(() => {
        if (!s10Triggered) {
          s10Triggered = true;
          s10FadeIn.play();
        }
      }, null, 0.90);

    });

    return () => ctx.revert();
  }, []);

  // 渲染
  return (
    <div className="overflow-x-hidden">
      {/* 加载屏幕 */}
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      {/* 渐变背景 */}
    <div 
        className="fixed inset-0 w-screen h-screen pointer-events-none"
      style={{
        backgroundImage: 'url(/images/gradient.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0
        }}
      />

      {/* 3D Canvas - 固定背景层 */}
      <div 
        ref={canvasContainerRef}
        className="fixed inset-0 w-screen h-screen" 
        style={{ 
          zIndex: 1,
          transform: 'translateZ(0)', // 强制创建合成层
          willChange: 'transform, filter' // 优化渲染
      }}
    >
      <Canvas
          gl={{ 
            antialias: true, 
            toneMapping: THREE.ACESFilmicToneMapping, 
            alpha: true,
            preserveDrawingBuffer: true // 保留绘制缓冲，让backdrop-filter可以访问
          }}
        camera={{ fov: 50, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <Stats showPanel={0} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[2, 3, 5]} intensity={0.6} />

          {/* 通过props传递进度（声明式） */}
          <CameraRig scrollProgress={scrollProgress} debugControls={false} />
          <ModelLoader scrollProgress={neonProgress} visible={scrollProgress < 0.40} />
          <Questions scrollProgress={scrollProgress} visible={scrollProgress >= 0.40 && scrollProgress < 0.80} />
          <GalleryTunnel scrollProgress={scrollProgress} />

          {/* 后处理效果 - 只在滚动70%以上启用Bloom */}
          <EffectComposer>
            {shouldEnableBloom && (
              <Bloom 
                intensity={0.5} 
                luminanceThreshold={0.1} 
                mipmapBlur 
                luminanceSmoothing={0.9}
                radius={0.2}
              />
            )}
          </EffectComposer>
        </Canvas>
      </div>

      {/* 固定导航 - 左上角（加载时隐藏） */}
      <Navigation isLoading={isLoading} />

      {/* 滚动容器 - 创建滚动高度 */}
      <div ref={scrollContainerRef} className="relative w-screen pointer-events-none" style={{ height: '2000vh', zIndex: 10 }}>
        {/* Section 1: 标题 */}
        <Section1 ref={section1Ref} />

        {/* Section 2: 第二段文字 */}
        <Section2 ref={section2Ref} />

        {/* Section 3: 图表 */}
        <Section3 
          ref={section3Ref}
          onRefsReady={(chartRef, blurOverlayRef) => {
            section3ChartRef.current = chartRef.current;
            section3BlurOverlayRef.current = blurOverlayRef.current;
          }}
        />

        {/* Section 4: Quotes Carousel */}
        <Section4 ref={section4Ref} />

        {/* Section 5: Question A Scene */}
        <SectionTitle ref={section5Ref} sectionId="section5" scrollProgress={scrollProgress} />

        {/* Section 6: Question B Scene */}
        <SectionTitle ref={section6Ref} sectionId="section6" scrollProgress={scrollProgress} />

        {/* Section 7: Question C Scene */}
        <SectionTitle ref={section7Ref} sectionId="section7" scrollProgress={scrollProgress} />

        {/* Section 8: Question D Scene */}
        <SectionTitle ref={section8Ref} sectionId="section8" scrollProgress={scrollProgress} />

        {/* Section 9: Coming Soon */}
        <Section9 ref={section9Ref} />

        {/* Section 10: Coming Soon */}
        <Section10 ref={section10Ref} />
      </div>

      {/* 固定的滚动提示（加载时隐藏） */}
      {!isLoading && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-xs opacity-70 pointer-events-none text-white" style={{ zIndex: 50 }}>
          Scroll ↓
        </div>
      )}

      {/* Debug: 显示滚动进度 */}
      <DebugUI scrollProgress={scrollProgress} neonProgress={neonProgress} />
    </div>
  );
}

