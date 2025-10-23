"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useControls } from 'leva';

import fluidBackgroundVertexShader from '../shaders/fluidBackground.vert.glsl';
import fluidBackgroundFragmentShader from '../shaders/fluidBackground.frag.glsl';

export default function FluidBackground() {
  const meshRef = useRef();
  const { camera } = useThree();
  
  // Leva 调试面板
  const {
    color1,
    color2, 
    color3,
    color4,
    speed,
    noiseScale,
    intensity,
    opacity,
    distance
  } = useControls('Fluid Background', {
    color1: { value: '#4762c4', r: 71, g: 98, b: 196 },
    color2: { value: '#0e0b2e', r: 14, g: 11, b: 46 },
    color3: { value: '#000000', r: 0, g: 0, b: 0 },
    color4: { value: '#000000', r: 0, g: 0, b: 0 },
    speed: { value: 2.0, min: 0, max: 2, step: 0.1 },
    noiseScale: { value: 4.0, min: 0.5, max: 5, step: 0.1 },
    intensity: { value: 1.0, min: 0, max: 2, step: 0.1 },
    opacity: { value: 0.8, min: 0, max: 1, step: 0.05 },
    distance: { value: 25, min: -50, max: 50, step: 1 }
  });

  // 创建shader材质
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: fluidBackgroundVertexShader,
      fragmentShader: fluidBackgroundFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color(color1) },
        uColor2: { value: new THREE.Color(color2) },
        uColor3: { value: new THREE.Color(color3) },
        uColor4: { value: new THREE.Color(color4) },
        uSpeed: { value: speed },
        uNoiseScale: { value: noiseScale },
        uIntensity: { value: intensity },
        uOpacity: { value: opacity }
      },
      transparent: true,
      side: THREE.DoubleSide
    });
  }, [color1, color2, color3, color4, speed, noiseScale, intensity, opacity]);

  // 创建几何体 - 大平面
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(20, 20, 32, 32);
  }, []);

  // 更新材质uniforms
  useFrame((state) => {
    if (shaderMaterial.uniforms) {
      shaderMaterial.uniforms.uTime.value = state.clock.getElapsedTime();
      shaderMaterial.uniforms.uColor1.value.set(color1);
      shaderMaterial.uniforms.uColor2.value.set(color2);
      shaderMaterial.uniforms.uColor3.value.set(color3);
      shaderMaterial.uniforms.uColor4.value.set(color4);
      shaderMaterial.uniforms.uSpeed.value = speed;
      shaderMaterial.uniforms.uNoiseScale.value = noiseScale;
      shaderMaterial.uniforms.uIntensity.value = intensity;
      shaderMaterial.uniforms.uOpacity.value = opacity;
    }
  });

  // 让背景始终面向摄像机
  useFrame(() => {
    if (meshRef.current) {
      // 获取摄像机的世界位置
      const cameraWorldPosition = new THREE.Vector3();
      camera.getWorldPosition(cameraWorldPosition);
      
      // 让背景面向摄像机
      meshRef.current.lookAt(cameraWorldPosition);
      
      // 将背景放置在摄像机后方更远的位置，避免遮挡前景物体
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      meshRef.current.position.copy(cameraWorldPosition).add(direction.multiplyScalar(distance));
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={shaderMaterial}
      renderOrder={-1000} // 确保在最底层渲染
      frustumCulled={false} // 禁用视锥体剔除，确保始终渲染
    />
  );
}
