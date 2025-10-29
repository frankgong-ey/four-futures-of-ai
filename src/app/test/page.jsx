"use client";

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function TestPage() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5); // 从Z轴正方向看圆柱体侧面
    camera.lookAt(0, 0, 0); // 看向原点

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 创建激光效果的 Shader 材质 - 使用 laserRibbon shader
    const laserMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0x00ff00) },
        uIntensity: { value: 1.0 },
        uFalloff: { value: 3.0 },
        uTime: { value: 0.0 },
        uShakeIntensity: { value: 0.0 },
        uHoverPoint: { value: new THREE.Vector2(0, 0) },
        uHoverActive: { value: 0.0 },
        uHoverRadius: { value: 0.5 }
      },
      vertexShader: `
        attribute float halfCoord;
        attribute float uCoord;
        
        varying float vHalfCoord;
        varying float vU;
        varying vec3 vWorldPosition;
        
        void main() {
          vHalfCoord = halfCoord;
          vU = uCoord;
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          vec3 pos = position;
          pos.z += 0.001;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        precision mediump float;
        
        uniform vec3 uColor;
        uniform float uIntensity;
        uniform float uFalloff;
        uniform float uTime;
        uniform float uShakeIntensity;
        uniform vec2 uHoverPoint;
        uniform float uHoverActive;
        uniform float uHoverRadius;
        
        varying float vHalfCoord;
        varying float vU;
        varying vec3 vWorldPosition;
        
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }
        
        void main() {
          float shakeOffset = 0.0;
          if (uShakeIntensity > 0.0) {
            float shake = noise(vec2(vU * 8.0 + uTime * 2.0, uTime * 1.5)) - 0.5;
            shakeOffset = shake * uShakeIntensity;
          }
          
          float shakenHalfCoord = vHalfCoord + shakeOffset;
          float d = abs(shakenHalfCoord);
          
          float normalizedDistance = d / 1.0;
          float expFalloff = exp(-normalizedDistance * uFalloff);
          
          float centerBoost = 1.0 - smoothstep(0.0, 0.2, normalizedDistance);
          expFalloff = max(expFalloff, centerBoost * 0.9);
          
          float edgeSmooth = smoothstep(0.8, 1.0, normalizedDistance);
          float falloffCurve = expFalloff * (1.0 - edgeSmooth);
          
          if (falloffCurve < 0.001) {
            discard;
          }
          
          float intensity = falloffCurve * uIntensity;
          
          float totalLightIntensity = 0.0;
          
          for(int i = 0; i < 20; i++) {
            float randomOffset = float(i) * 0.01;
            float randomSpeed = 0.1 + fract(sin(float(i) * 12.9898) * 43758.5453) * 0.01;
            float randomDelay = fract(sin(float(i) * 7.1234) * 43758.5453) * 2.0;
            
            float lightPos = fract(uTime * randomSpeed + randomOffset + randomDelay);
            
            float distU = vU - lightPos;
            float distV = shakenHalfCoord;
            
            float ellipseDist = sqrt((distU * distU) / (0.003 * 0.003) + (distV * distV) / (0.03 * 0.03));
            
            float lightIntensity = exp(-ellipseDist * ellipseDist * 2.0);
            
            float flicker = sin(uTime * 5.0 + float(i) * 1.5) * 0.2 + 0.8;
            lightIntensity *= flicker;
            
            totalLightIntensity += lightIntensity;
          }
          
          float lightIntensity = min(totalLightIntensity, 1.0);
          
          vec3 color = uColor;
          if (uHoverActive > 0.5) {
            float distanceToHover = distance(vWorldPosition.xy, uHoverPoint);
            if (distanceToHover < uHoverRadius) {
              float hoverStrength = 1.0 - smoothstep(0.0, uHoverRadius, distanceToHover);
              color = mix(uColor, vec3(1.0, 1.0, 1.0), hoverStrength * 0.8);
            }
          }
          
          if (lightIntensity > 0.01) {
            float brightnessBoost = 1.0 + lightIntensity * 1.0;
            color = color * brightnessBoost;
            color = mix(color, vec3(1.0, 1.0, 1.0), lightIntensity * 0.3);
          }
          
          gl_FragColor = vec4(color, intensity + lightIntensity * 0.5);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    // 创建圆柱体几何体并添加所需的 attributes
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 32);
    
    // 添加 halfCoord attribute (从 -1 到 +1 跨越圆柱体宽度)
    const halfCoordArray = new Float32Array(geometry.attributes.position.count);
    const uCoordArray = new Float32Array(geometry.attributes.position.count);
    
    for (let i = 0; i < geometry.attributes.position.count; i++) {
      const x = geometry.attributes.position.getX(i);
      const z = geometry.attributes.position.getZ(i);
      const y = geometry.attributes.position.getY(i);
      
      // halfCoord: 从圆柱体中心到边缘的距离，归一化到 [-1, 1]
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      halfCoordArray[i] = (distanceFromCenter / 0.5) * 2.0 - 1.0;
      
      // uCoord: 沿圆柱体高度方向的坐标 [0, 1]
      uCoordArray[i] = (y + 2) / 4; // y 范围是 [-2, 2]，映射到 [0, 1]
    }
    
    geometry.setAttribute('halfCoord', new THREE.BufferAttribute(halfCoordArray, 1));
    geometry.setAttribute('uCoord', new THREE.BufferAttribute(uCoordArray, 1));
    
    const cylinder = new THREE.Mesh(geometry, laserMaterial);
    cylinder.position.set(0, 0, 0);
    scene.add(cylinder);

    // 添加一些背景元素来测试透明度
    const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
    const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(1, 0, 0);
    scene.add(box);

    const sphereGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(-1, 0, 0);
    scene.add(sphere);

    // 添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // 添加网格辅助线
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // 添加坐标轴辅助线
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // 渲染循环
    const animate = () => {
      requestAnimationFrame(animate);
      
      // 更新时间 uniform
      laserMaterial.uniforms.uTime.value = performance.now() * 0.001;
      
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 处理窗口大小变化
    const handleResize = () => {
      if (!mountRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-white mb-4">3D Laser Effect Test</h1>
        <p className="text-white/70 mb-6">
          这是一个基于 LaserRibbon Shader 的 3D 激光效果测试页面。圆柱体从中心轴向外产生径向渐变，并带有动态光点效果。
        </p>
      </div>
      
      <div 
        ref={mountRef}
        className="w-full h-[calc(100vh-200px)] border border-white/20"
        style={{ minHeight: '600px' }}
      />
      
      <div className="p-6">
        <div className="text-white/60 text-sm">
          <p>• 鼠标左键拖拽：旋转视角</p>
          <p>• 鼠标滚轮：缩放</p>
          <p>• 鼠标右键拖拽：平移</p>
          <p>• 绿色圆柱体：LaserRibbon Shader 效果</p>
          <p>• 红色立方体 & 蓝色球体：背景测试元素</p>
        </div>
      </div>
    </div>
  );
}
