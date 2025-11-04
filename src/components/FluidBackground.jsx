"use client";

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
// import { useControls } from 'leva';
import { gsap } from 'gsap';

import fluidBackgroundVertexShader from '../shaders/fluidBackground.vert.glsl';
import fluidBackgroundFragmentShader from '../shaders/fluidBackground.frag.glsl';

export default function FluidBackground({ sectionState, fourthProgress = 0 }) {
  const meshRef = useRef();
  const { camera } = useThree();
  const color1Ref = useRef('#0a0a0a'); // 固定为接近黑色
  
  // Leva 调试面板 - 已禁用
  // const {
  //   color2, 
  //   color3,
  //   color4,
  //   speed,
  //   noiseScale,
  //   intensity,
  //   opacity,
  //   distance
  // } = useControls('Fluid Background', {
  //   color2: { value: '#0e0b2e', r: 14, g: 11, b: 46 },
  //   color3: { value: '#000000', r: 0, g: 0, b: 0 },
  //   color4: { value: '#000000', r: 0, g: 0, b: 0 },
  //   speed: { value: 2.0, min: 0, max: 2, step: 0.1 },
  //   noiseScale: { value: 4.0, min: 0.5, max: 5, step: 0.1 },
  //   intensity: { value: 1.0, min: 0, max: 2, step: 0.1 },
  //   opacity: { value: 0.8, min: 0, max: 1, step: 0.05 },
  //   distance: { value: 25, min: -50, max: 50, step: 1 }
  // });

  // 使用默认值替代Leva控制
  const color2 = '#0e0b2e';
  const color3 = '#000000';
  const color4 = '#000000';
  const speed = 2.0;
  const noiseScale = 4.0;
  const intensity = 1.0;
  const opacity = 0.8;
  const distance = 25;

  // 移除动态颜色变化，保持恒定颜色
  // useEffect(() => {
  //   let targetColor = '#4762c4'; // 默认蓝色
  //   
  //   // 检查是否在指定范围内
  //   if (fourthProgress >= 0.17 && fourthProgress <= 0.89) {
  //     targetColor = '#0a0a0a'; // 接近黑色
  //   } else if (sectionState === 'fourth') {
  //     targetColor = '#bea852'; // 金色
  //   }
  //   
  //   // 使用GSAP进行颜色过渡
  //   gsap.to(color1Ref, {
  //     current: targetColor,
  //     duration: 1.5,
  //     ease: "power2.inOut",
  //     onUpdate: () => {
  //       // 颜色更新会在useFrame中处理
  //     }
  //   });
  // }, [sectionState, fourthProgress]);

  // 创建shader材质 - 彻底避免Bloom影响
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: fluidBackgroundVertexShader,
      fragmentShader: fluidBackgroundFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color(color1Ref.current) },
        uColor2: { value: new THREE.Color(color2) },
        uColor3: { value: new THREE.Color(color3) },
        uColor4: { value: new THREE.Color(color4) },
        uSpeed: { value: speed },
        uNoiseScale: { value: noiseScale },
        uIntensity: { value: intensity },
        uOpacity: { value: opacity }
      },
      transparent: true,
      side: THREE.DoubleSide,
      toneMapped: true, // 确保颜色被色调映射
      depthWrite: false, // 避免深度写入问题
      depthTest: true, // 启用深度测试
      blending: THREE.NormalBlending, // 使用正常混合模式
      premultipliedAlpha: false // 禁用预乘alpha
    });
  }, [color2, color3, color4, speed, noiseScale, intensity, opacity]);

  // 创建几何体 - 大平面
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(20, 20, 32, 32);
  }, []);

  // 更新材质uniforms
  useFrame((state) => {
    if (shaderMaterial.uniforms) {
      shaderMaterial.uniforms.uTime.value = state.clock.getElapsedTime();
      shaderMaterial.uniforms.uColor1.value.set(color1Ref.current);
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
      visible={true} // 确保可见
      castShadow={false} // 不投射阴影
      receiveShadow={false} // 不接收阴影
    />
  );
}
