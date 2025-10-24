"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { CatmullRomCurve3 } from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrthographicCamera, Environment, MeshTransmissionMaterial, useTexture, useGLTF, OrbitControls} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { easing } from "maath";
import LayeredStarField from "../../components/StarField";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useControls } from "leva";

import neonVertexShader from "../../shaders/neon.vert.glsl";
import neonFragmentShader from "../../shaders/neon.frag.glsl";
import questionLineVertexShader from "../../shaders/questionLine.vert.glsl";
import questionLineFragmentShader from "../../shaders/questionLine.frag.glsl";
import torusPointsVertexShader from "../../shaders/torusPoints.vert.glsl";
import torusPointsFragmentShader from "../../shaders/torusPoints.frag.glsl";
import geometryLinesVertexShader from "../../shaders/geometryLines.vert.glsl";
import geometryLinesFragmentShader from "../../shaders/geometryLines.frag.glsl";
import circlePlaneVertexShader from "../../shaders/circlePlane.vert.glsl";
import circlePlaneFragmentShader from "../../shaders/circlePlane.frag.glsl";
import ribbonVertexShader from "../../shaders/laserRibbon.vert.glsl";
import ribbonFragmentShader from "../../shaders/laserRibbon.frag.glsl";
import imageCardVertexShader from "../../shaders/imageCard.vert.glsl";
import imageCardFragmentShader from "../../shaders/imageCard.frag.glsl";

import HeroSection from "./components/HeroSection";
import GallerySection from "./components/GallerySection";
import ChartSection from "./components/ChartSection";
import QuoteSection from "./components/QuoteSection";
import QuestionSection from "./components/QuestionSection";
import EndingSection from "./components/EndingSection";
import VideoSection from "./components/VideoSection";
import FluidBackground from "../../components/FluidBackground";


// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export default function BoothPage() {
  // Leva控制面板
  const { enableOrbitControls, newSplineP0, newSplineP1, newSplineP2, newSplineP3, newSplineColor, newSpline2P0, newSpline2P1, newSpline2P2, newSpline2P3, newSpline2Color } = useControls({
    enableOrbitControls: { value: true, label: "Orbit Controls" },
    newSplineP0: { 
      value: { x: 10, y: -12, z: 0 }, 
      label: "New Spline P0 (Top)" 
    },
    newSplineP1: { 
      value: { x: 5, y: -15, z: 0 }, 
      label: "New Spline P1" 
    },
    newSplineP2: { 
      value: { x: 5, y: -27, z: 0 }, 
      label: "New Spline P2" 
    },
    newSplineP3: { 
      value: { x: -20, y: -30, z: 0 }, 
      label: "New Spline P3 (Bottom)" 
    },
    newSplineColor: { 
      value: "#a4a59e", 
      label: "New Spline Color" 
    },
    newSpline2P0: { 
      value: { x: 10, y: -13, z: 0 }, 
      label: "New Spline 2 P0 (Top)" 
    },
    newSpline2P1: { 
      value: { x: 5, y: -15, z: 0 }, 
      label: "New Spline 2 P1" 
    },
    newSpline2P2: { 
      value: { x: 6, y: -27, z: 0 }, 
      label: "New Spline 2 P2" 
    },
    newSpline2P3: { 
      value: { x: -20, y: -28, z: 0 }, 
      label: "New Spline 2 P3 (Bottom)" 
    },
    newSpline2Color: { 
      value: "#8d8e88", 
      label: "New Spline 2 Color" 
    }
  });

  // 摄像头信息状态
  const [cameraInfo, setCameraInfo] = useState({
    position: [0, 0, 0],
    rotation: [0, 0, 0]
  });

  // 统一的状态管理
  const [sectionState, setSectionState] = useState({
    currentSection: 'hero',        // 'hero' | 'gallery' | 'chart' | 'quote' | 'fourth'
    heroProgress: 0,              // 0-1
    galleryProgress: 0,           // 0-1  
    chartProgress: 0,             // 0-1
    quoteProgress: 0,             // 0-1
    fourthProgress: 0,            // 0-1
    backgroundLayer: 1,           // 1 | 2 | 3
  });


  // 保留scrollPosition状态用于其他功能
  const [scrollPosition, setScrollPosition] = useState(0);


  // 计算是否应该启用Bloom
  const shouldEnableBloom = useMemo(() => {
    return sectionState.fourthProgress >= 0.17 && sectionState.fourthProgress <= 0.89;
  }, [sectionState.fourthProgress]);

  // 调试Bloom状态
  useEffect(() => {
    console.log('=== BLOOM STATUS ===');
    console.log('fourthProgress:', (sectionState.fourthProgress * 100).toFixed(1) + '%');
    console.log('Bloom enabled:', shouldEnableBloom);
    console.log('Bloom status:', shouldEnableBloom ? '✅ BLOOM YES' : '❌ BLOOM NO');
    console.log('===================');
  }, [sectionState.fourthProgress, shouldEnableBloom]);

  // 使用ref来引用DOM元素
  const heroSectionRef = useRef(null);
  const gallerySectionRef = useRef(null);
  const backgroundRef = useRef(null);
  const background2Ref = useRef(null);
  const background3Ref = useRef(null);

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
  const p1_0 = [-20, 0.1];
  const p1_1 = [-10, 0.1];
  const p1_2 = [0, 0];
  const p1_3 = [20, 5];
  
  const p2_0 = [-20, 0.0];
  const p2_1 = [-10, 0];
  const p2_2 = [0, 0];
  const p2_3 = [20, 2];
  
  const p3_0 = [-20, -0.1];
  const p3_1 = [-10, -0.1];
  const p3_2 = [0, 0];
  const p3_3 = [20, -2];
  
  const p4_0 = [-20, -0.15];
  const p4_1 = [-10, -0.15];
  const p4_2 = [0, 0];
  const p4_3 = [20, -5];
  

  // 使用GSAP控制动画和section切换
  useEffect(() => {
    if (!heroSectionRef.current || !gallerySectionRef.current) {
      return;
    }

    // 统一的ScrollTrigger管理
    const triggers = [];

    // ✅ 设置Hero Section的progress (0% - 12%) - 因为heroScren是absolute 
    const heroTrigger = ScrollTrigger.create({
      trigger: ".scroll-space",
      start: "top top",
      end: "8% top",
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        setSectionState(prev => ({
          ...prev,
          heroProgress: progress,
          currentSection:'hero'
        }));
      }
    });
    triggers.push(heroTrigger);

    // ✅ Gallery Section (12% - 36%) - 因为galleryScreen是absolute
    const galleryTrigger = ScrollTrigger.create({
      trigger: ".scroll-space",
      start: "8% top",
      end: "24% top",
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        setSectionState(prev => ({
          ...prev,
          galleryProgress: progress,
          currentSection: 'gallery'
        }));
      }
    });
    triggers.push(galleryTrigger);

    // ✅ Chart Section (24% - 48%) - 添加chart section检测
    const chartTrigger = ScrollTrigger.create({
      trigger: ".scroll-space",
      start: "24% top",
      end: "36% top",
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        setSectionState(prev => ({
          ...prev,
          chartProgress: progress,
          currentSection: 'chart'
        }));
      }
    });
    triggers.push(chartTrigger);

    // ✅ Quote Section (48% - 72%) - 添加quote section检测
    const quoteTrigger = ScrollTrigger.create({
      trigger: ".scroll-space",
      start: "36% top",
      end: "48% top",
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        setSectionState(prev => ({
          ...prev,
          quoteProgress: progress,
          currentSection: 'quote'
        }));
      }
    });
    triggers.push(quoteTrigger);

    // ✅ Fourth Section (72% - 100%) - 添加fourth section检测
    const fourthTrigger = ScrollTrigger.create({
      trigger: ".scroll-space",
      start: "48% top",
      end: "88% top",
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        setSectionState(prev => ({
          ...prev,
          fourthProgress: progress,
          currentSection: 'fourth'
        }));
      }
    });
    triggers.push(fourthTrigger);

    // 背景切换逻辑 - 保持原有的视觉效果
    // const backgroundTrigger = ScrollTrigger.create({
    //   trigger: ".scroll-space",
    //   start: "36% top",
    //   end: "40% top",
    //   scrub: 1,
    //   onUpdate: (self) => {
    //     if (backgroundRef.current && background2Ref.current) {
    //       const progress = self.progress;
    //       gsap.set(backgroundRef.current, { opacity: 1 - progress });
    //       gsap.set(background2Ref.current, { opacity: progress });
    //     }
    //   }
    // });
    // triggers.push(backgroundTrigger);

    // const backgroundTrigger3 = ScrollTrigger.create({
    //   trigger: ".scroll-space",
    //   start: "78% top",
    //   end: "85% top",
    //   scrub: 1,
    //   onUpdate: (self) => {
    //     const p = self.progress;
    //     if (background2Ref.current) {
    //       gsap.set(background2Ref.current, { opacity: 1 - p });
    //     }
    //     if (backgroundRef.current && background3Ref.current) {
    //       if (p <= 0) {
    //         gsap.set(background3Ref.current, { opacity: 0 });
    //       } else {
    //         gsap.set(background3Ref.current, { opacity: p });
    //       }
    //     }
    //   }
    // });
    // triggers.push(backgroundTrigger3);

    // 清理函数
    return () => {
      triggers.forEach(trigger => trigger.kill());
    };
  }, []);
  
  
    // Fullscreen canvas with orthographic camera and orbit controls
    return (
    <div>
      {/* 占位容器 - 提供滚动空间 */}
      <div className="scroll-space" style={{ height: '1250vh' }} />
      
      {/* 新的固定背景图片 */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: 'url(/images/hero_gradient_new.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 11,
          pointerEvents: 'none'
        }}
      />
      
      {/* 全局背景图片 - 所有section共用 */}
      {/* <div 
        ref={backgroundRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '101vw',
          height: '100vh',
          backgroundImage: 'url(/images/hero_gradient.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      /> */}
      
      {/* 第二层背景图片 - 用于过渡 */}
      {/* <div 
        ref={background2Ref}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '101vw',
          height: '100vh',
          backgroundImage: 'url(/images/mid_gradient.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 1,
          pointerEvents: 'none',
          opacity: 0
        }}
      /> */}
      
      {/* 第三层背景图片 - 预加载 gradient_3.svg 避免动态切换时的重新加载 */}
      {/* <div 
        ref={background3Ref}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '101vw',
          height: '100vh',
          backgroundImage: 'url(/images/gradient_3.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 1,
          pointerEvents: 'none',
          opacity: 0
        }}
      /> */}

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

          {/* 动态 Bloom 效果：fourthProgress >= 0.70 时启用 */}
          <BloomFixer enabled={shouldEnableBloom} />
          {shouldEnableBloom && (
            <EffectComposer key={shouldEnableBloom ? "bloom-on" : "bloom-off"} multisampling={0}>
              <Bloom intensity={0.3} luminanceThreshold={1} luminanceSmoothing={0} mipmapBlur />
            </EffectComposer>
          )}

          <OrthographicCamera 
            makeDefault 
            position={[-3, 0, 8]}
            zoom={100}
            near={-1000}
            far={1000}
          />
          <CameraRig sectionState={sectionState} />
          
          {/* 摄像头信息收集 */}
          <CameraInfo onCameraUpdate={setCameraInfo} />
          
          {/* OrbitControls - 通过Leva控制开关 */}
          {enableOrbitControls && (
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={5}
              maxDistance={20}
            />
          )}

          {/* 流体渐变背景图层 */}
          <FluidBackground />

          {/* Question GLB 模型 - 暂时显示所有模型 */}
          <QuestionModel />

          
          {/* Gallery 3D 内容 - 暂时显示所有模型 */}
          <Gallery3D scrollProgress={sectionState.galleryProgress} />
  
          {/* 圆锥台效果 - 暂时显示所有模型 */}
          <CylinderTunnel
            visible={tunnelVisible}
            height={cylinderHeight}
            thickness={cylinderThickness}
            segments={cylinderSegments}
            topRadius={coneTopRadius}
            bottomRadius={coneBottomRadius}
          />
  
          {/* 光源和环境 */}
          <ambientLight intensity={0.3} />
          <Environment preset="city" />
  
          {/* LaserSpline - 暂时显示所有模型 */}
          <>
            {/* First LaserSpline */}
            <LaserSpline
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

            {/* Second LaserSpline */}
            <LaserSpline
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

            {/* Third LaserSpline */}
            <LaserSpline
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

            {/* Fourth LaserSpline */}
            <LaserSpline
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

            {/* New LaserSpline - 可调试的竖向曲线 */}
            <LaserSpline
              p0={[newSplineP0.x, newSplineP0.y, newSplineP0.z]}
              p1={[newSplineP1.x, newSplineP1.y, newSplineP1.z]}
              p2={[newSplineP2.x, newSplineP2.y, newSplineP2.z]}
              p3={[newSplineP3.x, newSplineP3.y, newSplineP3.z]}
              width={ribbonWidth}
              color={new THREE.Color(newSplineColor)}
              segments={64}
              intensity={ribbonIntensity}
              falloff={ribbonFalloff}
              shakeIntensity={ribbonShakeIntensity}
              hoverRadius={hoverRadius}
            />

            {/* New LaserSpline 2 - 第二条完全一样的曲线 */}
            <LaserSpline
              p0={[newSpline2P0.x, newSpline2P0.y, newSpline2P0.z]}
              p1={[newSpline2P1.x, newSpline2P1.y, newSpline2P1.z]}
              p2={[newSpline2P2.x, newSpline2P2.y, newSpline2P2.z]}
              p3={[newSpline2P3.x, newSpline2P3.y, newSpline2P3.z]}
              width={ribbonWidth}
              color={new THREE.Color(newSpline2Color)}
              segments={64}
              intensity={ribbonIntensity}
              falloff={ribbonFalloff}
              shakeIntensity={ribbonShakeIntensity}
              hoverRadius={hoverRadius}
            />
          </>
      </Canvas>

      {/* Hero Section - 固定在屏幕上 */}
      <div
        ref={heroSectionRef}
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
        {/* HeroSection HTML内容 */}
        <div className="absolute inset-0 pointer-events-none">
          <HeroSection localScrollProgress={sectionState.heroProgress} />
        </div>
      </div>
      
      {/* Gallery Section - 固定定位与第一个屏幕重叠 */}
      <div 
        ref={gallerySectionRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: "100vw", 
          height: "200vh",
          visibility: sectionState.currentSection === 'gallery' ? 'visible' : 'hidden',
          zIndex: 30
        }}
      >
        <GallerySection localScrollProgress={sectionState.galleryProgress} />
      </div>

      {/* ChartSection - 图表section，在400vh后出现 */}
      <div
        style={{
          position: 'absolute',
          top: '400vh',
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 40
        }}
      >
        <ChartSection />
      </div>

      {/* QuoteSection - 引用section，在500vh后出现 */}
      <div
        style={{
          position: 'absolute',
          top: '500vh',
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 40
        }}
      >
        <QuoteSection />
      </div>

      {/* QuestionSection - 第四个section，500vh高度，5个views */}
      <div
        style={{
          position: 'absolute',
          top: '600vh', // 在ChartSection (100vh) + QuoteSection (100vh) 之后
          left: 0,
          width: '100vw',
          height: '500vh',
          zIndex: 50
        }}
      >
        <QuestionSection />
      </div>

      {/* EndingSection - 第五个section，1000vh高度 */}
      <div
        style={{
          position: 'absolute',
          top: '1100vh',
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 60,
        }}
      >
        <EndingSection />
      </div>

      {/* EndingSection - 第五个section，1000vh高度 */}
      <div
        style={{
          position: 'absolute',
          top: '1200vh',
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 60,
        }}
      >
        <VideoSection />
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
        Current Section: {sectionState.currentSection}
        <br />
        Hero Progress: {sectionState.heroProgress.toFixed(2)}
        <br />
        Gallery Progress: {sectionState.galleryProgress.toFixed(2)}
        <br />
        Chart Progress: {sectionState.chartProgress.toFixed(2)}
        <br />
        Quote Progress: {sectionState.quoteProgress.toFixed(2)}
        <br />
        Fourth Progress: {sectionState.fourthProgress.toFixed(2)}
        <br />
        <br />
        Camera Position: ({cameraInfo.position[0]}, {cameraInfo.position[1]}, {cameraInfo.position[2]})
        <br />
        Camera Rotation: ({cameraInfo.rotation[0]}°, {cameraInfo.rotation[1]}°, {cameraInfo.rotation[2]}°)
      </div>
    </div>
    );
}

// 摄像头信息组件
function CameraInfo({ onCameraUpdate }) {
  const { camera } = useThree();

  useFrame(() => {
    if (camera && onCameraUpdate) {
      onCameraUpdate({
        position: [
          camera.position.x.toFixed(2),
          camera.position.y.toFixed(2),
          camera.position.z.toFixed(2)
        ],
        rotation: [
          (camera.rotation.x * 180 / Math.PI).toFixed(1),
          (camera.rotation.y * 180 / Math.PI).toFixed(1),
          (camera.rotation.z * 180 / Math.PI).toFixed(1)
        ]
      });
    }
  });

  return null; // 这个组件不渲染任何内容，只用于获取摄像头信息
}

// Re-render the scene to clear the Bloom cache
function BloomFixer({ enabled }) {
  const { gl, scene, camera } = useThree();
  const prev = useRef(enabled);

  useEffect(() => {
    // 从 true → false 时触发：Bloom 被关闭
    if (prev.current && !enabled) {
      console.log("🧽 Force re-render clean frame after disabling bloom");
      gl.autoClear = true; // 确保默认缓冲区清空
      gl.setRenderTarget(null);
      gl.clear(true, true, true);
      gl.render(scene, camera); // 👈 手动再渲染一次干净画面
    }
    prev.current = enabled;
  }, [enabled, gl, scene, camera]);

  return null;
}

// Cone Tunnel Component
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

// Load Question Model
function QuestionModel() {

  // 加载
  const { scene } = useGLTF('/models/question_consolidated_v5.glb');

  // 创建组
  const group = useRef(null);

  // 克隆并为所有 Mesh 应用统一 shader（示例采用 neon）
  const clonedScene = useMemo(() => {
    console.log('=== 开始创建clonedScene ===');
    const cloned = scene.clone();
    const torusNames = ['torus', 'icosphere', 'cube', 'box', 'cone'];
    cloned.traverse((child) => {
      if (!child.isMesh) return;
      const name = (child.name || '').toLowerCase();

      // 1) 所有名称包含 line / circle / path / stagnate 的对象统一使用 questionLine shader
      if (name.includes('line') || name.includes('circle') || name.includes('path') || name.includes('stagnate')) {
        // 为每个line物体生成随机时间偏移
        const randomTimeOffset = Math.random() * 10.0;
        const isFullVisible = name.includes('lined');
        
        child.material = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
          uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Color(1.0, 0.902, 0.0) },
            progress: { value: 1.0 },
            timeOffset: { value: randomTimeOffset },
            fogNear: { value: 100.0 },
            fogFar: { value: 200.0 },
            fullVisible: { value: isFullVisible ? 1.0 : 0.0 }
          },
          vertexShader: questionLineVertexShader,
          fragmentShader: questionLineFragmentShader,
          blending: THREE.AdditiveBlending,
          toneMapped: false
        });
        return;
      }

      // 2) icosphere/cube/box/cone/human 使用 torusPoints shader
      if (name.includes('icosphere') || name.includes('cube') || name.includes('box') || name.includes('cone') || name.includes('human')) {
        // 根据对象类型设置不同的点大小
        let pointSize = 12.0; // 默认大小
        
        if (name.includes('human')) {
          // human 仅显示连线，不显示点：将点大小设为 0
          pointSize = 0.0;
        } else if (name.includes('icosphere') || name.includes('cube') || name.includes('box') || name.includes('cone')) {
          pointSize = 12.0; // Icosphere/Cube/Box/Cone 使用更大的点
        }

        const pointsMaterial = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          uniforms: {
            color: { value: new THREE.Color('#ffffff') }, // 白色
            time: { value: 0 },
            pointSize: { value: pointSize }
          },
          vertexShader: torusPointsVertexShader,
          fragmentShader: torusPointsFragmentShader,
        });

        // 如果是 Mesh，转换为 Points 以支持 gl_PointSize
        if (child.isMesh) {
          const parent = child.parent;
          const points = new THREE.Points(child.geometry, pointsMaterial);
          points.position.copy(child.position);
          points.rotation.copy(child.rotation);
          points.scale.copy(child.scale);
          points.name = child.name + "__points";
          parent.add(points);
          child.visible = false; // 保留原节点但隐藏
        } else {
          child.material = pointsMaterial;
        }
        return;
      }

      // 3) torus 使用不同的处理（如果需要的话）
      if (name.includes('torus')) {
        const pointSize = 6.0; // torus 使用较小的点

        const pointsMaterial = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          uniforms: {
            color: { value: new THREE.Color('#ffffff') }, // 白色
            time: { value: 0 },
            pointSize: { value: pointSize }
          },
          vertexShader: torusPointsVertexShader,
          fragmentShader: torusPointsFragmentShader,
        });

        // 如果是 Mesh，转换为 Points 以支持 gl_PointSize
        if (child.isMesh) {
          const parent = child.parent;
          const points = new THREE.Points(child.geometry, pointsMaterial);
          points.position.copy(child.position);
          points.rotation.copy(child.rotation);
          points.scale.copy(child.scale);
          points.name = child.name + "__points";
          parent.add(points);
          child.visible = false; // 保留原节点但隐藏
        } else {
          child.material = pointsMaterial;
        }
        return;
      }

      // 4) plane（Plane） — circle 已在上方被归入 questionLine
      if (name.includes('plane')) {
        child.material = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
          uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Color(1.0, 1.0, 1.0) },
          },
          vertexShader: circlePlaneVertexShader,
          fragmentShader: circlePlaneFragmentShader,
          blending: THREE.AdditiveBlending
        });
        return;
      }

      // 5) 其它：使用 neon 基础发光
      child.material = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          time: { value: 0 },
          color: { value: new THREE.Color(0.16, 0.77, 0.91) },
          fogNear: { value: 0.0 },
          fogFar: { value: 1000.0 },
          progress: { value: 1.0 },
        },
        vertexShader: neonVertexShader,
        fragmentShader: neonFragmentShader,
        blending: THREE.AdditiveBlending,
        toneMapped: false
      });
    });
    
    // 完全重写连线创建逻辑 - 确保只创建一次
    console.log('=== 开始创建连线 ===');
    
    // 查找目标对象（只包括cube, box, cone, icosphere）
    const targetObjects = [];
    cloned.traverse((child) => {
      if (child.isMesh || child.isPoints) {
        const name = (child.name || '').toLowerCase();
        if (name.includes('icosphere') || name.includes('cube') || name.includes('box') || name.includes('cone')) {
          console.log('✓ 找到目标对象:', name);
          targetObjects.push(child);
        }
      }
    });
    
    console.log('找到', targetObjects.length, '个目标对象');
    
    // 如果找到目标对象，创建连线数据
    if (targetObjects.length > 0) {
      // 创建连线数据
      const linePositions = [];
      const lineFadeOffsets = [];
      let linesCreated = 0;
      const MAX_TOTAL_SEGMENTS = 8000;
      
      // 遍历目标对象，创建连线数据
      targetObjects.forEach((obj) => {
        if (linesCreated >= MAX_TOTAL_SEGMENTS) return;
        
        const geometry = obj.geometry;
        if (!geometry || !geometry.attributes || !geometry.attributes.position) return;
        
        const positionAttribute = geometry.attributes.position;
        const uvAttribute = geometry.attributes.uv;
        
        // 获取cloned对象的逆矩阵，用于将世界坐标转换回cloned的本地坐标
        const clonedInverseMatrix = new THREE.Matrix4();
        cloned.updateMatrixWorld();
        clonedInverseMatrix.copy(cloned.matrixWorld).invert();
        
        // 收集顶点 - 使用本地坐标，不进行世界变换
        const vertices = [];
        for (let i = 0; i < positionAttribute.count; i++) {
          const temp = new THREE.Vector3();
          temp.fromBufferAttribute(positionAttribute, i);
          
          // 先变换到世界坐标
          temp.applyMatrix4(obj.matrixWorld);
          // 然后变换回cloned的本地坐标
          temp.applyMatrix4(clonedInverseMatrix);
          
          const uvx = uvAttribute ? uvAttribute.getX(i) : 0;
          const uvy = uvAttribute ? uvAttribute.getY(i) : 0;
          vertices.push({ x: temp.x, y: temp.y, z: temp.z, uvx, uvy });
        }
        
        // 按UV.Y分组
        const uvYGroups = {};
        const tolerance = 0.02;
        vertices.forEach((vertexData) => {
          const uvY = vertexData.uvy;
          const key = Math.round(uvY / tolerance) * tolerance;
          if (!uvYGroups[key]) uvYGroups[key] = [];
          uvYGroups[key].push(vertexData);
        });
        
        // 连接相邻顶点
        Object.values(uvYGroups).forEach((group) => {
          if (linesCreated >= MAX_TOTAL_SEGMENTS) return;
          if (group.length < 2) return;
          
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
      
      console.log('创建了', linesCreated, '条线段');
      
      // 创建连线几何体
      if (linePositions.length > 0) {
        const validLength = Math.floor(linePositions.length / 6) * 6;
        const validPositions = linePositions.slice(0, validLength);
        const segmentCount = validPositions.length / 6;
        
        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(validPositions, 3));
        
        // UV坐标
        const uvs = new Float32Array(segmentCount * 4);
        for (let s = 0; s < segmentCount; s++) {
          uvs[s * 4 + 0] = 0.0; uvs[s * 4 + 1] = 0.0;
          uvs[s * 4 + 2] = 1.0; uvs[s * 4 + 3] = 0.0;
        }
        lineGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        
        // Fade偏移
        const fadeAttr = new Float32Array(segmentCount * 2);
        for (let s = 0; s < segmentCount; s++) {
          const off = lineFadeOffsets[s] || 0;
          fadeAttr[s * 2 + 0] = off;
          fadeAttr[s * 2 + 1] = off;
        }
        lineGeometry.setAttribute('fadeOffset', new THREE.BufferAttribute(fadeAttr, 1));
        
        // 连线材质
        const lineMaterial = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: {
            color: { value: new THREE.Color('#ffffff') },
            time: { value: 0 }
          },
          vertexShader: geometryLinesVertexShader,
          fragmentShader: geometryLinesFragmentShader,
        });
        
        // 创建连线对象
        const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
        lineSegments.name = 'DynamicLines';
        
        // 添加到场景
        cloned.add(lineSegments);
        
        console.log('✓ 连线已添加到场景，线段数量:', segmentCount);
        
        // 检查连线位置
        lineGeometry.computeBoundingBox();
        const bbox = lineGeometry.boundingBox;
        const center = bbox.getCenter(new THREE.Vector3());
        console.log('连线中心位置:', center);
        
      }
    }
    
    return cloned;
  }, [scene]);

  // 更新所有材质的 time（用于 shader 动画）
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    clonedScene.traverse((child) => {
      if ((child.isMesh || child.isLineSegments) && child.material && child.material.uniforms && child.material.uniforms.time) {
        child.material.uniforms.time.value = t;
      }
    });
  });

  return (
    <group ref={group} position={[0, -40, 0]}>
      <primitive object={clonedScene} />
    </group>
  );
}

// 使用React.memo优化组件重新渲染
const LaserSpline = React.memo(function LaserSpline({ p0, p1, p2, p3, width = 0.05, color = new THREE.Color(1,1,1), segments = 32, intensity = 1.6, falloff = 6.0, shakeIntensity = 0.08, hoverRadius = 0.5 }) {
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

// 3D图片卡片组件 - 使用自定义shader
const ImageCard = React.memo(function ImageCard({ imagePath, position, opacity = 1.0 }) {
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
        uOpacity: { value: opacity },
        uWorldPosition: { value: position },
        uTime: { value: 0.0 },
        uResolution: { value: 24.0 }
      },
      transparent: true
    });
  }, [texture, position, opacity]);
  
  // 更新uniforms
  useFrame((state, delta) => {
    if (meshRef.current && shaderMaterial) {
      // 更新世界位置uniform
      shaderMaterial.uniforms.uWorldPosition.value = position;
      
      // 更新透明度uniform
      shaderMaterial.uniforms.uOpacity.value = opacity;
      
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

// Gallery 3D 组件 - 展示图片
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

  // 计算淡出透明度：当scrollProgress在0.95-1.00时淡出
  const fadeOpacity = useMemo(() => {
    if (scrollProgress <= 0.95) {
      return 1.0; // 完全显示
    } else if (scrollProgress >= 1.0) {
      return 0.0; // 完全透明
    } else {
      // 在0.95-1.0之间线性淡出
      const fadeProgress = (scrollProgress - 0.95) / (1.0 - 0.95);
      return 1.0 - fadeProgress;
    }
  }, [scrollProgress]);

  return (
    <>
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
            opacity={fadeOpacity}
          />
        );
      }), [imagePositions, baseOffset, fadeOpacity])}
    </>
  );
});

// 3D场景摄像头控制组件 - 控制摄像头的位置和朝向
function CameraRig({ sectionState }) {
  const lookRef = useRef(new THREE.Vector3(0, 0, 0));
  useFrame((state, delta) => {
    // 统一基于状态计算目标机位与朝向
    let desiredPos;
    let lookTarget;

    const { currentSection, fourthProgress, galleryProgress } = sectionState;

    if (currentSection === 'fourth') {
      if (fourthProgress >= 0.16) {
        // Views 阶段：分段下降
        let y = -41; // 基础层
        if (fourthProgress > 0.89) {
          y -= 40;
        } else if (fourthProgress > 0.63) {
          y -= 30; // -20 再降 60 => -80
        } else if (fourthProgress > 0.47) {
          y -= 20; // -20 再降 40 => -60
        } else if (fourthProgress > 0.32) {
          y -= 10; // -20 再降 20 => -40
        }
        desiredPos = [-10, y + 2, 5];
        lookTarget = new THREE.Vector3(-5, y, 0);
      } else {
        // Fourth section但progress < 0.16时，保持在-30位置
        desiredPos = [0, -30, 10];
        lookTarget = new THREE.Vector3(0, -30, 0);
      }
    } else if (currentSection === 'gallery') {
      // Gallery 模式
      desiredPos = [0, -10, 10];
      lookTarget = new THREE.Vector3(0, -10, 0);
    } else if (currentSection === 'chart') {
      // Chart 模式 - 摄像头y值移动到-20
      desiredPos = [0, -20, 10];
      lookTarget = new THREE.Vector3(0, -20, 0);
    } else if (currentSection === 'quote') {
      // Quote 模式 - 摄像头y值移动到-30
      desiredPos = [0, -30, 10];
      lookTarget = new THREE.Vector3(0, -30, 0);
    } else {
      // HeroSection 默认模式（基于鼠标的动画）
      desiredPos = [
        Math.sin(-state.pointer.x) * 5 - 5,
        state.pointer.y * 10,
        8 + Math.cos(state.pointer.x) * 3,
      ];
      lookTarget = new THREE.Vector3(0, 0, 0);
    }

    // 惯性缓动到目标机位与目标朝向，同步推进
    easing.damp3(state.camera.position, desiredPos, 0.2, delta);
    easing.damp3(lookRef.current, [lookTarget.x, lookTarget.y, lookTarget.z], 0.2, delta);
    state.camera.lookAt(lookRef.current);
  });

  return null;
}
