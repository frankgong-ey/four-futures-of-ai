"use client";

import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import * as THREE from "three";

// 3D模型组件
const FutureModel = ({ futureId, position, scale, color, isSelected, onSelect }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // 旋转动画
      meshRef.current.rotation.y += 0.01;
      
      // 悬浮效果
      if (hovered) {
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      onClick={onSelect}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color={color} 
        emissive={isSelected ? color : "#000000"}
        emissiveIntensity={isSelected ? 0.3 : 0}
      />
    </mesh>
  );
};

// 3D场景组件
const Scene = ({ currentView, selectedFuture, onFutureSelect }) => {
  const [models, setModels] = useState({
    constraint: { position: [-2, 0, 0], scale: [1, 1, 1], color: "#FF6B6B" },
    growth: { position: [0, 0, 0], scale: [1, 1, 1], color: "#4ECDC4" },
    transformation: { position: [2, 0, 0], scale: [1, 1, 1], color: "#45B7D1" },
    disruption: { position: [0, 2, 0], scale: [1, 1, 1], color: "#96CEB4" }
  });

  // 根据当前视图调整模型位置和缩放
  useEffect(() => {
    console.log('Scene: View changed to', currentView, 'selectedFuture:', selectedFuture);
    
    if (currentView === 'detail' && selectedFuture) {
      // 详情视图：选中的模型缩小到左下角
      console.log('Scene: Moving', selectedFuture, 'to detail position');
      setModels(prev => ({
        ...prev,
        [selectedFuture]: {
          ...prev[selectedFuture],
          position: [-3, -2, 0],
          scale: [0.3, 0.3, 0.3]
        }
      }));
    } else {
      // 概览视图：所有模型回到原始位置
      console.log('Scene: Resetting all models to overview positions');
      setModels({
        constraint: { position: [-2, 0, 0], scale: [1, 1, 1], color: "#FF6B6B" },
        growth: { position: [0, 0, 0], scale: [1, 1, 1], color: "#4ECDC4" },
        transformation: { position: [2, 0, 0], scale: [1, 1, 1], color: "#45B7D1" },
        disruption: { position: [0, 2, 0], scale: [1, 1, 1], color: "#96CEB4" }
      });
    }
  }, [currentView, selectedFuture]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      {Object.entries(models).map(([futureId, modelData]) => (
        <FutureModel
          key={futureId}
          futureId={futureId}
          position={modelData.position}
          scale={modelData.scale}
          color={modelData.color}
          isSelected={selectedFuture === futureId}
          onSelect={() => onFutureSelect(futureId)}
        />
      ))}
    </>
  );
};

// 全局3D Canvas组件
export default function Global3DCanvas() {
  const [currentView, setCurrentView] = useState('overview');
  const [selectedFuture, setSelectedFuture] = useState(null);
  const [shouldRender, setShouldRender] = useState(false);
  const router = useRouter();

  // 监听路由变化
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      console.log('Global3DCanvas: Route changed to', path);
      
      // 只在 /futures 相关页面显示3D Canvas
      if (path.startsWith('/futures')) {
        setShouldRender(true);
        if (path.startsWith('/futures/') && path !== '/futures') {
          // 详情页面
          const futureId = path.split('/').pop();
          console.log('Global3DCanvas: Detail view for', futureId);
          setCurrentView('detail');
          setSelectedFuture(futureId);
        } else if (path === '/futures') {
          // 概览页面
          console.log('Global3DCanvas: Overview view');
          setCurrentView('overview');
          setSelectedFuture(null);
        }
      } else {
        // 其他页面（如 /booth）不显示3D Canvas
        console.log('Global3DCanvas: Hiding canvas for', path);
        setShouldRender(false);
      }
    };

    // 初始检查
    handleRouteChange();
    
    // 监听浏览器前进后退
    window.addEventListener('popstate', handleRouteChange);
    
    // 监听 Next.js 路由变化
    const originalPush = router.push;
    const originalReplace = router.replace;
    
    router.push = (...args) => {
      originalPush.apply(router, args);
      setTimeout(handleRouteChange, 100); // 延迟执行确保路由已更新
    };
    
    router.replace = (...args) => {
      originalReplace.apply(router, args);
      setTimeout(handleRouteChange, 100);
    };
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      router.push = originalPush;
      router.replace = originalReplace;
    };
  }, [router]);

  const handleFutureSelect = (futureId) => {
    if (currentView === 'overview') {
      router.push(`/futures/${futureId}`);
    }
  };

  // 调试信息
  console.log('Global3DCanvas render:', { shouldRender, currentView, selectedFuture });

  // 只在需要时渲染3D Canvas
  if (!shouldRender) {
    console.log('Global3DCanvas: Not rendering (shouldRender=false)');
    return null;
  }

  console.log('Global3DCanvas: Rendering 3D Canvas');
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Scene 
          currentView={currentView}
          selectedFuture={selectedFuture}
          onFutureSelect={handleFutureSelect}
        />
      </Canvas>
    </div>
  );
}
