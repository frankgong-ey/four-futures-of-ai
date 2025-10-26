"use client";

import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRouter, usePathname } from "next/navigation";
import * as THREE from "three";
import { easing } from "maath";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

// 创建 Context 用于共享当前 section
export const ScrollSectionContext = createContext(null);

// 用于传递当前 section 的 hook
export const useScrollSection = () => useContext(ScrollSectionContext);

// 相机控制器
function CameraController({ targetSection, targetPosition, targetLookAt }) {
  const { camera } = useThree();
  const cameraRef = useRef(camera);

  useFrame((state, delta) => {
    if (!cameraRef.current) return;

    // 使用 easing 让摄像机移动平滑
    const currentPos = cameraRef.current.position;
    const currentTarget = new THREE.Vector3();

    // 获取当前的 look-at 目标（使用相机前方的一个点）
    const cameraDirection = new THREE.Vector3();
    cameraRef.current.getWorldDirection(cameraDirection);
    currentTarget.copy(currentPos).add(cameraDirection.multiplyScalar(5));

    // 目标位置和看向的点
    const targetPos = new THREE.Vector3(...targetPosition);
    const targetLookAtPos = new THREE.Vector3(...targetLookAt);

    // 平滑移动到目标位置
    easing.damp3(currentPos, targetPos, 0.3, delta);
    
    // 计算相机应该看向的方向
    const direction = new THREE.Vector3().subVectors(targetLookAtPos, currentPos).normalize();
    const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, -1),
      direction
    );
    
    // 平滑旋转到目标方向
    cameraRef.current.quaternion.slerp(targetQuaternion, 0.1);
  });

  return null;
};

// 占位符平面
function PlaceholderPlane({ position, color, futureName }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
    </mesh>
  );
};

// 渐变尾迹着色器材质
const FadeTrailMaterial = {
  uniforms: {
    color: { value: new THREE.Color(0x00ffff) }
  },
  vertexShader: `
    attribute float alpha; // 每个顶点的透明度
    
    varying float vAlpha;
    
    void main() {
      vAlpha = alpha;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 color;
    varying float vAlpha;
    
    void main() {
      // 反转透明度：1.0 - vAlpha 让新点更亮，旧点更暗
      gl_FragColor = vec4(color, 1.0 - vAlpha);
    }
  `
};

// 一个粒子的 unit（小球 + 轨迹尾巴）- 性能优化版
function ParticleUnit({ index }) {
  const particleRef = useRef();
  const trailRef = useRef();
  const angleRef = useRef((index / 10) * Math.PI * 2);
  
  // 性能优化：预分配固定长度的数组
  const MAX_TRAIL_LENGTH = 50;
  const positionBuffer = useRef(new Float32Array(MAX_TRAIL_LENGTH * 3)); // 预分配 buffer
  const alphaBuffer = useRef(new Float32Array(MAX_TRAIL_LENGTH)); // 透明度的 buffer
  const currentIndex = useRef(0); // 使用循环索引（ring buffer）
  const trailLength = useRef(0); // 当前轨迹长度
  const geometryInitialized = useRef(false);
  
  // 性能优化：预分配临时 buffer，避免每帧创建
  const actualPositionBuffer = useRef(new Float32Array(MAX_TRAIL_LENGTH * 3));
  const actualAlphaBuffer = useRef(new Float32Array(MAX_TRAIL_LENGTH));

  useFrame((state, delta) => {
    if (!particleRef.current || !trailRef.current) return;

    // 更新角度 - 使用 delta 实现基于时间的动画
    // 0.6 是每秒旋转的弧度数，delta 是上一帧到这一帧的时间（秒）
    // 约等于 60fps 时的 0.01 每帧
    angleRef.current += 0.6 * delta;
    
    // 计算位置
    const radius = 2;
    const x = Math.cos(angleRef.current) * radius;
    const y = 0;
    const z = Math.sin(angleRef.current) * radius;

    particleRef.current.position.set(x, y, z);

    // 性能优化：使用 ring buffer 代替 push/shift
    // 计算写入位置（循环索引）
    const writeIdx = currentIndex.current * 3;
    positionBuffer.current[writeIdx] = x;
    positionBuffer.current[writeIdx + 1] = y;
    positionBuffer.current[writeIdx + 2] = z;
    
    // 更新循环索引和轨迹长度
    currentIndex.current = (currentIndex.current + 1) % MAX_TRAIL_LENGTH;
    if (trailLength.current < MAX_TRAIL_LENGTH) {
      trailLength.current++;
    }
    
    // 设置最大透明度（头部）
    alphaBuffer.current[currentIndex.current] = 0.8;
    
    // 性能优化：只在初始化时创建 geometry，之后只更新数据
    if (!geometryInitialized.current && trailLength.current > 1) {
      const geometry = trailRef.current.geometry;
      const actualLength = MAX_TRAIL_LENGTH;
      
      // 初始化时填充实际收集的数据
      const currentTrailLength = trailLength.current;
      for (let i = 0; i < currentTrailLength; i++) {
        actualPositionBuffer.current[i * 3] = positionBuffer.current[i * 3];
        actualPositionBuffer.current[i * 3 + 1] = positionBuffer.current[i * 3 + 1];
        actualPositionBuffer.current[i * 3 + 2] = positionBuffer.current[i * 3 + 2];
        
        // 渐变：新点透明度高，旧点透明度低
        actualAlphaBuffer.current[i] = 1.0 - (i / currentTrailLength);
      }
      
      // 填充剩余位置为0
      for (let i = currentTrailLength; i < actualLength; i++) {
        actualPositionBuffer.current[i * 3] = actualPositionBuffer.current[currentTrailLength * 3 - 3];
        actualPositionBuffer.current[i * 3 + 1] = actualPositionBuffer.current[currentTrailLength * 3 - 2];
        actualPositionBuffer.current[i * 3 + 2] = actualPositionBuffer.current[currentTrailLength * 3 - 1];
        actualAlphaBuffer.current[i] = 0;
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(actualPositionBuffer.current, 3));
      geometry.setAttribute('alpha', new THREE.BufferAttribute(actualAlphaBuffer.current, 1));
      geometryInitialized.current = true;
    } else if (geometryInitialized.current) {
      // 更新轨迹：重新排列 ring buffer 中的数据为连续线段
      const geometry = trailRef.current.geometry;
      const actualLength = MAX_TRAIL_LENGTH;
      
      // 从当前索引开始，向后复制到结尾
      for (let i = 0; i < MAX_TRAIL_LENGTH - currentIndex.current; i++) {
        const srcIdx = (currentIndex.current + i) * 3;
        actualPositionBuffer.current[i * 3] = positionBuffer.current[srcIdx];
        actualPositionBuffer.current[i * 3 + 1] = positionBuffer.current[srcIdx + 1];
        actualPositionBuffer.current[i * 3 + 2] = positionBuffer.current[srcIdx + 2];
        
        // 计算透明度的索引
        const srcAlphaIdx = (currentIndex.current + i) % MAX_TRAIL_LENGTH;
        actualAlphaBuffer.current[i] = alphaBuffer.current[srcAlphaIdx];
      }
      
      const offset = MAX_TRAIL_LENGTH - currentIndex.current;
      // 然后从开头复制到当前索引之前
      for (let i = 0; i < currentIndex.current; i++) {
        actualPositionBuffer.current[(offset + i) * 3] = positionBuffer.current[i * 3];
        actualPositionBuffer.current[(offset + i) * 3 + 1] = positionBuffer.current[i * 3 + 1];
        actualPositionBuffer.current[(offset + i) * 3 + 2] = positionBuffer.current[i * 3 + 2];
        
        actualAlphaBuffer.current[offset + i] = alphaBuffer.current[i];
      }
      
      // 应用渐变效果
      for (let i = 0; i < actualLength; i++) {
        const fadeFactor = i / actualLength; // 0 到 1
        actualAlphaBuffer.current[i] = 1.0 - fadeFactor; // 从 1.0 渐变到 0
      }
      
      // 性能优化：更新现有 BufferAttribute
      const posAttr = geometry.getAttribute('position');
      const alphaAttr = geometry.getAttribute('alpha');
      
      if (posAttr) {
        posAttr.array.set(actualPositionBuffer.current);
        posAttr.needsUpdate = true;
      }
      
      if (alphaAttr) {
        alphaAttr.array.set(actualAlphaBuffer.current);
        alphaAttr.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      {/* 小球 */}
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#48A9EE" 
          emissiveIntensity={1.0}
        />
      </mesh>
      
      {/* 轨迹尾巴 - 使用渐变 shader */}
      <line ref={trailRef}>
        <bufferGeometry />
        <shaderMaterial 
          attach="material"
          uniforms={{ color: { value: new THREE.Color("#48A9EE") } }}
          vertexShader={FadeTrailMaterial.vertexShader}
          fragmentShader={FadeTrailMaterial.fragmentShader}
          transparent={true}
        />
      </line>
    </group>
  );
}

// Transform 场景的3D效果
// 单个轨道环，包含10个粒子
function OrbitRing({ particlesPerRing, ringIndex, totalRings }) {
  const groupRef = useRef();
  
  // 使用 seed 生成随机但稳定的倾斜角度
  // 为每个环生成不同的随机倾斜，但保持一致性
  const seed = ringIndex * 1234 + 5678;
  
  // 生成伪随机数函数
  const pseudoRandom = (n) => {
    const x = Math.sin(n) * 10000;
    return x - Math.floor(x);
  };
  
  // 随机倾斜到多个轴：x 轴倾斜和 z 轴倾斜
  const xRotation = (pseudoRandom(seed) - 0.5) * Math.PI; // -90 到 +90 度
  const zRotation = (pseudoRandom(seed + 1) - 0.5) * Math.PI * 0.5; // -45 到 +45 度
  const yRotation = (pseudoRandom(seed + 2) - 0.5) * Math.PI * 0.3; // -27 到 +27 度

  useFrame((state, delta) => {
    if (groupRef.current) {
      // 轻微旋转每个轨道环 - 使用 delta 实现基于时间的动画
      groupRef.current.rotation.y += 0.05 * delta;
    }
  });

  return (
    <group 
      ref={groupRef} 
      rotation={[xRotation, yRotation, zRotation]} // 三轴随机倾斜
    >
      {/* 10个粒子 units */}
      {Array.from({ length: particlesPerRing }).map((_, i) => (
        <ParticleUnit 
          key={i} 
          index={i}
        />
      ))}
    </group>
  );
}

function TransformScene({ position }) {
  const containerRef = useRef();
  const ringsCount = 10; // 10个轨道环，每个倾角不同
  
  useFrame((state, delta) => {
    if (containerRef.current) {
      // 轻微旋转整个场景容器 - 使用 delta 实现基于时间的动画
      containerRef.current.rotation.y += 0.025 * delta;
    }
  });

  return (
    <group position={position} ref={containerRef}>
      {/* 10个不同倾角的轨道环 */}
      {Array.from({ length: ringsCount }).map((_, i) => (
        <OrbitRing 
          key={i}
          particlesPerRing={10}
          ringIndex={i}
          totalRings={ringsCount}
        />
      ))}
    </group>
  );
}

// 3D场景组件
function Scene3D({ targetSection }) {
  // 定义每个场景的位置
  const scenePositions = {
    hero: [-10, 0, 0],
    constraint: [0, 0, 0],
    growth: [10, 0, 0],
    transform: [20, 0, 0],
    collapse: [30, 0, 0],
    nextChapter: [40, 0, 0]
  };

  const currentPosition = scenePositions[targetSection] || scenePositions.hero;
  const currentLookAt = [
    currentPosition[0],
    currentPosition[1],
    currentPosition[2]
  ];

  // 特殊处理 hero 和 nextChapter 的相机位置
  let cameraPosition;
  if (targetSection === 'hero') {
    cameraPosition = [-10, 0, 4]; // 从 5 改为 3，让物体更大
  } else if (targetSection === 'nextChapter') {
    cameraPosition = [40, 0, 4]; // 从 5 改为 3，让物体更大
  } else {
    cameraPosition = [
      currentPosition[0],
      currentPosition[1] + 2,
      currentPosition[2] + 4 // 从 5 改为 3，让物体更大
    ];
  }

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 10, 10]} intensity={0.5} />
      
      {/* 相机控制器 */}
      <CameraController 
        targetSection={targetSection}
        targetPosition={cameraPosition}
        targetLookAt={currentLookAt}
      />

      {/* 占位符平面 - Constraint, Growth, Disruption */}
      <PlaceholderPlane 
        position={scenePositions.constraint} 
        color="#FF6B6B" 
        futureName="Constraint"
      />
      <PlaceholderPlane 
        position={scenePositions.growth} 
        color="#4ECDC4" 
        futureName="Growth"
      />
      
      {/* Transform 场景 - 3D效果 */}
      <TransformScene position={scenePositions.transform} />
      
      <PlaceholderPlane 
        position={scenePositions.collapse} 
        color="#96CEB4" 
        futureName="Collapse"
      />
      
      {/* Bloom 后处理效果 */}
      <EffectComposer>
        <Bloom 
          intensity={3.0} 
          luminanceThreshold={0.0}
          luminanceSmoothing={0.9}
          mipmapBlur={true}
        />
      </EffectComposer>
    </>
  );
};

// 全局3D Canvas组件
export default function Global3DCanvas({ currentSection }) {
  const [shouldRender, setShouldRender] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [targetSection, setTargetSection] = useState('hero');

  // 监听路由变化 - 只允许 /futures 路径
  useEffect(() => {
    // 明确排除 /booth 及其他页面
    if (pathname?.startsWith('/futures')) {
      setShouldRender(true);
    } else {
      setShouldRender(false);
    }
  }, [pathname]);

  // 根据 currentSection 更新目标场景
  useEffect(() => {
    // currentSection 可能是 null, "hero", future.id, 或 "nextChapter"
    if (currentSection === null || currentSection === undefined) {
      setTargetSection('hero');
      return;
    }

    // 如果是 nextChapter
    if (currentSection === 'nextChapter') {
      setTargetSection('nextChapter');
      return;
    }

    // 如果是 future.id (如 "constraint", "growth", etc.)
    // 或者可能是带后缀的 (如 "constraint-cp")
    let targetId = currentSection;
    
    // 如果是带后缀的 ID，提取基础部分
    if (currentSection.includes('-')) {
      targetId = currentSection.split('-')[0];
    }
    
    // 映射到场景名称
    const validSections = ['constraint', 'growth', 'transform', 'collapse'];
    if (validSections.includes(targetId)) {
      setTargetSection(targetId);
    } else {
      setTargetSection('hero'); // 默认回到 hero
    }
  }, [currentSection]);

  // 只在需要时渲染3D Canvas
  if (!shouldRender) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas 
        camera={{ position: [-10, 0, 4], fov: 75 }}
        gl={{ 
          alpha: true,
          antialias: true,
          stencil: false,
          depth: true
        }}
      >
        <color attach="background" args={['#000000']} />
        <Scene3D targetSection={targetSection} />
      </Canvas>
    </div>
  );
}
