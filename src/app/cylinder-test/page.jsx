"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { CatmullRomCurve3 } from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera, Environment, ContactShadows, MeshTransmissionMaterial} from "@react-three/drei";
import { useControls, Leva } from "leva";

import ribbonVertexShader from "../test/shaders/laserRibbon.vert.glsl";
import ribbonFragmentShader from "../test/shaders/laserRibbon.frag.glsl";
import glassVertexShader from "../../shaders/glassShader.vert.glsl";
import glassFragmentShader from "../../shaders/glassShader.frag.glsl";
import FirstScreen from "../../components/FirstScreen";

export default function CylinderTestPage() {
  
  // 使用leva管理所有调试参数 - 简化结构
  const {
    // 激光带颜色（独立控制）
    ribbon1Color,
    ribbon2Color,
    ribbon3Color,
    ribbon4Color,
    
    // 共用激光带参数
    ribbonIntensity,
    ribbonWidth,
    ribbonSegments,
    ribbonFalloff,
    ribbonShakeIntensity,
    hoverRadius,
    
    // 圆柱体参数
    tunnelVisible,
    cylinderRadius,
    cylinderHeight,
    cylinderThickness,
    cylinderSegments,
    coneTopRadius,
    coneBottomRadius,
    useCustomShader,
    refractionStrength,
    fresnelPower,
    
    // 第一条曲线控制点
    p1_0x, p1_0y,
    p1_1x, p1_1y,
    p1_2x, p1_2y,
    p1_3x, p1_3y,
    
    // 第二条曲线控制点
    p2_0x, p2_0y,
    p2_1x, p2_1y,
    p2_2x, p2_2y,
    p2_3x, p2_3y,
    
    // 第三条曲线控制点
    p3_0x, p3_0y,
    p3_1x, p3_1y,
    p3_2x, p3_2y,
    p3_3x, p3_3y,
    
    // 第四条曲线控制点
    p4_0x, p4_0y,
    p4_1x, p4_1y,
    p4_2x, p4_2y,
    p4_3x, p4_3y,
    
  } = useControls({
    // 激光带颜色（独立控制）
    ribbon1Color: { value: "#ce78ba", folder: "Colors" },
    ribbon2Color: { value: "#2bb856", folder: "Colors" },
    ribbon3Color: { value: "#7ebff5", folder: "Colors" },
    ribbon4Color: { value: "#f56962", folder: "Colors" },
    
    // 共用激光带参数
    ribbonIntensity: { value: 1.0, min: 0, max: 4, step: 0.05, folder: "Ribbon Settings" },
    ribbonWidth: { value: 2.0, min: 1.0, max: 4.0, step: 0.05, folder: "Ribbon Settings" },
    ribbonSegments: { value: 64, min: 8, max: 256, step: 1, folder: "Ribbon Settings" },
    ribbonFalloff: { value: 4.0, min: 0.1, max: 200, step: 0.1, folder: "Ribbon Settings" },
    ribbonShakeIntensity: { value: 0.08, min: 0, max: 0.3, step: 0.005, folder: "Ribbon Settings" },
    hoverRadius: { value: 0.5, min: 0.1, max: 2.0, step: 0.1, folder: "Ribbon Settings" },
    
    // 圆柱体参数
    tunnelVisible: { value: true, folder: "Glass Cylinder" },
    cylinderRadius: { value: 5.0, min: 0.1, max: 1.0, step: 0.05, folder: "Glass Cylinder" },
    cylinderHeight: { value: 5.0, min: 0.5, max: 5.0, step: 0.1, folder: "Glass Cylinder" },
    cylinderThickness: { value: 10.0, min: 0.1, max: 10.0, step: 0.1, folder: "Glass Cylinder" },
    cylinderSegments: { value: 24, min: 8, max: 64, step: 8, folder: "Glass Cylinder" },
    coneTopRadius: { value: 0.2, min: 0.01, max: 1.0, step: 0.01, folder: "Glass Cylinder" },
    coneBottomRadius: { value: 1.5, min: 0.01, max: 2.0, step: 0.01, folder: "Glass Cylinder" },
    useCustomShader: { value: false, folder: "Material Type" },
    refractionStrength: { value: 0.1, min: 0.0, max: 0.5, step: 0.01, folder: "Custom Shader" },
    fresnelPower: { value: 2.0, min: 0.5, max: 5.0, step: 0.1, folder: "Custom Shader" },
    
    // 第一条曲线控制点
    p1_0x: { value: -20, min: -20, max: 20, step: 0.1, folder: "Ribbon 1 Curve" },
    p1_0y: { value: -0, min: -20, max: 20, step: 0.1, folder: "Ribbon 1 Curve" },
    p1_1x: { value: 0, min: -20, max: 20, step: 0.1, folder: "Ribbon 1 Curve" },
    p1_1y: { value: 0, min: -20, max: 20, step: 0.1, folder: "Ribbon 1 Curve" },
    p1_2x: { value: 20, min: -20, max: 20, step: 0.1, folder: "Ribbon 1 Curve" },
    p1_2y: { value: 0, min: -20, max: 20, step: 0.1, folder: "Ribbon 1 Curve" },
    p1_3x: { value: 40, min: -20, max: 40, step: 0.1, folder: "Ribbon 1 Curve" },
    p1_3y: { value: 0, min: -20, max: 20, step: 0.1, folder: "Ribbon 1 Curve" },
    
    // 第二条曲线控制点
    p2_0x: { value: -20, min: -20, max: 20, step: 0.1, folder: "Ribbon 2 Curve" },
    p2_0y: { value: 0, min: -20, max: 20, step: 0.1, folder: "Ribbon 2 Curve" },
    p2_1x: { value: 0, min: -20, max: 20, step: 0.1, folder: "Ribbon 2 Curve" },
    p2_1y: { value: 0, min: -20, max: 20, step: 0.1, folder: "Ribbon 2 Curve" },
    p2_2x: { value: 20, min: -20, max: 20, step: 0.1, folder: "Ribbon 2 Curve" },
    p2_2y: { value: 0, min: -20, max: 20, step: 0.1, folder: "Ribbon 2 Curve" },
    p2_3x: { value: 40, min: -20, max: 40, step: 0.1, folder: "Ribbon 2 Curve" },
    p2_3y: { value: 5, min: -20, max: 20, step: 0.1, folder: "Ribbon 2 Curve" },
    
    // 第三条曲线控制点
    p3_0x: { value: -20, min: -20, max: 20, step: 0.1, folder: "Ribbon 3 Curve" },
    p3_0y: { value: 0, min: -20, max: 20, step: 0.1, folder: "Ribbon 3 Curve" },
    p3_1x: { value: 0, min: -20, max: 20, step: 0.1, folder: "Ribbon 3 Curve" },
    p3_1y: { value: 0, min: -20, max: 20, step: 0.1, folder: "Ribbon 3 Curve" },
    p3_2x: { value: 20, min: -20, max: 20, step: 0.1, folder: "Ribbon 3 Curve" },
    p3_2y: { value: 3, min: -20, max: 20, step: 0.1, folder: "Ribbon 3 Curve" },
    p3_3x: { value: 40, min: -20, max: 40, step: 0.1, folder: "Ribbon 3 Curve" },
    p3_3y: { value: 5, min: -20, max: 20, step: 0.1, folder: "Ribbon 3 Curve" },
    
    // 第四条曲线控制点
    p4_0x: { value: -20, min: -20, max: 20, step: 0.1, folder: "Ribbon 4 Curve" },
    p4_0y: { value: 0, min: -20, max: 20, step: 0.1, folder: "Ribbon 4 Curve" },
    p4_1x: { value: 0, min: -20, max: 20, step: 0.1, folder: "Ribbon 4 Curve" },
    p4_1y: { value: 0, min: -20, max: 20, step: 0.1, folder: "Ribbon 4 Curve" },
    p4_2x: { value: 20, min: -20, max: 20, step: 0.1, folder: "Ribbon 4 Curve" },
    p4_2y: { value: -3, min: -20, max: 20, step: 0.1, folder: "Ribbon 4 Curve" },
    p4_3x: { value: 40, min: -20, max: 40, step: 0.1, folder: "Ribbon 4 Curve" },
    p4_3y: { value: -5, min: -20, max: 20, step: 0.1, folder: "Ribbon 4 Curve" },
    
  });
  
  // 构建控制点数组
  const p1_0 = [p1_0x, p1_0y];
  const p1_1 = [p1_1x, p1_1y];
  const p1_2 = [p1_2x, p1_2y];
  const p1_3 = [p1_3x, p1_3y];
  
  const p2_0 = [p2_0x, p2_0y];
  const p2_1 = [p2_1x, p2_1y];
  const p2_2 = [p2_2x, p2_2y];
  const p2_3 = [p2_3x, p2_3y];
  
  const p3_0 = [p3_0x, p3_0y];
  const p3_1 = [p3_1x, p3_1y];
  const p3_2 = [p3_2x, p3_2y];
  const p3_3 = [p3_3x, p3_3y];
  
  const p4_0 = [p4_0x, p4_0y];
  const p4_1 = [p4_1x, p4_1y];
  const p4_2 = [p4_2x, p4_2y];
  const p4_3 = [p4_3x, p4_3y];
  
  
    // Fullscreen canvas with orthographic camera and orbit controls
    return (
    <div 
    style={{ width: "100vw", height: "100vh" }}
    className="relative"
    >
        <Leva collapsed={false} titleBar={{ title: "圆柱体测试面板" }} />
        
        {/* 背景图片 */}
        <div 
            className="fixed inset-0 w-screen h-screen pointer-events-none"
            style={{
                backgroundImage: 'url(/images/hero_gradient.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                zIndex: 0
                }}
        />
        
        {/* Canvas 3D内容 */}
        <Canvas 
          gl={{ 
            antialias: true,
            alpha: true,
          }}
          style={{ background: "transparent" }}
          className="absolute inset-0 z-10"
        >
          <OrthographicCamera 
            makeDefault 
            position={[-3, 0, 8]} 
            zoom={100}
            near={-1000}
            far={1000}
          />
          <OrbitControls enableDamping dampingFactor={0.05} />
  
          {/* 圆锥台效果 */}
          <CylinderTunnel
            visible={tunnelVisible}
            radius={cylinderRadius}
            height={cylinderHeight}
            thickness={cylinderThickness}
            segments={cylinderSegments}
            topRadius={coneTopRadius}
            bottomRadius={coneBottomRadius}
            useCustomShader={useCustomShader}
            refractionStrength={refractionStrength}
            fresnelPower={fresnelPower}
          />
  
          {/* axes helper for orientation */}
          <axesHelper args={[1.5]} />
  
          {/* 光源和环境 */}
          <ambientLight intensity={0.3} />
          <spotLight position={[20, 20, 10]} penumbra={1} castShadow angle={0.2} intensity={1} />
          <Environment preset="city" />
          <ContactShadows scale={50} position={[0, -3, 0]} blur={1} far={50} opacity={0.3} />
  
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
        </Canvas>
        
        {/* FirstScreen HTML内容 */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <FirstScreen />
        </div>
      </div>
    );
}

// 圆锥台组件 - 使用cone geometry，可选择MeshTransmissionMaterial或自定义shader
function CylinderTunnel({ 
  radius = 0.3, 
  height = 2.0, 
  thickness = 2.0, 
  segments = 32, 
  topRadius = 0.1,
  bottomRadius = 0.5,
  useCustomShader = false,
  refractionStrength = 0.1,
  fresnelPower = 2.0,
  visible = true 
}) {
  if (!visible) return null;

  const materialRef = useRef();
  const { camera } = useThree();

  // 更新时间uniform
  useFrame((state) => {
    if (useCustomShader && materialRef.current && materialRef.current.uniforms) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} receiveShadow castShadow>
      <cylinderGeometry args={[topRadius, bottomRadius, height, segments]} />
      {useCustomShader ? (
        <shaderMaterial
          ref={materialRef}
          vertexShader={glassVertexShader}
          fragmentShader={glassFragmentShader}
          uniforms={{
            uColor: { value: new THREE.Color("white") },
            uOpacity: { value: 0.8 },
            uTime: { value: 0 },
            uRefractionStrength: { value: refractionStrength },
            uFresnelPower: { value: fresnelPower }
          }}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      ) : (
        <MeshTransmissionMaterial 
          backside 
          backsideThickness={5} 
          thickness={thickness}
          roughness={0.2}
          transmission={1}
          ior={1.5}
          chromaticAberration={0.02}
          backsideTransmission={0.8}
          samples={10}
          resolution={512}
        />
      )}
    </mesh>
  );
}

function LaserRibbonCubic({ p0, p1, p2, p3, width = 0.05, color = new THREE.Color(1,1,1), segments = 64, intensity = 1.6, falloff = 6.0, shakeIntensity = 0.08, hoverRadius = 0.5 }) {
  const materialRef = useRef();
  const meshRef = useRef();
  const { viewport, camera } = useThree();
  
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

  // Geometry builds can re-run on shape changes
  const geometry = useMemo(() => {
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

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const P = curve.getPoint(t);
      const T = curve.getTangent(t);
      
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
      uCoords.push(t, t);

      if (i < segments) {
        const base = i * 2;
        // two triangles (base, base+1, base+2) and (base+1, base+3, base+2)
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("halfCoord", new THREE.Float32BufferAttribute(halfCoords, 1));
    geo.setAttribute("uCoord", new THREE.Float32BufferAttribute(uCoords, 1));
    geo.setIndex(indices);
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

  useEffect(() => { uniformsRef.current.uColor.value.copy(color); }, [color]);
  useEffect(() => { uniformsRef.current.uIntensity.value = intensity; }, [intensity]);
  useEffect(() => { uniformsRef.current.uFalloff.value = falloff; }, [falloff]);
  useEffect(() => { uniformsRef.current.uShakeIntensity.value = shakeIntensity; }, [shakeIntensity]);
  useEffect(() => { uniformsRef.current.uHoverRadius.value = hoverRadius; }, [hoverRadius]);
  
  // 更新hover点信息
  useEffect(() => {
    uniformsRef.current.uHoverPoint.value.set(hoverPoint.x, hoverPoint.y);
    uniformsRef.current.uHoverActive.value = hoverPoint.active ? 1.0 : 0.0;
  }, [hoverPoint]);

  useFrame((_, delta) => {
    uniformsRef.current.uTime.value += delta;
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
}
