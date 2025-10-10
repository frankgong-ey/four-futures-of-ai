"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, useTexture, Text } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, DepthOfField } from "@react-three/postprocessing";
import * as THREE from "three";
import React, { useMemo, useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import vertexShader from "../../shaders/neon.vert.glsl";
import fragmentShader from "../../shaders/neon.frag.glsl";

// 注册GSAP插件
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/*
* 加载霓虹灯条模型组件。通过props接收进度
*/ 
function ModelLoader({ scrollProgress }) {
  const { scene } = useGLTF('/models/neon_scene01.glb'); // 加载霓虹灯条模型。如果存在则返回，不存在则返回null。
  const group = useRef(null); // 是一个三维对象，用于存储所有的模型。
  const materialsRef = useRef([]); // 是一个数组，存储所有的材质。

  // 渲染和更新时间uniform用在材质中。
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!group.current) return; // 如果 group 不存在，则返回。
    
    // 更新时间uniform和progress
    materialsRef.current.forEach(material => {
      if (material && material.uniforms) {
        if (material.uniforms.time) {
          material.uniforms.time.value = t;
        }
        if (material.uniforms.progress) {
          material.uniforms.progress.value = scrollProgress;
        }
      }
    });
  });

  // 克隆场景并应用动画材质（只执行一次), 克隆场景是为了避免修改原始场景。
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    materialsRef.current = [];
    
    // 定义颜色数组和索引计数器
    const colors = ["#750D5D", "#2BB856", "#198CE6", "#FF4136"];
    let colorIndex = 0;
    
    // 遍历所有网格并应用动画材质
    cloned.traverse((child) => {
      if (child.isMesh) {
        // 按顺序为每个模型分配颜色
        const currentColor = colors[colorIndex % colors.length]; 
        colorIndex++; // 递增索引以便下一个模型使用下一个颜色
        
        const material = new THREE.ShaderMaterial({
          transparent: true,
          side: THREE.DoubleSide, // 双面渲染，避免背面被遮挡
          alphaTest: 0.0, // 允许完全透明的像素
          depthWrite: false, // 禁用深度写入，避免透明度排序问题
          blending: THREE.AdditiveBlending, // 使用加法混合，让重叠部分更亮
          toneMapped: false, // 禁用色调映射，让 tube 模型触发 bloom
          uniforms: {
            color: { value: new THREE.Color(currentColor) },
            progress: { value: 0.3 }, // 初始显示30%，让neon一开始就可见
            time: { value: 0 },
            fogNear: { value: 15.0 }, // 迷雾开始的距离
            fogFar: { value: 20.0 }, // 迷雾完全遮挡的距离
          },
          vertexShader,
          fragmentShader,
        });
        
        child.material = material;
        child.userData.bloom = true; // 标记为发光物体
        materialsRef.current.push(material);
      }
    });
    
    return cloned;
  }, [scene]);

  return (
    <group ref={group}>
      <primitive 
        object={clonedScene} 
      />
    </group>
  );
}



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

function CameraRig({ scrollProgress, debugControls = false }) {
  const { camera } = useThree();
  const startPos = useMemo(() => new THREE.Vector3(-5, 1, 8), []); 
  const midPos = useMemo(() => new THREE.Vector3(20, 4, 0), []); // 50%时的位置
  const endPos = useMemo(() => new THREE.Vector3(30, 1, -10), []); // 100%时的位置
  const startLookAt = useMemo(() => new THREE.Vector3(0, 0, -1), []);
  const midLookAt = useMemo(() => new THREE.Vector3(30, 4, 0), []); // 50%时看向的位置
  const endLookAt = useMemo(() => new THREE.Vector3(40, 1, 10), []); // 100%时看向的位置
  const currentLookAt = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (debugControls) return; // 调试时让 OrbitControls 接管相机
    const p = scrollProgress;
    
    if (p <= 0.25) {
      // 第一阶段：0% -> 25%
      const t = p * 4; // 将0-0.25映射到0-1
      camera.position.lerpVectors(startPos, midPos, t);
      currentLookAt.lerpVectors(startLookAt, midLookAt, t);
    } else if (p <= 0.5) {
      // 第二阶段：25% -> 50% 保持不动
      camera.position.copy(midPos);
      currentLookAt.copy(midLookAt);
    } else {
      // 第三阶段：50% -> 100%
      const t = (p - 0.5) / 0.5; // 将0.5-1映射到0-1
      camera.position.lerpVectors(midPos, endPos, t);
      currentLookAt.lerpVectors(midLookAt, endLookAt, t);
    }
    
    camera.lookAt(currentLookAt);
  });
  return null;
}

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

// AI准确性图表组件
function AIAccuracyChart() {
  const chartRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    const currentElement = chartRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, []);

  // 图表数据
  const dataPoints = [
    { x: 0.15, y: 3.5, label: null },
    { x: 0.35, y: 8.5, label: null },
    { x: 0.55, y: 6.5, label: "Chat GPT" },
    { x: 0.75, y: 13.5, label: "Chat GPT" },
    { x: 0.85, y: 5.5, label: null },
    { x: 0.87, y: 15.5, label: null },
    { x: 0.95, y: 9, label: null },
    { x: 0.98, y: 17.5, label: null },
  ];

  // 时间标签
  const timeLabels = [
    "May, 24", "Jul, 24", "Sep, 24", "Nov, 24", 
    "Jan, 25", "Mar, 25", "May, 25"
  ];

  // 准确度标签
  const accuracyLabels = [
    "0.0", "2.5", "5.0", "7.5", "10.0", 
    "12.5", "15.0", "17.5", "20.0"
  ];

  const chartWidth = 1000;
  const chartHeight = 500;
  const margin = { top: 60, right: 80, bottom: 80, left: 80 };

  return (
    <div ref={chartRef} className="w-full">
      {/* 标题 */}
      <div className="mb-8">
        <h3 className="text-white text-sm opacity-80 mb-2">
          AI's Accuracy on Humanity's Last Exam
        </h3>
        <h2 
          className="text-white font-light text-2xl"
          style={{ fontSize: "clamp(24px, 4vw, 32px)" }}
        >
          And AI performance has improved exponentially.
        </h2>
      </div>

      {/* SVG图表 */}
      <div 
        className="w-full rounded-lg overflow-hidden" 
        style={{ 
          aspectRatio: '2/1',
          background: 'rgba(6, 7, 11, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          style={{ background: 'transparent' }}
        >
          {/* 定义发光效果 */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="pointGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* 网格线 */}
          {accuracyLabels.map((_, i) => {
            const y = margin.top + (i * (chartHeight - margin.top - margin.bottom) / 8);
            return (
              <line
                key={`grid-y-${i}`}
                x1={margin.left}
                y1={y}
                x2={chartWidth - margin.right}
                y2={y}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            );
          })}

          {/* X轴 */}
          <line
            x1={margin.left}
            y1={chartHeight - margin.bottom}
            x2={chartWidth - margin.right}
            y2={chartHeight - margin.bottom}
            stroke="white"
            strokeWidth="1"
          />

          {/* Y轴 */}
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={chartHeight - margin.bottom}
            stroke="white"
            strokeWidth="1"
          />

          {/* X轴标签 */}
          {timeLabels.map((label, i) => {
            const x = margin.left + (i * (chartWidth - margin.left - margin.right) / 6);
            return (
              <text
                key={`x-label-${i}`}
                x={x}
                y={chartHeight - margin.bottom + 25}
                fill="white"
                fontSize="12"
                textAnchor="middle"
                className="opacity-80"
              >
                {label}
              </text>
            );
          })}

          {/* Y轴标签 */}
          {accuracyLabels.map((label, i) => {
            const y = chartHeight - margin.bottom - (i * (chartHeight - margin.top - margin.bottom) / 8);
            return (
              <g key={`y-label-${i}`}>
                <text
                  x={margin.left - 15}
                  y={y + 4}
                  fill="white"
                  fontSize="12"
                  textAnchor="end"
                  className="opacity-80"
                >
                  {label}
                </text>
                {/* Y轴标题 */}
                {i === 4 && (
                  <text
                    x={15}
                    y={chartHeight / 2}
                    fill="white"
                    fontSize="12"
                    textAnchor="middle"
                    className="opacity-80"
                    transform={`rotate(-90, 15, ${chartHeight / 2})`}
                  >
                    Accuracy (%)
                  </text>
                )}
              </g>
            );
          })}

          {/* 趋势线 */}
          <path
            d={`M ${margin.left + dataPoints[0].x * (chartWidth - margin.left - margin.right)} ${
              chartHeight - margin.bottom - (dataPoints[0].y / 20) * (chartHeight - margin.top - margin.bottom)
            } Q ${margin.left + dataPoints[3].x * (chartWidth - margin.left - margin.right)} ${
              chartHeight - margin.bottom - (dataPoints[3].y / 20) * (chartHeight - margin.top - margin.bottom)
            } ${margin.left + dataPoints[7].x * (chartWidth - margin.left - margin.right)} ${
              chartHeight - margin.bottom - (dataPoints[7].y / 20) * (chartHeight - margin.top - margin.bottom)
            }`}
            fill="none"
            stroke="white"
            strokeWidth="3"
            filter="url(#glow)"
            className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{
              strokeDasharray: isVisible ? 'none' : '1000',
              strokeDashoffset: isVisible ? '0' : '1000',
              transition: 'stroke-dashoffset 2s ease-out, opacity 0.5s ease-out'
            }}
          />

          {/* 数据点 */}
          {dataPoints.map((point, i) => {
            const x = margin.left + point.x * (chartWidth - margin.left - margin.right);
            const y = chartHeight - margin.bottom - (point.y / 20) * (chartHeight - margin.top - margin.bottom);
            
            return (
              <g key={`point-${i}`}>
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill="white"
                  filter="url(#pointGlow)"
                  className={`transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                />
                
                {/* 标签 */}
                {point.label && (
                  <text
                    x={x}
                    y={y - 15}
                    fill="white"
                    fontSize="10"
                    textAnchor="middle"
                    className={`opacity-90 transition-all duration-500 ${isVisible ? 'opacity-90' : 'opacity-0'}`}
                    style={{ transitionDelay: `${i * 100 + 300}ms` }}
                  >
                    {point.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}


export default function ChapterOnePage() {
  const scrollContainerRef = useRef(null);
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);
  
  // 使用React state存储滚动进度（声明式方式）
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // 计算neon材质进度
  const neonProgress = useMemo(() => {
    const scrollFactor = Math.min(scrollProgress * 2, 1);
    return 0.3 + scrollFactor * 0.65; // 0.3 -> 0.95
  }, [scrollProgress]);

  useEffect(() => {
    // 创建一个可被GSAP动画化的对象
    const scrollData = { progress: 0 };
    
    // 存储动画触发状态
    let s1Triggered = false;
    let s2FadeInTriggered = false;
    let s2FadeOutTriggered = false;
    let s3Triggered = false;
    
    const ctx = gsap.context(() => {
      const container = scrollContainerRef.current;
      
      // ===== 创建所有动画时间轴 =====
      
      // Section 1: 标题淡出
      gsap.set(section1Ref.current, { opacity: 1 });
      const s1FadeOut = gsap.timeline({ paused: true })
        .to(section1Ref.current, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut"
        });
      
      // Section 2: 文字淡入淡出
      gsap.set(section2Ref.current, { opacity: 0 });
      const s2FadeIn = gsap.timeline({ paused: true })
        .to(section2Ref.current, {
          opacity: 1,
          duration: 0.5,
          ease: "power2.inOut"
        });
      const s2FadeOut = gsap.timeline({ paused: true })
        .to(section2Ref.current, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut"
        });
      
      // Section 3: 图表淡入
      gsap.set(section3Ref.current, { opacity: 0 });
      const s3FadeIn = gsap.timeline({ paused: true })
        .to(section3Ref.current, {
          opacity: 1,
          duration: 0.5,
          ease: "power2.inOut"
        });
      
      // ===== 主timeline：用scrub控制progress，用.call()触发HTML动画 =====
      const mainTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "bottom bottom",
          scrub: 2, // 2秒阻尼
        }
      });
      
      // 动画一个dummy对象，让timeline有内容（受scrub控制）
      const dummy = { value: 0 };
      let lastProgress = 0;
      
      mainTimeline.to(dummy, {
        value: 1,
        duration: 1,
        ease: "none",
        onUpdate: function() {
          // 每帧更新progress（受scrub影响，有延迟）
          const p = this.progress();
          scrollData.progress = p;
          setScrollProgress(p);
          
          // 检测滚动方向
          const isReversing = p < lastProgress;
          
          // === 基于区间的状态管理（更可靠） ===
          
          // Section 1 应该可见的区间：0-20%
          if (p < 0.20) {
            // 应该可见
            if (s1Triggered) {
              s1Triggered = false;
              s1FadeOut.reverse();
            }
          }
          
          // Section 2 应该可见的区间：28%-45%
          if (p >= 0.28 && p < 0.45) {
            // 应该可见
            if (s2FadeOutTriggered) {
              // 如果之前淡出了，重新淡入
              s2FadeOutTriggered = false;
              s2FadeInTriggered = true;
              s2FadeOut.pause();
              s2FadeIn.restart();
            } else if (!s2FadeInTriggered) {
              // 如果还没淡入过，触发淡入
              s2FadeInTriggered = true;
              s2FadeIn.restart();
            }
          } else if (p < 0.28) {
            // 在28%以下，应该隐藏
            if (s2FadeInTriggered) {
              s2FadeInTriggered = false;
              s2FadeIn.reverse();
            }
          } else if (p >= 0.45) {
            // 在45%以上，应该淡出
            if (s2FadeInTriggered && !s2FadeOutTriggered) {
              s2FadeOutTriggered = true;
              s2FadeInTriggered = false;
              s2FadeIn.pause();
              s2FadeOut.restart();
            }
          }
          
          // Section 3 应该可见的区间：53%-100%
          if (p < 0.53) {
            // 应该隐藏
            if (s3Triggered) {
              s3Triggered = false;
              s3FadeIn.reverse();
            }
          }
          
          lastProgress = p;
        }
      });
      
      // 在timeline的特定位置触发HTML动画（位置受scrub控制，但动画独立播放）
      mainTimeline.call(() => {
        if (!s1Triggered) {
          s1Triggered = true;
          s1FadeOut.play();
        }
      }, null, 0.20);
      
      mainTimeline.call(() => {
        if (!s2FadeInTriggered) {
          s2FadeInTriggered = true;
          s2FadeOutTriggered = false;
          s2FadeIn.play();
        }
      }, null, 0.28);
      
      mainTimeline.call(() => {
        if (!s2FadeOutTriggered) {
          s2FadeOutTriggered = true;
          s2FadeInTriggered = false;
          s2FadeOut.play();
        }
      }, null, 0.45);
      
      mainTimeline.call(() => {
        if (!s3Triggered) {
          s3Triggered = true;
          s3FadeIn.play();
        }
      }, null, 0.53);

    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* 渐变背景 */}
      <div 
        className="fixed inset-0 w-screen h-screen pointer-events-none"
        style={{
          backgroundImage: 'url(/images/gradient.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0
        }}
      />

      {/* 3D Canvas - 固定背景层 */}
      <div 
        className="fixed inset-0 w-screen h-screen" 
        style={{ 
          zIndex: 1,
          transform: 'translateZ(0)', // 强制创建合成层
          willChange: 'transform' // 优化渲染
        }}
      >
        <Canvas
          gl={{ 
            antialias: true, 
            toneMapping: THREE.ACESFilmicToneMapping, 
            alpha: true,
            preserveDrawingBuffer: true // 保留绘制缓冲，让backdrop-filter可以访问
          }}
          camera={{ fov: 50, near: 0.1, far: 100 }}
          dpr={[1, 1.5]}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.25} />
          <directionalLight position={[2, 3, 5]} intensity={0.6} />
          
          {/* 通过props传递进度（声明式） */}
          <CameraRig scrollProgress={scrollProgress} debugControls={false} />
          <ModelLoader scrollProgress={neonProgress} />
          <GalleryTunnel scrollProgress={scrollProgress} />

          {/* 后处理效果 */}
          <EffectComposer>
            <Bloom 
              intensity={0.5} 
              luminanceThreshold={0.1} 
              mipmapBlur 
              luminanceSmoothing={0.9}
              radius={0.2}
            />
          </EffectComposer>
        </Canvas>
      </div>

      {/* 滚动容器 - 创建滚动高度 */}
      <div ref={scrollContainerRef} className="relative w-screen pointer-events-none" style={{ height: '1000vh', zIndex: 10 }}>
        {/* Section 1: 标题 */}
        <section 
          ref={section1Ref}
          className="fixed top-0 left-0 w-screen h-screen flex items-start text-white pointer-events-none"
          style={{ paddingLeft: '24px', paddingTop: '64px', opacity: 1, zIndex: 10 }}
        >
          <div className="max-w-[800px]">
            <p className="text-sm opacity-80 mb-2">Chapter I · The Introduction</p>
            <h1 className="text-white font-light leading-[0.95] tracking-[-0.05em]"
                style={{
                  fontSize: "clamp(32px, 6vw, 120px)",
                  textShadow: "0 0 20px rgba(80,200,255,.35)",
                }}>
              Will you shape the future of AI,
              <br />
              <br />
              <span className="opacity-80">or will it shape you?</span>
            </h1>
          </div>
        </section>

        {/* Section 2: 第二段文字 */}
        <section 
          ref={section2Ref}
          className="fixed top-0 left-0 w-screen h-screen flex items-start text-white pointer-events-none"
          style={{ paddingLeft: '24px', paddingTop: '64px', opacity: 0, zIndex: 10 }}
        >
          <div className="max-w-[1100px]">
            <h2 className="font-light opacity-90 mb-6 tracking-[-0.05em]"
                style={{ fontSize: "clamp(20px, 3vw, 64px)" }}>
              In recent years, we have seen major improvements in AI across image and video creation capabilities.
            </h2>
          </div>
        </section>

        {/* Section 3: 图表 */}
        <section 
          ref={section3Ref}
          className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center text-white pointer-events-none"
          style={{ 
            padding: '64px 24px', 
            opacity: 0, 
            zIndex: 10,
            isolation: 'isolate' // 确保backdrop-filter工作
          }}
        >
          <div className="w-full max-w-[1200px] pointer-events-auto">
            <AIAccuracyChart />
          </div>
        </section>
      </div>

      {/* 固定的滚动提示 */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-xs opacity-70 pointer-events-none text-white" style={{ zIndex: 50 }}>
        Scroll ↓
      </div>

      {/* Debug: 显示滚动进度 */}
      <div className="fixed top-4 right-4 text-white text-xs pointer-events-none" style={{ zIndex: 50, fontFamily: 'monospace' }}>
        <div className="bg-black bg-opacity-50 p-3 rounded">
          <div>Scroll Progress: {(scrollProgress * 100).toFixed(1)}%</div>
          <div>Neon Progress: {(neonProgress * 100).toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
}

