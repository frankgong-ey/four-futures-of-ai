"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

// 带 Glitch 效果的图片组件
function GlitchImage({ url, position, rotation, scale, opacity }) {
  const texture = useTexture(url);
  const meshRef = useRef();
  
  // 设置纹理的颜色空间
  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    }
  }, [texture]);
  
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      toneMapped: true, // 启用色调映射，限制图片亮度，避免触发 bloom
      uniforms: {
        uTexture: { value: texture },
        uTime: { value: 0 },
        uOpacity: { value: opacity },
        uGlitchIntensity: { value: 0.35 }
      },
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uTime;
        uniform float uOpacity;
        uniform float uGlitchIntensity;
        varying vec2 vUv;
        
        // 随机函数
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        
        void main() {
          vec2 uv = vUv;
          
          // 随机的 glitch 触发
          float glitchTrigger = step(0.9, random(vec2(uTime * 0.5, uTime * 0.3)));
          
          // RGB 通道分离
          float offset = uGlitchIntensity * glitchTrigger * 0.02;
          vec4 r = texture2D(uTexture, uv + vec2(offset, 0.0));
          vec4 g = texture2D(uTexture, uv);
          vec4 b = texture2D(uTexture, uv - vec2(offset, 0.0));
          vec4 color = vec4(r.r, g.g, b.b, g.a);
          
          // 水平扫描线位移
          float scanline = step(0.95, random(vec2(floor(uv.y * 50.0), floor(uTime * 10.0))));
          float displacement = (random(vec2(floor(uTime * 5.0), floor(uv.y * 20.0))) - 0.5) * 0.05;
          uv.x += displacement * scanline * glitchTrigger;
          
          // 如果有位移，重新采样
          if (scanline > 0.0 && glitchTrigger > 0.0) {
            color = texture2D(uTexture, uv);
          }
          
          // 随机闪烁
          float flicker = 1.0 - glitchTrigger * 0.3 * random(vec2(uTime * 20.0));
          color.rgb *= flicker;
          
          // 应用透明度
          color.a *= uOpacity;
          
          gl_FragColor = color;
        }
      `
    });
  }, [texture]);
  
  // 更新时间 uniform
  useFrame((state) => {
    if (meshRef.current && meshRef.current.material) {
      meshRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
      meshRef.current.material.uniforms.uOpacity.value = opacity;
    }
  });
  
  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export default GlitchImage;
