"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import GlitchImage from "./GlitchImage";

function GalleryTunnel({ scrollProgress }) {
  const group = useRef(null);
  const [opacity, setOpacity] = useState(0);
  const movementOffset = useRef(0); // 用于持续向前移动的偏移量
  const hasStartedMoving = useRef(false); // 标记是否已经开始持续移动
  const planes = useMemo(() => {
    const arr = [];
    const imageUrls = [
      "/images/gallery_1.png",
      "/images/gallery_2.png",
      "/images/gallery_3.png",
      "/images/gallery_4.png",
      "/images/gallery_5.png",
      "/images/gallery_6.png",
      "/images/gallery_7.png",
      "/images/gallery_8.png",
      "/images/gallery_9.png",
      "/images/gallery_10.png",
    ];
    // 每张图片的 prompt 文本
    const prompts = [
      "A futuristic cityscape at sunset",
      "Abstract digital art with vibrant colors",
      "A serene mountain landscape",
      "Cyberpunk street scene at night",
      "Ethereal forest with glowing lights",
      "Geometric patterns in motion",
      "Deep space nebula",
      "Minimalist architecture design",
      "Surreal dreamscape",
      "Dynamic particle system"
    ];
    
    for (let i = 0; i < 10; i++) {
      // 摄像机从 (-5,1,8) 移动到 (20,3,0)
      // 把图片放在摄像机终点后方，从 X=22 开始
      const x = 22 + i * 3; // 从X=22开始，间隔3单位
      
      // 随机的Y坐标变化，在2.5到3.5之间
      const yOffset = Math.random() * 1; // 0到1的随机值
      const y = 4.5 + yOffset; // 基准高度3，上下浮动0.5
      
      // 左右交替 Z 坐标
      const z = i % 2 === 0 ? -2 : 2; // 偶数左侧(-2)，奇数右侧(2)
      
      // 朝向 +X 方向（-Math.PI/2 = -90度，让图片面向 +X，即朝向摄像机来的方向）
      const rotY = -Math.PI / 2;
      
      // 随机的缩放，在0.8到1.2之间
      const scaleFactor = 0.8 + Math.random() * 0.4; // 0.8到1.2的随机值
      const scale = [1.6 * scaleFactor, 0.9 * scaleFactor, 1];
      
      arr.push({ 
        pos: [x, y, z], 
        rotY, 
        scale, 
        url: imageUrls[i % imageUrls.length],
        prompt: prompts[i % prompts.length]
      });
    }
    return arr;
  }, []);

  // 根据滚动进度控制 3D 图片廊的可见性与入场动画
  useFrame((state, delta) => {
    if (!group?.current) return;
    const p = scrollProgress;
    const revealStart = 0.23; // 从 23% 开始出现
    const t = THREE.MathUtils.clamp((p - revealStart) / (1 - revealStart), 0, 1);

    // 计算基础位置（入场动画的目标位置）
    const basePosition = THREE.MathUtils.lerp(5, 0, t);
    
    // 当滚动在25%-50%之间时，图片持续移动
    if (p >= 0.25 && p < 0.5) {
      if (!hasStartedMoving.current) {
        // 第一次到达25%，初始化移动起点
        hasStartedMoving.current = true;
        movementOffset.current = basePosition;
      }
      // 持续向摄像机方向移动（X轴负方向）
      const moveSpeed = 0.5; // 每秒移动0.5单位
      movementOffset.current -= delta * moveSpeed;
      group.current.position.x = movementOffset.current;
    } else if (p >= 0.5) {
      // 50%以后保持在最后的位置（虽然不可见了）
      // 不做任何操作，保持最后的 movementOffset
      group.current.position.x = movementOffset.current;
    } else {
      // p < 0.25，即回滚到25%之前
      if (hasStartedMoving.current) {
        // 如果已经开始移动过，回滚时平滑过渡到当前滚动位置
        // 使用 lerp 让位置平滑回到基础位置
        movementOffset.current = THREE.MathUtils.lerp(movementOffset.current, basePosition, 0.1);
        group.current.position.x = movementOffset.current;
        
        // 如果已经接近基础位置，重置移动标志
        if (Math.abs(movementOffset.current - basePosition) < 0.01) {
          hasStartedMoving.current = false;
        }
      } else {
        // 正常的入场动画
        group.current.position.x = basePosition;
        movementOffset.current = basePosition;
      }
    }
    
    // 轻微缩放入场
    const s = THREE.MathUtils.lerp(0.8, 1, t);
    group.current.scale.set(s, s, s);
    
    // 透明度控制：23%-25% 淡入，48%-50% 淡出
    let finalOpacity = 0;
    if (p < 0.25) {
      // 淡入阶段：23%-25%
      const fadeInStart = 0.23;
      const fadeInEnd = 0.25;
      finalOpacity = THREE.MathUtils.clamp((p - fadeInStart) / (fadeInEnd - fadeInStart), 0, 1);
    } else if (p < 0.48) {
      // 完全可见阶段：25%-48%
      finalOpacity = 1;
    } else if (p < 0.5) {
      // 淡出阶段：48%-50%
      const fadeOutStart = 0.48;
      const fadeOutEnd = 0.5;
      finalOpacity = 1 - THREE.MathUtils.clamp((p - fadeOutStart) / (fadeOutEnd - fadeOutStart), 0, 1);
    } else {
      // 完全不可见：50%以后
      finalOpacity = 0;
    }
    setOpacity(finalOpacity);
  });

  return (
    <group ref={group}>
      {planes.map((p, i) => {
        // 计算文本位置：在图片左上角上方
        const imageHeight = p.scale[1] * 0.5; // 图片高度的一半
        const imageWidth = p.scale[0]; // 图片宽度
        const textY = p.pos[1] + imageHeight + 0.1; // 图片顶部上方0.1单位
        
        // 由于图片旋转了-90度，局部X方向在世界坐标中是Z方向
        // 图片左边缘在局部X=-imageWidth*0.5，对应世界Z坐标减去imageWidth*0.5
        const textZ = p.pos[2] - imageWidth * 0.5;
        
        return (
          <group key={i}>
            <GlitchImage
              url={p.url}
              position={p.pos}
              rotation={[0, p.rotY, 0]}
              scale={p.scale}
              opacity={opacity}
            />
            <Text
              position={[p.pos[0], textY, textZ]}
              rotation={[0, p.rotY, 0]}
              fontSize={0.05}
              color="#ffffff"
              anchorX="left"
              anchorY="bottom"
              maxWidth={imageWidth}
              outlineWidth={0.001}
              outlineColor="#000000"
              fillOpacity={opacity}
              outlineOpacity={opacity}
            >
              {p.prompt}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

export default GalleryTunnel;
