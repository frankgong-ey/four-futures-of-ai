"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { loadPollId, loadDashboardShowAll } from "../../components/Settings";

const SUPABASE_URL = "https://rmgvfgjsqswwumheewho.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtZ3ZmZ2pzcXN3d3VtaGVld2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTk2NzYsImV4cCI6MjA3MDI3NTY3Nn0.xm2Tn9fgBDvoM4zSuc4naQHBCoQaAxvRbUyht_LBLFs";

const COLORS = {
  constraint: "#C37EB3",
  growth: "#2BB856",
  transform: "#198CE6",
  collapse: "#FF4136",
};

// Static configuration for each category
const CATEGORY_CONFIG = {
  constraint: { radius: 3, centerX: 3.5, centerY: 1.9, centerZ: 0, halfAngle: 1 },
  growth: { radius: 3, centerX: -2, centerY: 2, centerZ: 0.0, halfAngle: 1 },
  transform: { radius: 3, centerX: 2.0, centerY: -2, centerZ: 0.0, halfAngle: 1 },
  collapse: { radius: 3, centerX: -2.0, centerY: -3.0, centerZ: 0.0, halfAngle: 1 },
};

function fetchVoteCounts(signal, pollId = null, showAll = false) {
  // If showAll is true, don't filter by poll_id
  let url = `${SUPABASE_URL}/rest/v1/vote_counts?select=*`;
  if (!showAll && pollId) {
    const encodedPollId = encodeURIComponent(pollId);
    url = `${SUPABASE_URL}/rest/v1/vote_counts?poll_id=eq.${encodedPollId}&select=*`;
  }
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

function useLiveCounts({ pollMs = 5000, pollId = null, showAll = false }) {
  const [counts, setCounts] = useState({ constraint: 0, growth: 0, transform: 0, collapse: 0 });

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    // Use provided pollId or load from localStorage (only if showAll is false)
    const activePollId = showAll ? null : (pollId || loadPollId());

    const load = async () => {
      try {
        const rows = await fetchVoteCounts(controller.signal, activePollId, showAll);
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
    
    // Listen for poll_id changes and dashboard show all changes
    const handlePollIdChange = () => {
      load();
    };
    const handleDashboardShowAllChange = () => {
      load();
    };
    window.addEventListener("pollIdChanged", handlePollIdChange);
    window.addEventListener("dashboardShowAllChanged", handleDashboardShowAllChange);

    return () => {
      mounted = false;
      controller.abort();
      clearInterval(id);
      window.removeEventListener("pollIdChanged", handlePollIdChange);
      window.removeEventListener("dashboardShowAllChanged", handleDashboardShowAllChange);
    };
  }, [pollMs, pollId, showAll]);

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
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshBasicMaterial color={colorVec} />
    </instancedMesh>
  );
}

function LinesLayer({ positions, color, opacity = 0.18, segments = 11, bend = 0.22, seed = 999, lineWidth = 2.0 }) {
  const lineRef = useRef();
  const { size } = useThree();

  // 重建 position buffer：将每条 [0,0,0]→p 细分为“有机”曲线（二次贝塞尔采样），并按段输出
  useEffect(() => {
    const line = lineRef.current;
    if (!line) return;
    const count = positions.length;
    if (count === 0 || segments <= 0 || !Number.isFinite(segments)) {
      line.visible = false;
      return;
    }
    const prng = mulberry32(seed);
    // LineSegmentsGeometry 需要成对顶点（每条曲线 segments 段，每段 2 顶点）
    const totalVertices = count * segments * 2 * 3;
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

      // 采样二次贝塞尔：相邻点两两成段，避免曲线之间连线
      let prev;
      for (let s = 0; s <= segments; s++) {
        const t = s / segments;
        const one = 1 - t;
        const qx = 2 * one * t * c.x + t * t * p.x;
        const qy = 2 * one * t * c.y + t * t * p.y;
        const qz = 2 * one * t * c.z + t * t * p.z;
        const curr = { x: qx, y: qy, z: qz };
        if (prev) {
          arr[cursor++] = prev.x; arr[cursor++] = prev.y; arr[cursor++] = prev.z;
          arr[cursor++] = curr.x; arr[cursor++] = curr.y; arr[cursor++] = curr.z;
        }
        prev = curr;
      }
    }
    // 重建几何以避免缓存问题
    line.geometry.dispose?.();
    line.geometry = new LineSegmentsGeometry();
    line.geometry.setPositions(arr);
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
    const geom = new LineSegmentsGeometry();
    const mat = new LineMaterial({
      color: colorVec.getHex(),
      linewidth: lineWidth,
      transparent: true,
      opacity: opacity,
      depthWrite: false,
      resolution: new THREE.Vector2(size.width, size.height),
    });
    mat.blending = THREE.AdditiveBlending;
    return new LineSegments2(geom, mat);
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

// Camera controller: applies static values to the Three.js camera
function CameraRig() {
  const { camera } = useThree();
  useEffect(() => {
    camera.fov = 60;
    camera.position.set(1.3, 0, 8);
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
}

function Globe({ counts, userVote }) {
  const groupRef = useRef();
  const prevCountsRef = useRef({ constraint: 0, growth: 0, transform: 0, collapse: 0 });
  const highlightsRef = useRef([]); // { position: Vector3, color: string, bornAt: number }

  // Static configuration values (previously from Leva)
  const baseX = -3;
  const sphereRadius = 1.2;
  const dynamicHalfAngle = false;

  // 点数上限：防爆显卡；每类最多 2000 个点
  const maxPerCategory = 2000;
  const radius = sphereRadius;

  const positions = useMemo(() => {
    // Centers from static config
    const centers = {
      constraint: new THREE.Vector3(CATEGORY_CONFIG.constraint.centerX, CATEGORY_CONFIG.constraint.centerY, CATEGORY_CONFIG.constraint.centerZ).normalize(),
      growth:     new THREE.Vector3(CATEGORY_CONFIG.growth.centerX, CATEGORY_CONFIG.growth.centerY, CATEGORY_CONFIG.growth.centerZ).normalize(),
      transform:  new THREE.Vector3(CATEGORY_CONFIG.transform.centerX, CATEGORY_CONFIG.transform.centerY, CATEGORY_CONFIG.transform.centerZ).normalize(),
      collapse:   new THREE.Vector3(CATEGORY_CONFIG.collapse.centerX, CATEGORY_CONFIG.collapse.centerY, CATEGORY_CONFIG.collapse.centerZ).normalize(),
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
      const autoHalf = halfAngleMin + (halfAngleMax - halfAngleMin) * t;
      const userHalf = CATEGORY_CONFIG[key].halfAngle;
      const userRadius = CATEGORY_CONFIG[key].radius;
      const halfAngle = dynamicHalfAngle ? autoHalf : userHalf;
      out[key] = generatePointsOnSurfacePatch(n, centers[key], userRadius, halfAngle, 4242 + i, 0.2);
    });
    return out;
  }, [counts]);

  // 用户投票：稳定挑选该类别的一个点，避免轮询时抖动
  const voteKey = (userVote || '').toLowerCase();
  const stablePointRef = useRef(null);
  const lastCountRef = useRef(0);

  // 当 userVote 改变时，重置稳定点
  useEffect(() => {
    stablePointRef.current = null;
    lastCountRef.current = 0;
  }, [voteKey]);

  // 当该类别点首次出现时确定一个稳定点，否则使用中心方向的虚拟点
  useEffect(() => {
    const arr = positions[voteKey] || [];
    if (stablePointRef.current) return;
    if (arr.length > 0) {
      // 使用简单哈希确保在同一会话稳定（基于 voteKey）
      let hash = 0;
      for (let i = 0; i < voteKey.length; i++) hash = (hash * 31 + voteKey.charCodeAt(i)) >>> 0;
      const idx = arr.length > 0 ? (hash % arr.length) : 0;
      stablePointRef.current = arr[Math.max(0, Math.min(arr.length - 1, idx))].clone();
      lastCountRef.current = arr.length;
      return;
    }
    // fallback：该类别暂时无点时，使用中心方向 + 半径 放置一个虚拟点
    let centerDir = null;
    let r = radius;
    if (voteKey === 'constraint') {
      const cfg = CATEGORY_CONFIG.constraint;
      centerDir = new THREE.Vector3(cfg.centerX, cfg.centerY, cfg.centerZ).normalize();
      r = cfg.radius || radius;
    } else if (voteKey === 'growth') {
      const cfg = CATEGORY_CONFIG.growth;
      centerDir = new THREE.Vector3(cfg.centerX, cfg.centerY, cfg.centerZ).normalize();
      r = cfg.radius || radius;
    } else if (voteKey === 'transform') {
      const cfg = CATEGORY_CONFIG.transform;
      centerDir = new THREE.Vector3(cfg.centerX, cfg.centerY, cfg.centerZ).normalize();
      r = cfg.radius || radius;
    } else if (voteKey === 'collapse') {
      const cfg = CATEGORY_CONFIG.collapse;
      centerDir = new THREE.Vector3(cfg.centerX, cfg.centerY, cfg.centerZ).normalize();
      r = cfg.radius || radius;
    }
    if (centerDir) stablePointRef.current = centerDir.setLength(r).clone();
  }, [positions, voteKey, radius]);

  const chosenPoint = stablePointRef.current;
  const labelPos = useMemo(() => {
    if (!chosenPoint) return null;
    const offset = chosenPoint.clone().normalize().multiplyScalar(0.12);
    return chosenPoint.clone().add(offset);
  }, [chosenPoint]);

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
    <group ref={groupRef} position={[baseX, -0.5, 0]}>
      {/* 隐藏球壳：不再渲染 */}

      {/* 四个象限的点云层 */}
      <PointsLayer positions={positions.constraint} color={COLORS.constraint} />
      <PointsLayer positions={positions.growth} color={COLORS.growth} />
      <PointsLayer positions={positions.transform} color={COLORS.transform} />
      <PointsLayer positions={positions.collapse} color={COLORS.collapse} />

      {/* 从球心连线（合并 LineSegments，按类分组上色） */}
      <LinesLayer key={`constraint-${positions.constraint.length}`} positions={positions.constraint} color={COLORS.constraint} opacity={0.1} />
      <LinesLayer key={`growth-${positions.growth.length}`} positions={positions.growth} color={COLORS.growth} opacity={0.1} />
      <LinesLayer key={`transform-${positions.transform.length}`} positions={positions.transform} color={COLORS.transform} opacity={0.1} />
      <LinesLayer key={`collapse-${positions.collapse.length}`} positions={positions.collapse} color={COLORS.collapse} opacity={0.1} />

      {/* 新增票的高亮火花层 */}
      <HighlightSparks />

      {/* 用户投票固定高亮点 + 不遮挡 HTML 标签 */}
      {chosenPoint && (
        <>
          <mesh position={chosenPoint}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshBasicMaterial color={"#ffffff"} />
          </mesh>
          {labelPos && (
            <Html position={labelPos} transform sprite distanceFactor={5}>
              <div className="px-2 py-1 text-xs font-bold bg-white text-black whitespace-nowrap select-none">
                Your Vote
              </div>
            </Html>
          )}
        </>
      )}
    </group>
  );
}

export default function LiveVotesGlobe({ counts: countsOverride, userVote }) {
  const [showAll, setShowAll] = useState(loadDashboardShowAll());
  const pollId = showAll ? null : loadPollId();
  const internal = useLiveCounts({ pollMs: 4000, pollId, showAll });
  const counts = countsOverride || internal;

  // Listen for dashboard show all setting changes
  useEffect(() => {
    const handleDashboardShowAllChange = () => {
      setShowAll(loadDashboardShowAll());
    };
    window.addEventListener("dashboardShowAllChanged", handleDashboardShowAllChange);
    return () => {
      window.removeEventListener("dashboardShowAllChanged", handleDashboardShowAllChange);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [1.3, 0, 8], fov: 60 }} dpr={[1, 1]}>
        <CameraRig />
        <Globe counts={counts} userVote={userVote} />
      </Canvas>

      {/* 右下角显示总数简报 */}
      <div className="absolute right-0 bottom-0 text-xs text-white/70 bg-black/40 px-2 py-1">
        C:{counts.constraint} G:{counts.growth} T:{counts.transform} L:{counts.collapse}
      </div>
    </div>
  );
}


