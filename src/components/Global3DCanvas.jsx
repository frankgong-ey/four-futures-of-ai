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

// 轨道环 shader 材质 - 使用 fragment shader 实现动画
const OrbitRingMaterial = {
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color("#198CE6") },
    highlightColor: { value: new THREE.Color("#ffffff") },
    ringIndex: { value: 0 },
    numRings: { value: 10 }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3 color;
    uniform vec3 highlightColor;
    uniform float ringIndex;
    uniform float numRings;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      // 使用 UV 的 x 坐标，它沿着轨道的方向
      float progress = vUv.x; // 0 到 1
      
      // 高光流动动画 - 参考 neon.frag.glsl
      float highlightSpeed = 0.2; // 调慢了速度
      float highlightWidth = 0.02;
      
      // 计算两个高光位置（沿轨道移动）
      float offset1 = ringIndex * 0.3;
      float offset2 = ringIndex * 0.3 + 0.5; // 第二个高光在轨道对面
      
      float highlightPos1 = mod(time * highlightSpeed + offset1, 1.0);
      float highlightPos2 = mod(time * highlightSpeed + offset2, 1.0);
      
      float dist1 = progress - highlightPos1;
      float dist2 = progress - highlightPos2;
      
      // 处理环绕，确保高光连续流动
      if (dist1 > 0.5) dist1 -= 1.0;
      if (dist1 < -0.5) dist1 += 1.0;
      if (dist2 > 0.5) dist2 -= 1.0;
      if (dist2 < -0.5) dist2 += 1.0;
      
      // 计算两个高光的强度 - 使用不对称高斯分布
      float intensity1 = 0.0;
      if (dist1 >= 0.0) {
        intensity1 = exp(-pow(dist1 / 0.003, 3.0)) * 0.9; // 从0.005减小到0.003，让高光更短
      } else {
        intensity1 = exp(dist1 * 40.0) * 0.9; // 从30.0增加到40.0，让尾部衰减更快
      }
      
      float intensity2 = 0.0;
      if (dist2 >= 0.0) {
        intensity2 = exp(-pow(dist2 / 0.003, 3.0)) * 0.9;
      } else {
        intensity2 = exp(dist2 * 40.0) * 0.9;
      }
      
      // 合并两个高光
      float highlightIntensity = max(intensity1, intensity2);
      
      // 计算距离最近高光点的距离
      float minDist = min(abs(dist1), abs(dist2));
      
      // 基础颜色（较暗）
      vec3 baseColor = color * 0.3;
      
      // 头部区域颜色：使用 uniform 传入的高光颜色
      vec3 blueColor = color * 2.0;
      
      // 使用距离来控制高光头部区域，而不是强度
      // 距离小于 0.004 的区域为高光颜色（极小的头部）
      vec3 finalHighlightColor;
      if (minDist < 0.004) {
        // 头部：使用 uniform 中的高光颜色
        finalHighlightColor = highlightColor;
      } else if (highlightIntensity > 0.0) {
        // 尾部：渐变到蓝色
        float t = minDist / 0.004; // t 从 1 开始逐渐增大
        finalHighlightColor = mix(highlightColor, blueColor, clamp(t, 0.0, 1.0));
      } else {
        finalHighlightColor = blueColor;
      }
      
      // 只有高光部分可见，其他部分完全透明
      vec3 finalColor = finalHighlightColor;
      
      // 透明度：只有当高光强度大于阈值时才显示
      float alpha = smoothstep(0.0, 0.05, highlightIntensity) * 0.9;
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

// 单个轨道环 - 使用环形几何体
function OrbitRing({ ringIndex, position, rotation, radius = 2 }) {
  const [uniforms] = useState(() => ({
    time: { value: 0 },
    color: { value: new THREE.Color("#48A9EE") },
    highlightColor: { value: new THREE.Color("#BDDFFA") },
    ringIndex: { value: ringIndex },
    numRings: { value: 10 }
  }));
  
  useFrame((state, delta) => {
    // 直接更新 uniform 的 value
    uniforms.time.value = state.clock.elapsedTime;
  });

  return (
    <mesh position={position} rotation={rotation}>
      <torusGeometry args={[radius, 0.01, 4, 100]} />
      <shaderMaterial
        attach="material"
        uniforms={uniforms}
        vertexShader={OrbitRingMaterial.vertexShader}
        fragmentShader={OrbitRingMaterial.fragmentShader}
        transparent={true}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

// 生成伪随机数的工具函数
function pseudoRandom(n) {
  const x = Math.sin(n) * 10000;
  return x - Math.floor(x);
}

function TransformScene({ position }) {
  const containerRef = useRef();
  const ringsCount = 30; // 20个轨道环
  
  useFrame((state, delta) => {
    if (containerRef.current) {
      // 轻微旋转整个场景容器
      containerRef.current.rotation.y += 0.05 * delta;
    }
  });

  // 生成不同倾角的轨道
  const orbits = Array.from({ length: ringsCount }).map((_, i) => {
    const seed = i * 1234 + 5678;
    const xRotation = (pseudoRandom(seed) - 0.5) * Math.PI;
    const zRotation = (pseudoRandom(seed + 1) - 0.5) * Math.PI * 0.5;
    const yRotation = (pseudoRandom(seed + 2) - 0.5) * Math.PI * 0.3;
    
    return {
      index: i,
      rotation: [xRotation, yRotation, zRotation],
      position: [0, 0, 0]
    };
  });

  return (
    <group position={position} ref={containerRef}>
      {orbits.map((orbit) => (
        <OrbitRing
          key={orbit.index}
          ringIndex={orbit.index}
          position={orbit.position}
          rotation={orbit.rotation}
        />
      ))}
    </group>
  );
}

// 单个管子段 - 使用 tubeGeometry
function TubeSegment({ segmentIndex, position, height }) {
  const [uniforms] = useState(() => ({
    time: { value: 0 },
    color: { value: new THREE.Color("#2BB856") },
    highlightColor: { value: new THREE.Color("#B6EBC6") },
    ringIndex: { value: segmentIndex },
    numRings: { value: 50 }
  }));
  
  useFrame((state, delta) => {
    uniforms.time.value = state.clock.elapsedTime;
  });

  return (
    <mesh position={position}>
      {/* tubeGeometry: pathPoints, tubularSegments, radius, radialSegments */}
      {/* 创建一条垂直的线作为path */}
      <tubeGeometry args={[
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, height, 0)
        ]),
        100, // tubularSegments - 沿着曲线的段数
        0.01, // radius - 管子半径
        8, // radialSegments - 径向段数
        false // closed
      ]} />
      <shaderMaterial
        attach="material"
        uniforms={uniforms}
        vertexShader={OrbitRingMaterial.vertexShader}
        fragmentShader={OrbitRingMaterial.fragmentShader}
        transparent={true}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

function GrowthScene({ position }) {
  const containerRef = useRef();
  const tubesCount = 50;
  
  useFrame((state, delta) => {
    if (containerRef.current) {
      // 轻微旋转整个场景容器
      containerRef.current.rotation.y += 0.025 * delta;
    }
  });

  // 生成不同位置的管子
  const tubes = Array.from({ length: tubesCount }).map((_, i) => {
    const seed = i * 789 + 123;
    const x = (pseudoRandom(seed) - 0.5) * 4; // -2 到 2
    const z = (pseudoRandom(seed + 1) - 0.5) * 4; // -2 到 2
    const height = 1.0 + pseudoRandom(seed + 2) * 2; // 0.5 到 2.5
    
    return {
      index: i,
      position: [x, 0, z],
      height: height
    };
  });

  return (
    <group position={position} ref={containerRef}>
      {tubes.map((tube) => (
        <TubeSegment
          key={tube.index}
          segmentIndex={tube.index}
          position={tube.position}
          height={tube.height}
        />
      ))}
    </group>
  );
}

// 单个约束管子 - 水平方向的螺旋曲线
function ConstraintTube({ tubeIndex, position, curve }) {
  const [uniforms] = useState(() => ({
    time: { value: 0 },
    color: { value: new THREE.Color("#C567AF") },
    highlightColor: { value: new THREE.Color("#F4D1EC") },
    ringIndex: { value: tubeIndex },
    numRings: { value: 8 }
  }));
  
  useFrame((state, delta) => {
    uniforms.time.value = state.clock.elapsedTime;
  });

  return (
    <mesh position={position}>
      <tubeGeometry args={[
        curve,
        100, // tubularSegments
        0.02, // radius
        8, // radialSegments
        false
      ]} />
      <shaderMaterial
        attach="material"
        uniforms={uniforms}
        vertexShader={OrbitRingMaterial.vertexShader}
        fragmentShader={OrbitRingMaterial.fragmentShader}
        transparent={true}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

function ConstraintScene({ position }) {
  const tubesCount = 8;
  const helixRadius = 0.8; // 螺旋半径
  const helixLength = 8; // 从左到右的长度

  // 生成8根互相环绕的管子
  const tubes = Array.from({ length: tubesCount }).map((_, i) => {
    const angleOffset = (i / tubesCount) * Math.PI * 2; // 每根管子角度偏移
    
    // 创建螺旋曲线路径
    const points = [];
    for (let j = 0; j <= 50; j++) {
      const t = j / 50; // 0 到 1
      const x = -helixLength / 2 + t * helixLength; // 从左到右
      const angle = t * Math.PI * 2 * 3 + angleOffset; // 3圈螺旋 + 初始偏移
      const y = Math.cos(angle) * helixRadius;
      const z = Math.sin(angle) * helixRadius;
      points.push(new THREE.Vector3(x, y, z));
    }
    
    const curve = new THREE.CatmullRomCurve3(points);
    
    return {
      index: i,
      curve: curve
    };
  });

  return (
    <group position={position} rotation={[0, Math.PI / 4, 0]}>
      {tubes.map((tube) => (
        <ConstraintTube
          key={tube.index}
          tubeIndex={tube.index}
          position={[0, 0, 0]}
          curve={tube.curve}
        />
      ))}
    </group>
  );
}

// 单个火山口管子
function CollapseTube({ tubeIndex, angle }) {
  const [uniforms] = useState(() => ({
    time: { value: 0 },
    color: { value: new THREE.Color("#FF4136") },
    highlightColor: { value: new THREE.Color("#FFBFBC") },
    ringIndex: { value: tubeIndex },
    numRings: { value: 20 }
  }));
  
  useFrame((state, delta) => {
    uniforms.time.value = state.clock.elapsedTime;
  });

  // 创建火山口曲线：从外围上涨，然后下降 - 使用4个关键点
  const outerRadius = 3; // 外围半径
  const innerRadius = 0.5; // 火山口内部半径
  const rimHeight = 1.0; // 火山口边缘高度
  const centerDepth = -0.6; // 中心深度（从-0.3降低到-0.6）
  
  // 定义4个关键点：起点（外围低）、上升点（中部中等高度）、顶点（边缘）、终点（中心低）
  const points = [
    // 点1：外围起点（地面）
    new THREE.Vector3(
      Math.cos(angle) * outerRadius,
      0,
      Math.sin(angle) * outerRadius
    ),
    // 点2：中途上升点（中等高度）
    new THREE.Vector3(
      Math.cos(angle) * (outerRadius + innerRadius) / 1.5,
      rimHeight * 0.4,
      Math.sin(angle) * (outerRadius + innerRadius) / 1.5
    ),
    // 点3：边缘顶点（最高）
    new THREE.Vector3(
      Math.cos(angle) * innerRadius,
      rimHeight,
      Math.sin(angle) * innerRadius
    ),
    // 点4：中心终点（最低）
    new THREE.Vector3(
      Math.cos(angle) * innerRadius,
      centerDepth,
      Math.sin(angle) * innerRadius
    )
  ];
  
  // 用4个点创建CatmullRom曲线，会自动生成平滑过渡
  const curve = new THREE.CatmullRomCurve3(points);

  return (
    <mesh>
      <tubeGeometry args={[
        curve,
        100, // tubularSegments
        0.01, // radius
        8, // radialSegments
        false
      ]} />
      <shaderMaterial
        attach="material"
        uniforms={uniforms}
        vertexShader={OrbitRingMaterial.vertexShader}
        fragmentShader={OrbitRingMaterial.fragmentShader}
        transparent={true}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

function CollapseScene({ position }) {
  const containerRef = useRef();
  const tubesCount = 20; // 20根管子围成一圈形成火山口
  
  useFrame((state, delta) => {
    if (containerRef.current) {
      // 轻微旋转整个场景容器
      containerRef.current.rotation.y += 0.1 * delta;
    }
  });

  // 生成围绕中心的管子
  const tubes = Array.from({ length: tubesCount }).map((_, i) => {
    const angle = (i / tubesCount) * Math.PI * 2;
    
    return {
      index: i,
      angle: angle
    };
  });

  return (
    <group position={position} ref={containerRef}>
      {tubes.map((tube) => (
        <CollapseTube
          key={tube.index}
          tubeIndex={tube.index}
          angle={tube.angle}
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
    cameraPosition = [-10, 0, 3]; // 从 5 改为 3，让物体更大
  } else if (targetSection === 'nextChapter') {
    cameraPosition = [40, 0, 3]; // 从 5 改为 3，让物体更大
  } else {
    cameraPosition = [
      currentPosition[0],
      currentPosition[1] + 2,
      currentPosition[2] + 3 // 从 5 改为 3，让物体更大
    ];
  }

  return (
    <>

      {/* 相机控制器 */}
      <CameraController 
        targetSection={targetSection}
        targetPosition={cameraPosition}
        targetLookAt={currentLookAt}
      />

      {/* Constraint 场景 - 3D效果 */}
      <ConstraintScene position={scenePositions.constraint} />
      
      {/* Growth 场景 - 3D效果 */}
      <GrowthScene position={scenePositions.growth} />
      
      {/* Transform 场景 - 3D效果 */}
      <TransformScene position={scenePositions.transform} />
      
      {/* Collapse 场景 - 3D效果 */}
      <CollapseScene position={scenePositions.collapse} />
      
      {/* Bloom 后处理效果 */}
      <EffectComposer>
        <Bloom 
          intensity={5.0} 
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
    <div className="fixed inset-0 pointer-events-none z-20">
      <Canvas 
        camera={{ position: [-10, 0, 4], fov: 75 }}
        gl={{ 
          alpha: true,
          antialias: true,
          stencil: false,
          depth: true,
          premultipliedAlpha: false,
          preserveDrawingBuffer: true
        }}
      >
        <Scene3D targetSection={targetSection} />
      </Canvas>
    </div>
  );
}
