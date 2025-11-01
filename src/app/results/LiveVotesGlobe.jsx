"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

const SUPABASE_URL = "https://rmgvfgjsqswwumheewho.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtZ3ZmZ2pzcXN3d3VtaGVld2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTk2NzYsImV4cCI6MjA3MDI3NTY3Nn0.xm2Tn9fgBDvoM4zSuc4naQHBCoQaAxvRbUyht_LBLFs";

const COLORS = {
  constraint: "#C37EB3",
  growth: "#2BB856",
  transform: "#198CE6",
  collapse: "#FF4136",
};

function fetchVoteCounts(signal) {
  const url = `${SUPABASE_URL}/rest/v1/vote_counts?select=*`;
  return fetch(url, {
    method: "GET",
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${SUPABASE_ANON}`,
      Accept: "application/json",
    },
    signal,
  }).then((r) => r.json());
}

function useLiveCounts({ pollMs = 5000 }) {
  const [counts, setCounts] = useState({ constraint: 0, growth: 0, transform: 0, collapse: 0 });

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        const rows = await fetchVoteCounts(controller.signal);
        if (!mounted || !Array.isArray(rows)) return;
        const next = { constraint: 0, growth: 0, transform: 0, collapse: 0 };
        for (const r of rows) {
          const key = (r.choice || "").toLowerCase();
          if (key in next) next[key] += Number(r.total || 0);
        }
        setCounts(next);
      } catch (e) {
        // ignore
      }
    };

    load();
    const id = setInterval(load, pollMs);
    return () => {
      mounted = false;
      controller.abort();
      clearInterval(id);
    };
  }, [pollMs]);

  return counts;
}

function sphericalToCartesian(radius, theta, phi) {
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

// 生成：球面贴片（圆形区域）上的点，贴片圆心沿 centerDirection，半角为 halfAngleRad
function generatePointsOnSurfacePatch(count, centerDirection, surfaceRadius, halfAngleRad, seed, radialJitter = 0.18) {
  const axis = centerDirection.clone().normalize();
  const prng = mulberry32(seed);
  // 为 axis 构建正交基
  const tmp = Math.abs(axis.y) < 0.99 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const tangent = new THREE.Vector3().crossVectors(tmp, axis).normalize();
  const bitangent = new THREE.Vector3().crossVectors(axis, tangent).normalize();
  const cosMax = Math.cos(halfAngleRad);
  const points = [];
  for (let i = 0; i < count; i++) {
    const u1 = prng();
    const u2 = prng();
    // 在球冠内均匀：cosTheta 均匀于 [cosMax, 1]
    const cosTheta = cosMax + (1 - cosMax) * u1;
    const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
    const phi = 2 * Math.PI * u2;
    // 方向 = axis * cosθ + (tangent * cosφ + bitangent * sinφ) * sinθ
    const dir = axis.clone().multiplyScalar(cosTheta)
      .add(tangent.clone().multiplyScalar(Math.cos(phi) * sinTheta))
      .add(bitangent.clone().multiplyScalar(Math.sin(phi) * sinTheta));
    // 半径随机抖动：在 [radius - radialJitter, radius + radialJitter]
    const jitter = (prng() * 2 - 1) * radialJitter;
    const r = Math.max(0.01, surfaceRadius + jitter);
    points.push(dir.setLength(r));
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
      <sphereGeometry args={[0.01, 8, 8]} />
      <meshBasicMaterial color={colorVec} />
    </instancedMesh>
  );
}

function LinesLayer({ positions, color, opacity = 0.18, segments = 11, bend = 0.22, seed = 999, lineWidth = 2.0 }) {
  const lineRef = useRef();
  const { size } = useThree();

  // 重建 position buffer：将每条 [0,0,0]→p 细分为“有机”曲线（二次贝塞尔采样）
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
      // 控制点：到 p 的中点 + 稍许随机侧向偏移
      const mid = p.clone().multiplyScalar(0.5);
      // 生成稳定的随机方向（使用 prng）
      const rx = prng() * 2 - 1;
      const ry = prng() * 2 - 1;
      const rz = prng() * 2 - 1;
      const randDir = new THREE.Vector3(rx, ry, rz).normalize();
      const c = mid.add(randDir.multiplyScalar(p.length() * bend));

      // 采样二次贝塞尔：连续顶点序列
      for (let s = 0; s <= segments; s++) {
        const t = s / segments;
        const one = 1 - t;
        const qx = 2 * one * t * c.x + t * t * p.x;
        const qy = 2 * one * t * c.y + t * t * p.y;
        const qz = 2 * one * t * c.z + t * t * p.z;
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

function Globe({ counts }) {
  const groupRef = useRef();
  const prevCountsRef = useRef({ constraint: 0, growth: 0, transform: 0, collapse: 0 });
  const highlightsRef = useRef([]); // { position: Vector3, color: string, bornAt: number }
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += 0.15 * delta;
  });

  // 点数上限：防爆显卡；每类最多 2000 个点
  const maxPerCategory = 2000;
  const radius = 1.2;

  const positions = useMemo(() => {
    // 四个贴片中心方向（不在同一纬度）
    const centers = {
      constraint: new THREE.Vector3(1, 0.25, 0).normalize(),   // 右上
      growth:     new THREE.Vector3(0, -0.15, 1).normalize(),  // 前下
      transform:  new THREE.Vector3(-1, 0.35, 0).normalize(),  // 左上
      collapse:   new THREE.Vector3(0, -0.3, -1).normalize()   // 后下
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
    (Object.keys(ns)).forEach((key, i) => {
      const n = ns[key];
      const t = n / maxN;
      const halfAngle = halfAngleMin + (halfAngleMax - halfAngleMin) * t;
      out[key] = generatePointsOnSurfacePatch(n, centers[key], radius, halfAngle, 4242 + i, 0.2);
    });
    return out;
  }, [counts]);

  // 捕捉新增的点，并加入高亮缓退列表
  useEffect(() => {
    const keys = ["constraint", "growth", "transform", "collapse"];
    keys.forEach((k) => {
      const prev = prevCountsRef.current[k] || 0;
      const curr = Math.max(0, Math.floor(counts[k] || 0));
      if (curr > prev) {
        const newlyAdded = positions[k].slice(prev, curr);
        const now = performance.now();
        newlyAdded.forEach((pos) => {
          highlightsRef.current.push({ position: pos.clone(), color: COLORS[k], bornAt: now });
        });
      }
    });
    prevCountsRef.current = {
      constraint: Math.max(0, Math.floor(counts.constraint || 0)),
      growth: Math.max(0, Math.floor(counts.growth || 0)),
      transform: Math.max(0, Math.floor(counts.transform || 0)),
      collapse: Math.max(0, Math.floor(counts.collapse || 0)),
    };
  }, [counts, positions]);

  // 高亮层：短暂显示新点（2.5s 内渐隐、放大-收缩）
  function HighlightSparks() {
    const [version, setVersion] = useState(0);
    useFrame(() => {
      // 驱动重渲染以更新不透明度/缩放
      setVersion((v) => (v + 1) % 1000000);
      // 清理超时火花
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
          return (
            <mesh key={i} position={h.position} scale={scale}>
              <sphereGeometry args={[0.028, 10, 10]} />
              <meshBasicMaterial color={h.color} transparent opacity={opacity} />
            </mesh>
          );
        })}
      </group>
    );
  }

  return (
    <group ref={groupRef} position={[1.4, 0, 0]}>
      {/* 隐藏球壳：不再渲染 */}

      {/* 四个象限的点云层 */}
      <PointsLayer positions={positions.constraint} color={COLORS.constraint} />
      <PointsLayer positions={positions.growth} color={COLORS.growth} />
      <PointsLayer positions={positions.transform} color={COLORS.transform} />
      <PointsLayer positions={positions.collapse} color={COLORS.collapse} />

      {/* 从球心连线（合并 LineSegments，按类分组上色） */}
      <LinesLayer key={`constraint-${positions.constraint.length}`} positions={positions.constraint} color={COLORS.constraint} opacity={0.15} />
      <LinesLayer key={`growth-${positions.growth.length}`} positions={positions.growth} color={COLORS.growth} opacity={0.12} />
      <LinesLayer key={`transform-${positions.transform.length}`} positions={positions.transform} color={COLORS.transform} opacity={0.12} />
      <LinesLayer key={`collapse-${positions.collapse.length}`} positions={positions.collapse} color={COLORS.collapse} opacity={0.12} />

      {/* 新增票的高亮火花层 */}
      <HighlightSparks />
    </group>
  );
}

export default function LiveVotesGlobe() {
  const counts = useLiveCounts({ pollMs: 4000 });

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 0, 4], fov: 60 }}>
        <Globe counts={counts} />
      </Canvas>

      {/* 右下角显示总数简报 */}
      <div className="absolute right-0 bottom-0 text-xs text-white/70 bg-black/40 px-2 py-1">
        C:{counts.constraint} G:{counts.growth} T:{counts.transform} L:{counts.collapse}
      </div>
    </div>
  );
}


