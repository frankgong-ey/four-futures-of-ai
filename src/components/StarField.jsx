"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 性能优化的星空组件
export default function StarField({ count = 200, radius = 50 }) {
  const meshRef = useRef();
  const materialRef = useRef();

  // 使用 useMemo 来优化性能，避免每次渲染都重新计算
  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // 在球形空间内随机分布星星，更靠近摄像头
      const radiusVariation = radius * (0.1 + Math.random() * 0.3); // 更靠近中心
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radiusVariation * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radiusVariation * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radiusVariation * Math.cos(phi) + 5; // 向前移动5个单位，更靠近摄像头

      // 创建不同层次的星星颜色
      const brightness = 0.6 + Math.random() * 0.4; // 提高亮度范围
      const colorVariation = Math.random();
      
      if (colorVariation < 0.3) {
        // 蓝色星星
        colors[i3] = 0.7 * brightness;
        colors[i3 + 1] = 0.8 * brightness;
        colors[i3 + 2] = 1.0 * brightness;
      } else if (colorVariation < 0.6) {
        // 白色星星
        colors[i3] = 1.0 * brightness;
        colors[i3 + 1] = 1.0 * brightness;
        colors[i3 + 2] = 1.0 * brightness;
      } else if (colorVariation < 0.8) {
        // 黄色星星
        colors[i3] = 1.0 * brightness;
        colors[i3 + 1] = 0.9 * brightness;
        colors[i3 + 2] = 0.6 * brightness;
      } else {
        // 红色星星
        colors[i3] = 1.0 * brightness;
        colors[i3 + 1] = 0.6 * brightness;
        colors[i3 + 2] = 0.6 * brightness;
      }

      // 不同大小的星星
      sizes[i] = 0.5 + Math.random() * 2.0;
    }

    return { positions, colors, sizes };
  }, [count, radius]);

  // 缓慢的旋转动画
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0005;
      meshRef.current.rotation.x += 0.0002;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={2.0}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={1.0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// 分层星空组件 - 创建多个层次的星空效果
export function LayeredStarField() {
  return (
    <group>
      {/* 简化的星空 - 先测试基本显示 */}
      <StarField count={200} radius={50} />
    </group>
  );
}
