"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

const COLORS = {
  constraint: "#C37EB3",
  growth: "#2BB856",
  transform: "#198CE6",
  collapse: "#FF4136",
};

const SOUND_EFFECTS = {
  constraint: "/sounds/constraint.mp3",
  growth: "/sounds/growth.mp3",
  transform: "/sounds/transform.mp3",
  collapse: "/sounds/collapse.mp3",
};

function sphericalToCartesian(radius, theta, phi) {
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

// Generate points on a spherical cap (circular patch): patch center along centerDirection, half-angle = halfAngleRad
function generatePointsOnSurfacePatch(count, centerDirection, surfaceRadius, halfAngleRad, seed, radialJitter = 0.18) {
  const axis = centerDirection.clone().normalize();
  const prng = mulberry32(seed);
  // Build an orthonormal basis for axis
  const tmp = Math.abs(axis.y) < 0.99 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const tangent = new THREE.Vector3().crossVectors(tmp, axis).normalize();
  const bitangent = new THREE.Vector3().crossVectors(axis, tangent).normalize();
  const cosMax = Math.cos(halfAngleRad);
  const points = [];
  for (let i = 0; i < count; i++) {
    const u1 = prng();
    const u2 = prng();
    // Uniform over spherical cap: cosTheta is uniform in [cosMax, 1]
    const cosTheta = cosMax + (1 - cosMax) * u1;
    const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
    const phi = 2 * Math.PI * u2;
    // Direction = axis * cosθ + (tangent * cosφ + bitangent * sinφ) * sinθ
    const dir = axis.clone().multiplyScalar(cosTheta)
      .add(tangent.clone().multiplyScalar(Math.cos(phi) * sinTheta))
      .add(bitangent.clone().multiplyScalar(Math.sin(phi) * sinTheta));
    // Radius jitter within [radius - radialJitter, radius + radialJitter]
    const jitter = (prng() * 2 - 1) * radialJitter;
    const r = Math.max(0.01, surfaceRadius + jitter);
    points.push(dir.setLength(r));
  }
  return points;
}

// 生成：遍布整个球面的随机点（用于氛围装饰）
function generatePointsOnFullSphere(count, radius, seed) {
  const prng = mulberry32(seed);
  const points = [];
  for (let i = 0; i < count; i++) {
    // 球面上均匀分布：使用正态分布方法
    const u1 = prng();
    const u2 = prng();
    const theta = 2 * Math.PI * u1; // 方位角
    const cosPhi = 2 * u2 - 1; // z 的归一化坐标
    const sinPhi = Math.sqrt(1 - cosPhi * cosPhi);
    const x = radius * sinPhi * Math.cos(theta);
    const y = radius * sinPhi * Math.sin(theta);
    const z = radius * cosPhi;
    points.push(new THREE.Vector3(x, y, z));
  }
  return points;
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function PointsLayer({ positions, color }) {
  const ref = useRef();
  const colorVec = useMemo(() => new THREE.Color(color), [color]);

  // 构建实例矩阵
  useEffect(() => {
    if (!ref.current) return;
    const inst = ref.current;
    const dummy = new THREE.Object3D();
    const count = positions.length;
    inst.count = count;
    for (let i = 0; i < count; i++) {
      const p = positions[i];
      dummy.position.copy(p);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
  }, [positions]);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      ref.current.material.emissiveIntensity = 0.6 + Math.sin(t * 2.5) * 0.2;
    }
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, Math.max(positions.length, 1)]}>
      <sphereGeometry args={[0.012, 8, 8]} />
      <meshBasicMaterial color={colorVec} />
    </instancedMesh>
  );
}

// 氛围装饰点层（更小的点，更暗的颜色）
function AmbientPointsLayer({ positions, color, opacity = 0.50 }) {
  const ref = useRef();
  const colorVec = useMemo(() => new THREE.Color(color), [color]);

  // 构建实例矩阵
  useEffect(() => {
    if (!ref.current) return;
    const inst = ref.current;
    const dummy = new THREE.Object3D();
    const count = positions.length;
    inst.count = count;
    for (let i = 0; i < count; i++) {
      const p = positions[i];
      dummy.position.copy(p);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
  }, [positions]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, Math.max(positions.length, 1)]}>
      <sphereGeometry args={[0.005, 6, 6]} />
      <meshBasicMaterial color={colorVec} transparent opacity={opacity} />
    </instancedMesh>
  );
}

function LinesLayer({ positions, color, opacity = 0.18, segments = 11, bend = 0.22, seed = 999, lineWidth = 2.0 }) {
  const lineRef = useRef();
  const { size } = useThree();

  // 重建 position buffer：将每条 startPoint→p 细分为“有机”曲线（二次贝塞尔采样）
  // LineGeometry 需要连续的顶点数组
  useEffect(() => {
    const line = lineRef.current;
    if (!line) return;
    const count = positions.length;
    if (count === 0 || segments <= 0 || !Number.isFinite(segments)) {
      line.visible = false;
      return;
    }
    const prng = mulberry32(seed);
    // 起始点
    const startPoint = new THREE.Vector3(0, 0, 0);
    // LineGeometry 需要连续的顶点（每条曲线 segments+1 个点）
    const totalVertices = count * (segments + 1) * 3;
    if (totalVertices <= 0 || !Number.isFinite(totalVertices)) {
      line.visible = false;
      return;
    }
    const arr = new Float32Array(totalVertices);
    let cursor = 0;
    for (let i = 0; i < count; i++) {
      const p = positions[i];
      // 控制点：从 startPoint 到 p 的中点 + 稍许随机侧向偏移
      const mid = new THREE.Vector3().addVectors(startPoint, p).multiplyScalar(0.5);
      // 生成稳定的随机方向（使用 prng）
      const rx = prng() * 2 - 1;
      const ry = prng() * 2 - 1;
      const rz = prng() * 2 - 1;
      const randDir = new THREE.Vector3(rx, ry, rz).normalize();
      const c = mid.clone().add(randDir.multiplyScalar(startPoint.distanceTo(p) * bend));

      // 采样二次贝塞尔：连续顶点序列 (二次贝塞尔: P(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2)
      for (let s = 0; s <= segments; s++) {
        const t = s / segments;
        const one = 1 - t;
        const qx = one * one * startPoint.x + 2 * one * t * c.x + t * t * p.x;
        const qy = one * one * startPoint.y + 2 * one * t * c.y + t * t * p.y;
        const qz = one * one * startPoint.z + 2 * one * t * c.z + t * t * p.z;
        arr[cursor++] = qx; arr[cursor++] = qy; arr[cursor++] = qz;
      }
    }
    // 重建几何以避免缓存问题
    line.geometry.dispose?.();
    line.geometry = new LineGeometry();
    line.geometry.setPositions(arr);
    line.computeLineDistances();
    line.visible = true;
    // 同步材质 & 可见性
    if (line.material) {
      line.material.depthTest = true;
      line.material.depthWrite = false;
      line.material.transparent = true;
      line.material.resolution.set(size.width, size.height);
    }
    line.frustumCulled = false;
  }, [positions, segments, bend, seed, size]);

  const colorVec = useMemo(() => new THREE.Color(color), [color]);

  const lineObj = useMemo(() => {
    const geom = new LineGeometry();
    const mat = new LineMaterial({
      color: colorVec.getHex(),
      linewidth: lineWidth,
      transparent: true,
      opacity: opacity,
      depthWrite: false,
      resolution: new THREE.Vector2(size.width, size.height),
    });
    mat.blending = THREE.AdditiveBlending;
    return new Line2(geom, mat);
  }, [colorVec, lineWidth, opacity, size.width, size.height]);

  // 当材质属性变化时更新
  useEffect(() => {
    if (lineObj && lineObj.material) {
      lineObj.material.color.setHex(colorVec.getHex());
      lineObj.material.linewidth = lineWidth;
      lineObj.material.opacity = opacity;
      lineObj.material.resolution.set(size.width, size.height);
    }
  }, [lineObj, colorVec, lineWidth, opacity, size]);

  return <primitive ref={lineRef} object={lineObj} />;
}

function Globe({ counts, soundEnabled }) {
  const groupRef = useRef();
  const prevCountsRef = useRef({ constraint: 0, growth: 0, transform: 0, collapse: 0 });
  const highlightsRef = useRef([]); // { position: Vector3, color: string, bornAt: number, category: string }
  const [badgeEnabled, setBadgeEnabled] = useState(false); // Badge 启用标志（延迟 2 秒）
  const [soundEnabledState, setSoundEnabledState] = useState(false); // 音效启用状态
  const lastSoundTimeRef = useRef({ constraint: 0, growth: 0, transform: 0, collapse: 0 }); // 防止同时播放太多同类型音效
  
  // 微妙的空间感动画：X/Y/Z 浮动 + 轻微缩放
  const timeRef = useRef(0);
  useFrame((state, delta) => {
    if (groupRef.current) {
      timeRef.current += delta;
      const t = timeRef.current;
      groupRef.current.position.x = -2 + Math.sin(t * 0.6) * 0.02;
      groupRef.current.position.y = -0.1 + Math.sin(t * 0.5) * 0.05;
      groupRef.current.position.z = Math.sin(t * 0.4 + 1.5) * 0.02;
      const scale = 1 + Math.sin(t * 0.6 + 1) * 0.01;
      groupRef.current.scale.set(scale, scale, scale);
    }
  });

  // 点数上限：防爆显卡；每类最多 2000 个点
  const maxPerCategory = 2000;
  // 连线起点（即新球体的中心）
  const lineStartPoint = new THREE.Vector3(0, 0, 0);
  
  // 固定参数值（之前从 Leva 控制面板获取）
  const constraintRadius = 3.0;
  const constraintCenterX = 2.0;
  const constraintCenterY = 1.0;
  const constraintCenterZ = 1.5;
  const constraintHalfAngle = 0.25;
  
  const growthRadius = 2.5;
  const growthCenterX = 2.0;
  const growthCenterY = 0.6;
  const growthCenterZ = 2.0;
  const growthHalfAngle = 0.25;
  
  const transformRadius = 3.5;
  const transformCenterX = 2.0;
  const transformCenterY = -0.2;
  const transformCenterZ = 1.5;
  const transformHalfAngle = 0.25;
  
  const collapseRadius = 2.5;
  const collapseCenterX = 2.0;
  const collapseCenterY = -1.0;
  const collapseCenterZ = 2.0;
  const collapseHalfAngle = 0.25;

  const positions = useMemo(() => {
    // 四个贴片中心方向（从 leva 控制）
    const centers = {
      constraint: new THREE.Vector3(constraintCenterX, constraintCenterY, constraintCenterZ).normalize(),
      growth:     new THREE.Vector3(growthCenterX, growthCenterY, growthCenterZ).normalize(),
      transform:  new THREE.Vector3(transformCenterX, transformCenterY, transformCenterZ).normalize(),
      collapse:   new THREE.Vector3(collapseCenterX, collapseCenterY, collapseCenterZ).normalize()
    };

    // 根据数量动态调整贴片半径（半角）
    const ns = {
      constraint: Math.min(maxPerCategory, Math.max(0, Math.floor(counts.constraint || 0))),
      growth: Math.min(maxPerCategory, Math.max(0, Math.floor(counts.growth || 0))),
      transform: Math.min(maxPerCategory, Math.max(0, Math.floor(counts.transform || 0))),
      collapse: Math.min(maxPerCategory, Math.max(0, Math.floor(counts.collapse || 0)))
    };
    const maxN = Math.max(1, ns.constraint, ns.growth, ns.transform, ns.collapse);
    const halfAngleMin = 0.3; // ≈17°
    const halfAngleMax = 0.7; // ≈40°

    const out = {};
    const radii = [constraintRadius, growthRadius, transformRadius, collapseRadius];
    const halfAngles = [constraintHalfAngle, growthHalfAngle, transformHalfAngle, collapseHalfAngle];
    (Object.keys(ns)).forEach((key, i) => {
      const n = ns[key];
      const t = n / maxN;
      // 使用 leva 控制的半径和半角
      const radius = radii[i];
      const userHalfAngle = halfAngles[i];
      // 生成相对于原点的点
      const relativePoints = generatePointsOnSurfacePatch(n, centers[key], radius, userHalfAngle, 4242 + i, 0.2);
      // 转换为相对于 lineStartPoint 的点（偏移到新位置）
      out[key] = relativePoints.map(p => p.clone().add(lineStartPoint));
    });
    return out;
  }, [counts, constraintRadius, constraintCenterX, constraintCenterY, constraintCenterZ, constraintHalfAngle,
      growthRadius, growthCenterX, growthCenterY, growthCenterZ, growthHalfAngle,
      transformRadius, transformCenterX, transformCenterY, transformCenterZ, transformHalfAngle,
      collapseRadius, collapseCenterX, collapseCenterY, collapseCenterZ, collapseHalfAngle]);

  // 生成四个球体的氛围装饰点（遍布球面）
  const ambientPoints = useMemo(() => {
    const out = {};
    const radii = [constraintRadius, growthRadius, transformRadius, collapseRadius];
    const keys = ['constraint', 'growth', 'transform', 'collapse'];
    keys.forEach((key, i) => {
      // 每个球生成约 500 个氛围点
      const points = generatePointsOnFullSphere(500, radii[i], 10000 + i);
      // 同样偏移到 lineStartPoint 位置
      out[key] = points.map(p => p.clone().add(lineStartPoint));
    });
    return out;
  }, [constraintRadius, growthRadius, transformRadius, collapseRadius]);

  // 首次数据加载后，延迟 5 秒启用 badge
  useEffect(() => {
    const total = counts.constraint + counts.growth + counts.transform + counts.collapse;
    // 检测首次数据加载（从 0 变为有值）
    if (total > 0 && !badgeEnabled) {
      const timer = setTimeout(() => {
        setBadgeEnabled(true);
      }, 5000); // 延迟 5 秒
      return () => clearTimeout(timer);
    }
  }, [counts, badgeEnabled]);

  // 音效启用状态同步
  useEffect(() => {
    setSoundEnabledState(soundEnabled);
  }, [soundEnabled]);

  // 捕捉新增的点，并加入高亮缓退列表
  useEffect(() => {
    // 确保 positions 已定义
    if (!positions || !Object.keys(positions).length) return;
    
    const keys = ["constraint", "growth", "transform", "collapse"];
    keys.forEach((k) => {
      const prev = prevCountsRef.current[k] || 0;
      const curr = Math.max(0, Math.floor(counts[k] || 0));
      if (curr > prev) {
        const newlyAdded = positions[k].slice(prev, curr);
        const now = performance.now();
        newlyAdded.forEach((pos) => {
          highlightsRef.current.push({ position: pos.clone(), color: COLORS[k], bornAt: now, category: k });
        });
        
        // 播放音效
        if (soundEnabledState) {
          const lastTime = lastSoundTimeRef.current[k] || 0;
          const timeSinceLastSound = now - lastTime;
          // 同一类别音效至少间隔 300ms，避免重复播放
          if (timeSinceLastSound > 300) {
            const audio = new Audio(SOUND_EFFECTS[k]);
            audio.volume = 0.3;
            audio.play().catch((e) => {
              console.debug("Audio playback failed:", e.message);
            });
            lastSoundTimeRef.current[k] = now;
          }
        }
      }
    });
    prevCountsRef.current = {
      constraint: Math.max(0, Math.floor(counts.constraint || 0)),
      growth: Math.max(0, Math.floor(counts.growth || 0)),
      transform: Math.max(0, Math.floor(counts.transform || 0)),
      collapse: Math.max(0, Math.floor(counts.collapse || 0)),
    };
  }, [counts, positions, soundEnabledState]);

  // 高亮层：短暂显示新点（2.5s 内渐隐、放大-收缩）+ HTML Badge（4s 后消失）
  function HighlightSparks() {
    const [version, setVersion] = useState(0);
    useFrame(() => {
      // 驱动重渲染以更新不透明度/缩放
      setVersion((v) => (v + 1) % 1000000);
      // 清理超时火花（2.5s）
      const ttl = 2500;
      const now = performance.now();
      highlightsRef.current = highlightsRef.current.filter((h) => now - h.bornAt < ttl);
    });

    const ttl = 2500;
    const now = performance.now();
    return (
      <group>
        {highlightsRef.current.map((h, i) => {
          const t = Math.min(1, Math.max(0, (now - h.bornAt) / ttl));
          const opacity = 1 - t; // 由 1 渐隐到 0
          const scale = 1.8 - 0.6 * t; // 初始更大，逐步回落
          // Badge 显示时间 4s，且需要 badge 已启用
          const badgeVisible = badgeEnabled && now - h.bornAt < 4000;
          return (
            <group key={i}>
              {/* 3D Spark 效果 */}
              <mesh position={h.position} scale={scale}>
                <sphereGeometry args={[0.028, 10, 10]} />
                <meshBasicMaterial color={h.color} transparent opacity={opacity} />
              </mesh>
              {/* HTML Badge - 在点上方 */}
              {badgeVisible && (
                <Html
                  position={[h.position.x, h.position.y + 0.15, h.position.z]}
                  center
                  distanceFactor={5}
                  zIndexRange={[100, 0]}
                >
                  <div
                    style={{
                      background: 'white',
                      color: 'black',
                      padding: '2px 12px 2px 8px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: h.color,
                      }}
                    />
                    New vote!
                  </div>
                </Html>
              )}
            </group>
          );
        })}
      </group>
    );
  }

  return (
    <group ref={groupRef} position={[-1.5, 0, 0]}>
      {/* 隐藏球壳：不再渲染 */}

      {/* 四个象限的点云层 */}
      <PointsLayer positions={positions.constraint} color={COLORS.constraint} />
      <PointsLayer positions={positions.growth} color={COLORS.growth} />
      <PointsLayer positions={positions.transform} color={COLORS.transform} />
      <PointsLayer positions={positions.collapse} color={COLORS.collapse} />

      {/* 氛围装饰点层（遍布整个球面） */}
      <AmbientPointsLayer positions={ambientPoints.constraint} color={COLORS.constraint} opacity={0.8} />
      <AmbientPointsLayer positions={ambientPoints.growth} color={COLORS.growth} opacity={0.8} />
      <AmbientPointsLayer positions={ambientPoints.transform} color={COLORS.transform} opacity={0.8} />
      <AmbientPointsLayer positions={ambientPoints.collapse} color={COLORS.collapse} opacity={0.8} />

      {/* 从球心连线（合并 LineSegments，按类分组上色） */}
      <LinesLayer key={`constraint-${positions.constraint.length}`} positions={positions.constraint} color={COLORS.constraint} opacity={0.08} />
      <LinesLayer key={`growth-${positions.growth.length}`} positions={positions.growth} color={COLORS.growth} opacity={0.05} />
      <LinesLayer key={`transform-${positions.transform.length}`} positions={positions.transform} color={COLORS.transform} opacity={0.05} />
      <LinesLayer key={`collapse-${positions.collapse.length}`} positions={positions.collapse} color={COLORS.collapse} opacity={0.05} />

      {/* 新增票的高亮火花层 */}
      <HighlightSparks />
    </group>
  );
}

export default function LiveVotesGlobe({ counts, soundEnabled }) {
  return (
    <div className="fixed inset-0 z-20 pointer-events-none" style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} style={{ pointerEvents: 'auto' }}>
        <Globe counts={counts} soundEnabled={soundEnabled} />
      </Canvas>

      {/* 右下角显示总数简报 */}
      <div className="absolute right-0 bottom-0 text-xs text-white/70 bg-black/40 px-2 py-1">
        C:{counts.constraint} G:{counts.growth} T:{counts.transform} L:{counts.collapse}
      </div>
    </div>
  );
}


