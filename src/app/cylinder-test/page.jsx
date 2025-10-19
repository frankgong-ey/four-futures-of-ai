"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { CatmullRomCurve3 } from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrthographicCamera, Environment, MeshTransmissionMaterial, useTexture} from "@react-three/drei";
import { easing } from "maath";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// 注册GSAP插件
gsap.registerPlugin(ScrollTrigger);

import ribbonVertexShader from "../test/shaders/laserRibbon.vert.glsl";
import ribbonFragmentShader from "../test/shaders/laserRibbon.frag.glsl";
import imageCardVertexShader from "../test/shaders/imageCard.vert.glsl";
import imageCardFragmentShader from "../test/shaders/imageCard.frag.glsl";
import FirstScreen from "../../components/FirstScreen";
import GalleryScreen from "../components/GalleryScreen";

export default function CylinderTestPage() {
  const [galleryScrollProgress, setGalleryScrollProgress] = useState(0);
  const [isInGallerySection, setIsInGallerySection] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [firstScreenProgress, setFirstScreenProgress] = useState(0);

  // 使用ref来引用DOM元素
  const firstScreenRef = useRef(null);
  const galleryScreenRef = useRef(null);

  // 监听滚动位置
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  
  // 固定参数
  const ribbon1Color = "#ce78ba";
  const ribbon2Color = "#2bb856";
  const ribbon3Color = "#7ebff5";
  const ribbon4Color = "#f56962";
  
  const ribbonIntensity = 1.0;
  const ribbonWidth = 2.0;
  const ribbonSegments = 32;
  const ribbonFalloff = 4.0;
  const ribbonShakeIntensity = 0.08;
  const hoverRadius = 0.5;
  
  const tunnelVisible = true;
  const cylinderHeight = 4.0;
  const cylinderThickness = 8.0;
  const cylinderSegments = 16;
  const coneTopRadius = 0.2;
  const coneBottomRadius = 1.5;
  
  // 曲线控制点 - 直接定义数组，避免重复
  const p1_0 = [-20, 0];
  const p1_1 = [0, 0];
  const p1_2 = [20, 0];
  const p1_3 = [40, 0];
  
  const p2_0 = [-20, 0];
  const p2_1 = [0, 0];
  const p2_2 = [20, 0];
  const p2_3 = [40, 5];
  
  const p3_0 = [-20, 0];
  const p3_1 = [0, 0];
  const p3_2 = [20, 3];
  const p3_3 = [40, 5];
  
  const p4_0 = [-20, 0];
  const p4_1 = [0, 0];
  const p4_2 = [20, -3];
  const p4_3 = [40, -5];
  
  // 使用GSAP控制动画和section切换
  useEffect(() => {
    if (!firstScreenRef.current || !galleryScreenRef.current) {
      return;
    }

    // 创建ScrollTrigger来控制FirstScreen的淡出效果
    const firstScreenTrigger = ScrollTrigger.create({
      trigger: ".scroll-space",
      start: "top top",
      end: "20% top",
      scrub: 1,
      markers: true,
      onUpdate: (self) => {
        const progress = self.progress;
        setFirstScreenProgress(progress);
        // 当滚动进度达到0.95时（即95vh）才切换到Gallery模式
        if (progress >= 0.99) {
          setIsInGallerySection(true);
        } else {
          setIsInGallerySection(false);
        }
      }
    });

     // 创建GalleryScreen的ScrollTrigger来控制3D动画
     const galleryScrollTrigger = ScrollTrigger.create({
       trigger: ".scroll-space",
       start: "20%", // 从100vh开始
       end: "100% bottom",   // 到500vh结束，总共400vh的滚动距离
       scrub: 1,       // 平滑跟随滚动
       markers:true,
       onUpdate: (self) => {
         // 计算滚动进度 (0 到 4，对应5个卡片)
         const progress = self.progress;
         setGalleryScrollProgress(progress);
       }
     });

    // 清理函数
    return () => {
      firstScreenTrigger.kill();
      galleryScrollTrigger.kill();
    };
  }, []);
  
  // ScrollTrigger直接在useEffect中处理滚动进度和模式切换
  
    // Fullscreen canvas with orthographic camera and orbit controls
    return (
    <div>
      {/* 占位容器 - 提供滚动空间 */}
      <div className="scroll-space" style={{ height: '500vh' }} />
      
      {/* 全局背景图片 - 所有section共用 */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '101vw',
          height: '100vh',
          backgroundImage: 'url(/images/hero_gradient.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />

      {/* 全局Canvas - 所有section共用 */}
      <Canvas 
        dpr={[1, 1.5]} 
        gl={{ 
          antialias: false,
          alpha: true,
        }}
        shadows={false}
        style={{ 
          background: "transparent",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 10
        }}
      >
          <OrthographicCamera 
            makeDefault 
            position={[-3, 0, 8]} 
            zoom={100}
            near={-1000}
            far={1000}
          />
          <CameraRig isInGallerySection={isInGallerySection} />
          
          {/* Gallery 3D 内容 - 根据滚动进度显示，不干扰FirstScreen */}
          {isInGallerySection && (
            <Gallery3D scrollProgress={galleryScrollProgress} />
          )}
  
          {/* 圆锥台效果 - 只在FirstScreen时显示 */}
          {!isInGallerySection && (
            <CylinderTunnel
              visible={tunnelVisible}
              height={cylinderHeight}
              thickness={cylinderThickness}
              segments={cylinderSegments}
              topRadius={coneTopRadius}
              bottomRadius={coneBottomRadius}
            />
          )}
  
  
          {/* 光源和环境 */}
          <ambientLight intensity={0.3} />
          <spotLight position={[20, 20, 10]} penumbra={1} castShadow angle={0.2} intensity={1} />
          <Environment preset="city" />
  
          {/* LaserRibbonCubic - 只在FirstScreen时显示 */}
          {!isInGallerySection && (
            <>
              {/* First LaserRibbonCubic */}
              <LaserRibbonCubic
                p0={p1_0}
                p1={p1_1}
                p2={p1_2}
                p3={p1_3}
                width={ribbonWidth}
                color={new THREE.Color(ribbon1Color)}
                segments={ribbonSegments}
                intensity={ribbonIntensity}
                falloff={ribbonFalloff}
                shakeIntensity={ribbonShakeIntensity}
                hoverRadius={hoverRadius}
              />

              {/* Second LaserRibbonCubic */}
              <LaserRibbonCubic
                p0={p2_0}
                p1={p2_1}
                p2={p2_2}
                p3={p2_3}
                width={ribbonWidth}
                color={new THREE.Color(ribbon2Color)}
                segments={ribbonSegments}
                intensity={ribbonIntensity}
                falloff={ribbonFalloff}
                shakeIntensity={ribbonShakeIntensity}
                hoverRadius={hoverRadius}
              />

              {/* Third LaserRibbonCubic */}
              <LaserRibbonCubic
                p0={p3_0}
                p1={p3_1}
                p2={p3_2}
                p3={p3_3}
                width={ribbonWidth}
                color={new THREE.Color(ribbon3Color)}
                segments={ribbonSegments}
                intensity={ribbonIntensity}
                falloff={ribbonFalloff}
                shakeIntensity={ribbonShakeIntensity}
                hoverRadius={hoverRadius}
              />

              {/* Fourth LaserRibbonCubic */}
              <LaserRibbonCubic
                p0={p4_0}
                p1={p4_1}
                p2={p4_2}
                p3={p4_3}
                width={ribbonWidth}
                color={new THREE.Color(ribbon4Color)}
                segments={ribbonSegments}
                intensity={ribbonIntensity}
                falloff={ribbonFalloff}
                shakeIntensity={ribbonShakeIntensity}
                hoverRadius={hoverRadius}
              />
            </>
          )}
      </Canvas>

      {/* 第一个section - 圆柱体测试 - 固定在屏幕上 */}
      <div
        ref={firstScreenRef}
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: "100vw", 
          height: "100vh", 
          zIndex: 20, 
          pointerEvents: 'none'
        }}
        className="relative first-screen-container"
      >
        {/* FirstScreen HTML内容 */}
        <div className="absolute inset-0 pointer-events-none">
          <FirstScreen progress={firstScreenProgress} />
        </div>
      </div>
      
      {/* GalleryScreen 第二个section - 固定定位与第一个屏幕重叠 */}
      <div 
        ref={galleryScreenRef}
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: "100vw", 
          height: "100vh",
          opacity: isInGallerySection ? 1 : 0,
          visibility: isInGallerySection ? 'visible' : 'hidden',
          transition: 'opacity 0.5s ease-in-out',
          zIndex: 30
        }}
      >
        <GalleryScreen scrollProgress={galleryScrollProgress} />
      </div>

      {/* 调试信息 - 显示滚动位置 */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '64px',
          fontSize: '8px',
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '4px 8px',
          borderRadius: '4px',
          zIndex: 1000,
          fontFamily: 'monospace'
        }}
      >
        Scroll: {Math.round(scrollPosition)}px ({typeof window !== 'undefined' ? Math.round(scrollPosition / window.innerHeight * 100) : 0}vh)
        <br />
        Gallery Mode: {isInGallerySection ? 'ON' : 'OFF'}
        <br />
        Gallery Progress: {galleryScrollProgress.toFixed(2)}
      </div>
    </div>
    );
}

// 圆锥台组件
function CylinderTunnel({  
  height, 
  thickness, 
  segments, 
  topRadius,
  bottomRadius,
  visible,
}) {
  if (!visible) return null;

  return (
    <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} receiveShadow castShadow>
      <cylinderGeometry args={[topRadius, bottomRadius, height, segments]} />
      <MeshTransmissionMaterial 
        backside 
        backsideThickness={5} 
        thickness={thickness}
        roughness={0.1}
        transmission={1}
        ior={1.3}
        chromaticAberration={0}
        backsideTransmission={0.8}
        samples={2}
        resolution={124}
      />
    </mesh>
  );
}

// 使用React.memo优化组件重新渲染
const LaserRibbonCubic = React.memo(function LaserRibbonCubic({ p0, p1, p2, p3, width = 0.05, color = new THREE.Color(1,1,1), segments = 32, intensity = 1.6, falloff = 6.0, shakeIntensity = 0.08, hoverRadius = 0.5 }) {
  const materialRef = useRef();
  const meshRef = useRef();
  
  // Raycast相关状态
  const [hoverPoint, setHoverPoint] = useState({ x: 0, y: 0, active: false });
  
  // Raycast处理函数
  const handlePointerMove = (event) => {
    if (!event.point) return;
    
    // 直接使用React Three Fiber提供的交点坐标
    const point = event.point;
    setHoverPoint({ 
      x: point.x, 
      y: point.y, 
      active: true 
    });
  };
  
  const handlePointerLeave = () => {
    setHoverPoint({ x: 0, y: 0, active: false });
  };

  // 几何体缓存ref
  const geometryCacheRef = useRef(null);

  // 优化几何体计算 - 减少不必要的重构
  const geometry = useMemo(() => {
    // 检查是否真的需要重构
    const currentParams = JSON.stringify([p0, p1, p2, p3, width, segments]);
    if (geometryCacheRef.current?.currentParams === currentParams) {
      return geometryCacheRef.current.geometry;
    }

    const positions = [];
    const halfCoords = [];
    const uCoords = [];
    const indices = [];

    const halfWidth = width * 0.5;

    // 创建CatmullRomCurve3，只需要4个点
    const curve = new CatmullRomCurve3([
      new THREE.Vector3(p0[0], p0[1], 0),
      new THREE.Vector3(p1[0], p1[1], 0),
      new THREE.Vector3(p2[0], p2[1], 0),
      new THREE.Vector3(p3[0], p3[1], 0)
    ]);

    // 预计算曲线点，减少重复计算
    const curvePoints = [];
    const curveTangents = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      curvePoints.push(curve.getPoint(t));
      curveTangents.push(curve.getTangent(t));
    }

    for (let i = 0; i <= segments; i++) {
      const P = curvePoints[i];
      const T = curveTangents[i];
      
      // 转换为2D向量用于计算法向量
      const P2D = new THREE.Vector2(P.x, P.y);
      const T2D = new THREE.Vector2(T.x, T.y);
      
      if (T2D.lengthSq() === 0) T2D.set(1, 0);
      T2D.normalize();
      const N = new THREE.Vector2(-T2D.y, T2D.x); // left normal

      const left = new THREE.Vector2().copy(P2D).addScaledVector(N, -halfWidth);
      const right = new THREE.Vector2().copy(P2D).addScaledVector(N, +halfWidth);

      // two vertices per segment point
      positions.push(left.x, left.y, 0);
      positions.push(right.x, right.y, 0);
      halfCoords.push(-1, +1);
      uCoords.push(i / segments, i / segments);

      if (i < segments) {
        const base = i * 2;
        // two triangles (base, base+1ria, base+2) and (base+1, base+3, base+2)
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("halfCoord", new THREE.Float32BufferAttribute(halfCoords, 1));
    geo.setAttribute("uCoord", new THREE.Float32BufferAttribute(uCoords, 1));
    geo.setIndex(indices);
    
    // 缓存几何体和参数
    geometryCacheRef.current = {
      currentParams,
      geometry: geo
    };
    
    return geo;
  }, [p0, p1, p2, p3, width, segments]);

  // Uniforms persist across prop changes
  const uniformsRef = useRef({
    uColor: { value: color.clone ? color.clone() : new THREE.Color(color) },
    uIntensity: { value: intensity },
    uFalloff: { value: falloff },
    uTime: { value: 0 },
    uShakeIntensity: { value: shakeIntensity },
    uHoverPoint: { value: new THREE.Vector2(0, 0) },
    uHoverActive: { value: 0.0 },
    uHoverRadius: { value: hoverRadius },
  });

  // 批量更新uniforms - 减少useEffect调用
  useEffect(() => {
    const uniforms = uniformsRef.current;
    uniforms.uColor.value.copy(color);
    uniforms.uIntensity.value = intensity;
    uniforms.uFalloff.value = falloff;
    uniforms.uShakeIntensity.value = shakeIntensity;
    uniforms.uHoverRadius.value = hoverRadius;
  }, [color, intensity, falloff, shakeIntensity, hoverRadius]);
  
  // 更新hover点信息
  useEffect(() => {
    const uniforms = uniformsRef.current;
    uniforms.uHoverPoint.value.set(hoverPoint.x, hoverPoint.y);
    uniforms.uHoverActive.value = hoverPoint.active ? 1.0 : 0.0;
  }, [hoverPoint]);

  // 优化时间更新 - 只在启用动画时更新
  useFrame((state) => {
    if (materialRef.current?.uniforms?.uTime) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  // 返回
  return (
    <mesh 
      ref={meshRef}
      geometry={geometry} 
      frustumCulled={false}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={ribbonVertexShader}
        fragmentShader={ribbonFragmentShader}
        uniforms={uniformsRef.current}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        depthTest={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
});

// 摄像头控制组件 - 基于鼠标位置进行旋转
function CameraRig({ isInGallerySection = false }) {
  useFrame((state, delta) => {
    if (isInGallerySection) {
      // Gallery模式：摄像头到 (0, -10, 10)，看向 (0, -10, 0)
      easing.damp3(
        state.camera.position,
        [0, -10, 10],
        0.2,
        delta,
      );
      state.camera.lookAt(0, -10, 0);
    } else {
      // 默认模式：基于鼠标位置进行旋转
      easing.damp3(
        state.camera.position,
        [Math.sin(-state.pointer.x) * 5 - 5, state.pointer.y * 10, 8 + Math.cos(state.pointer.x) * 3],
        0.2,
        delta,
      );
      state.camera.lookAt(0, 0, 0);
    }
  });
  
  return null;
}

// 3D图片卡片组件 - 使用自定义shader
const ImageCard = React.memo(function ImageCard({ imagePath, position }) {
  const meshRef = useRef();
  
  // 使用useTexture hook加载纹理
  const texture = useTexture(imagePath);
  
  // 创建shader材质
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: imageCardVertexShader,
      fragmentShader: imageCardFragmentShader,
      uniforms: {
        uTexture: { value: texture },
        uOpacity: { value: 1.0 },
        uWorldPosition: { value: position },
        uTime: { value: 0.0 },
        uResolution: { value: 24.0 }
      },
      transparent: true
    });
  }, [texture, position]);
  
  // 更新uniforms
  useFrame((state, delta) => {
    if (meshRef.current && shaderMaterial) {
      // 更新世界位置uniform
      shaderMaterial.uniforms.uWorldPosition.value = position;
      
      // 更新时间uniform
      shaderMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[0, 0, 0]}>
      <planeGeometry args={[4, 2.6]} />
      <primitive object={shaderMaterial} />
    </mesh>
  );
});

// Gallery 3D 组件 - 优化性能
const Gallery3D = React.memo(function Gallery3D({ scrollProgress }) {
  
  // 缓存图片位置计算
  const imagePositions = useMemo(() => [
    { x: -25, y: -10, z: 0 }, // gallery_1.png
    { x: -20, y: -10, z: 0 }, // gallery_2.png
    { x: -15, y: -10, z: 0 },  // gallery_3.png (中心)
    { x: -10, y: -10, z: 0 },  // gallery_4.png
    { x: -5, y: -10, z: 0 },  // gallery_5.png
  ], []);

  // 根据滚动进度计算整体偏移
  const baseOffset = useMemo(() => {
    return scrollProgress * 30;
  }, [scrollProgress]);

  return (
    <>
      {/* 环境光 */}
      <ambientLight intensity={0.4} />
      <spotLight position={[0, 5, 5]} intensity={1} />
      
      {/* 3D图片卡片 */}
      {useMemo(() => imagePositions.map((pos, index) => {
        const imagePath = `/images/gallery_${index + 1}.png`;
        const adjustedPosition = [
          pos.x + baseOffset,
          pos.y,
          pos.z
        ];
        
        return (
          <ImageCard
            key={index}
            imagePath={imagePath}
            position={adjustedPosition}
          />
        );
      }), [imagePositions, baseOffset])}
    </>
  );
});
