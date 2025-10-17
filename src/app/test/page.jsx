"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";

import laserVertexShader from "../../shaders/laserRect.vert.glsl";
import laserFragmentShader from "../../shaders/laserRect.frag.glsl";
import cometFragmentShader from "../../shaders/laserRectComets.frag.glsl";
import ribbonVertexShader from "../../shaders/laserRibbon.vert.glsl";
import ribbonFragmentShader from "../../shaders/laserRibbon.frag.glsl";
import ribbonCometFragmentShader from "../../shaders/laserRibbonComet.frag.glsl";
import gradVert from "../../shaders/gradientBackground.vert.glsl";
import gradFrag from "../../shaders/gradientBackground.frag.glsl";

function LaserRect({ color, intensity, falloff, width, planeWidth = 2, planeHeight = 1, mode = "laser", bandCount = 6, speed = 0.3, core = 0.03, tail = 12.0, headBoost = 2.0 }) {
  const materialRef = useRef();

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color || "#33ccff") },
      uIntensity: { value: intensity ?? 1.4 },
      uFalloff: { value: falloff ?? 18.0 },
      uWidth: { value: width ?? 0.02 },
      uTime: { value: 0 },
      uBandCount: { value: bandCount },
      uSpeed: { value: speed },
      uCore: { value: core },
      uTail: { value: tail },
      uHeadBoost: { value: headBoost },
    }),
    []
  );

  // No animation for now
  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
  });

  useEffect(() => {
    if (!materialRef.current) return;
    uniforms.uColor.value.set(color || "#33ccff");
  }, [color, uniforms]);

  useEffect(() => {
    if (!materialRef.current) return;
    uniforms.uIntensity.value = intensity ?? 1.4;
  }, [intensity, uniforms]);

  useEffect(() => {
    if (!materialRef.current) return;
    uniforms.uFalloff.value = falloff ?? 18.0;
  }, [falloff, uniforms]);

  useEffect(() => {
    if (!materialRef.current) return;
    uniforms.uWidth.value = width ?? 0.02;
  }, [width, uniforms]);

  useEffect(() => { uniforms.uBandCount.value = bandCount; }, [bandCount, uniforms]);
  useEffect(() => { uniforms.uSpeed.value = speed; }, [speed, uniforms]);
  useEffect(() => { uniforms.uCore.value = core; }, [core, uniforms]);
  useEffect(() => { uniforms.uTail.value = tail; }, [tail, uniforms]);
  useEffect(() => { uniforms.uHeadBoost.value = headBoost; }, [headBoost, uniforms]);

  return (
    <mesh>
      <planeGeometry args={[planeWidth, planeHeight, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={laserVertexShader}
        fragmentShader={mode === "comets" ? cometFragmentShader : laserFragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function TestPage() {
  // Debug states
  const [rectColor, setRectColor] = useState("#33ccff");
  const [rectIntensity, setRectIntensity] = useState(2.0);
  const [rectFalloff, setRectFalloff] = useState(18.0);
  const [rectWidth, setRectWidth] = useState(0.02);
  const [rectPlaneWidth, setRectPlaneWidth] = useState(2.0);
  const [rectMode, setRectMode] = useState("comets"); // "laser" | "comets"
  const [rectBands, setRectBands] = useState(8);
  const [rectSpeed, setRectSpeed] = useState(0.6);
  const [rectCore, setRectCore] = useState(0.06);
  const [rectTail, setRectTail] = useState(18.0);
  const [rectHeadBoost, setRectHeadBoost] = useState(3.0);

  const [ribbonColor, setRibbonColor] = useState("#33ccff");
  const [ribbonIntensity, setRibbonIntensity] = useState(1.8);
  const [ribbonWidth, setRibbonWidth] = useState(0.15);
  const [ribbonSegments, setRibbonSegments] = useState(80);
  const [ribbonFalloff, setRibbonFalloff] = useState(8.0);
  const [ribbonMode, setRibbonMode] = useState("comet"); // "laser" | "comet"
  const [ribbonSpeed, setRibbonSpeed] = useState(1.0);
  const [ribbonCore, setRibbonCore] = useState(0.1);
  const [ribbonTail, setRibbonTail] = useState(25.0);
  const [ribbonHeadBoost, setRibbonHeadBoost] = useState(4.0);
  const [ribbonWireframe, setRibbonWireframe] = useState(false);

  const [p0, setP0] = useState([-0.8, -0.3]);
  const [p1, setP1] = useState([-0.3, 0.4]);
  const [p2, setP2] = useState([0.3, -0.4]);
  const [p3, setP3] = useState([0.8, 0.3]);

  // gradient bg states
  const [bgA, setBgA] = useState("#0b1020");
  const [bgB, setBgB] = useState("#1b2a6b");
  const [bgSpeed, setBgSpeed] = useState(0.6);

  // Note: 不再自动联动 falloff，便于获得更粗的发光核心

  // Fullscreen canvas with orthographic camera and orbit controls
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#1a1a1a" }}>
      <Canvas gl={{ antialias: true }}>
        <GradientBackground colorA={bgA} colorB={bgB} speed={bgSpeed} />
        <OrthographicCamera makeDefault position={[0, 0, 5]} zoom={100} />
        <OrbitControls enableDamping dampingFactor={0.05} />

        {/* axes helper for orientation */}
        <axesHelper args={[1.5]} />

        {/* simple neutral light to help visualize any 3D controls, though shader is unlit */}
        <ambientLight intensity={0.5} />

        {/* 2D rectangle with custom shader */}
        <LaserRect
          color={rectColor}
          intensity={rectIntensity}
          falloff={rectFalloff}
          width={rectWidth}
          planeWidth={rectPlaneWidth}
          mode={rectMode}
          bandCount={rectBands}
          speed={rectSpeed}
          core={rectCore}
          tail={rectTail}
          headBoost={rectHeadBoost}
        />

        {/* Complex S-shaped curve using cubic Bezier */}
        <LaserRibbonCubic
          p0={p0}
          p1={p1}
          p2={p2}
          p3={p3}
          width={ribbonWidth}
          color={new THREE.Color(ribbonColor)}
          segments={ribbonSegments}
          intensity={ribbonIntensity}
          falloff={ribbonFalloff}
          mode={ribbonMode}
          speed={ribbonSpeed}
          core={ribbonCore}
          tail={ribbonTail}
          headBoost={ribbonHeadBoost}
          wireframe={ribbonWireframe}
        />
      </Canvas>

      {/* Debug panel */}
      <div style={{ position: "fixed", top: 12, left: 12, zIndex: 100, color: "#eee", fontFamily: "monospace", fontSize: 12 }}>
        <div style={{ background: "#00000080", padding: 12, borderRadius: 8, minWidth: 300 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>LaserRect</div>
          <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 6, alignItems: "center" }}>
            <label>mode</label>
            <select value={rectMode} onChange={(e)=>setRectMode(e.target.value)}>
              <option value="laser">laser</option>
              <option value="comets">comets</option>
            </select>
            <label>color</label>
            <input type="color" value={rectColor} onChange={(e)=>setRectColor(e.target.value)} />
            <label>intensity</label>
            <input type="range" min={0} max={4} step={0.05} value={rectIntensity} onChange={(e)=>setRectIntensity(parseFloat(e.target.value))} />
            <label>falloff</label>
            <input type="range" min={1} max={60} step={0.5} value={rectFalloff} onChange={(e)=>setRectFalloff(parseFloat(e.target.value))} />
            <label>width</label>
            <input type="range" min={0.0} max={0.2} step={0.002} value={rectWidth} onChange={(e)=>setRectWidth(parseFloat(e.target.value))} />
            <label>planeWidth</label>
            <input type="range" min={0.2} max={6} step={0.1} value={rectPlaneWidth} onChange={(e)=>setRectPlaneWidth(parseFloat(e.target.value))} />
            {rectMode === "comets" && <>
              <label>bands</label>
              <input type="range" min={1} max={24} step={1} value={rectBands} onChange={(e)=>setRectBands(parseInt(e.target.value))} />
              <label>speed</label>
              <input type="range" min={0.0} max={2.0} step={0.01} value={rectSpeed} onChange={(e)=>setRectSpeed(parseFloat(e.target.value))} />
              <label>core</label>
              <input type="range" min={0.0} max={0.2} step={0.002} value={rectCore} onChange={(e)=>setRectCore(parseFloat(e.target.value))} />
              <label>tail</label>
              <input type="range" min={1.0} max={40.0} step={0.5} value={rectTail} onChange={(e)=>setRectTail(parseFloat(e.target.value))} />
              <label>headBoost</label>
              <input type="range" min={1.0} max={8.0} step={0.1} value={rectHeadBoost} onChange={(e)=>setRectHeadBoost(parseFloat(e.target.value))} />
            </>}
          </div>

          <div style={{ height: 10 }} />
          <div style={{ fontWeight: 700, marginBottom: 8 }}>LaserRibbonCubic</div>
          <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 6, alignItems: "center" }}>
            <label>mode</label>
            <select value={ribbonMode} onChange={(e)=>setRibbonMode(e.target.value)}>
              <option value="laser">laser</option>
              <option value="comet">comet</option>
            </select>
            <label>color</label>
            <input type="color" value={ribbonColor} onChange={(e)=>setRibbonColor(e.target.value)} />

            <label>intensity</label>
            <input type="range" min={0} max={4} step={0.05} value={ribbonIntensity} onChange={(e)=>setRibbonIntensity(parseFloat(e.target.value))} />

            <label>width</label>
            <input type="range" min={0.005} max={0.6} step={0.005} value={ribbonWidth} onChange={(e)=>{ const w=parseFloat(e.target.value); setRibbonWidth(w); }} />

            <label>segments</label>
            <input type="range" min={8} max={256} step={1} value={ribbonSegments} onChange={(e)=>setRibbonSegments(parseInt(e.target.value))} />

            <label>falloff</label>
            <input type="range" min={0.1} max={200} step={0.1} value={ribbonFalloff} onChange={(e)=>setRibbonFalloff(parseFloat(e.target.value))} />
            <label>wireframe</label>
            <input type="checkbox" checked={ribbonWireframe} onChange={(e)=>setRibbonWireframe(e.target.checked)} />
            {ribbonMode === "comet" && <>
              <label>speed</label>
              <input type="range" min={0.0} max={3.0} step={0.01} value={ribbonSpeed} onChange={(e)=>setRibbonSpeed(parseFloat(e.target.value))} />
              <label>core</label>
              <input type="range" min={0.0} max={0.3} step={0.002} value={ribbonCore} onChange={(e)=>setRibbonCore(parseFloat(e.target.value))} />
              <label>tail</label>
              <input type="range" min={1.0} max={50.0} step={0.5} value={ribbonTail} onChange={(e)=>setRibbonTail(parseFloat(e.target.value))} />
              <label>headBoost</label>
              <input type="range" min={1.0} max={8.0} step={0.1} value={ribbonHeadBoost} onChange={(e)=>setRibbonHeadBoost(parseFloat(e.target.value))} />
            </>}
          </div>

          <div style={{ height: 8 }} />
          <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr", gap: 6, alignItems: "center" }}>
            <div style={{ gridColumn: "1 / span 3", fontWeight: 700 }}>P0</div>
            <label>x</label>
            <input type="number" step={0.01} value={p0[0]} onChange={(e)=>setP0([parseFloat(e.target.value), p0[1]])} />
            <label>y</label>
            <input type="number" step={0.01} value={p0[1]} onChange={(e)=>setP0([p0[0], parseFloat(e.target.value)])} />

            <div style={{ gridColumn: "1 / span 3", fontWeight: 700 }}>P1</div>
            <label>x</label>
            <input type="number" step={0.01} value={p1[0]} onChange={(e)=>setP1([parseFloat(e.target.value), p1[1]])} />
            <label>y</label>
            <input type="number" step={0.01} value={p1[1]} onChange={(e)=>setP1([p1[0], parseFloat(e.target.value)])} />

            <div style={{ gridColumn: "1 / span 3", fontWeight: 700 }}>P2</div>
            <label>x</label>
            <input type="number" step={0.01} value={p2[0]} onChange={(e)=>setP2([parseFloat(e.target.value), p2[1]])} />
            <label>y</label>
            <input type="number" step={0.01} value={p2[1]} onChange={(e)=>setP2([p2[0], parseFloat(e.target.value)])} />

            <div style={{ gridColumn: "1 / span 3", fontWeight: 700 }}>P3</div>
            <label>x</label>
            <input type="number" step={0.01} value={p3[0]} onChange={(e)=>setP3([parseFloat(e.target.value), p3[1]])} />
            <label>y</label>
            <input type="number" step={0.01} value={p3[1]} onChange={(e)=>setP3([p3[0], parseFloat(e.target.value)])} />
          </div>

          <div style={{ height: 10 }} />
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Gradient Background</div>
          <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 6, alignItems: "center" }}>
            <label>colorA</label>
            <input type="color" value={bgA} onChange={(e)=>setBgA(e.target.value)} />
            <label>colorB</label>
            <input type="color" value={bgB} onChange={(e)=>setBgB(e.target.value)} />
            <label>speed</label>
            <input type="range" min={0} max={2} step={0.01} value={bgSpeed} onChange={(e)=>setBgSpeed(parseFloat(e.target.value))} />
          </div>
        </div>
      </div>
    </div>
  );
}


function LaserRibbon({ p0, p1, p2, width = 0.05, color = new THREE.Color(1,1,1), segments = 64, intensity = 1.6, falloff = 6.0 }) {
  const materialRef = useRef();

  const { geometry, uniforms } = useMemo(() => {
    const positions = [];
    const halfCoords = [];
    const indices = [];

    const halfWidth = width * 0.5;

    const A = new THREE.Vector2(p0[0], p0[1]);
    const B = new THREE.Vector2(p1[0], p1[1]);
    const C = new THREE.Vector2(p2[0], p2[1]);

    const pointAt = (t) => {
      const s = 1 - t;
      const x = s * s * A.x + 2 * s * t * B.x + t * t * C.x;
      const y = s * s * A.y + 2 * s * t * B.y + t * t * C.y;
      return new THREE.Vector2(x, y);
    };

    const tangentAt = (t) => {
      // derivative of quadratic Bezier: 2*(1-t)*(B-A) + 2*t*(C-B)
      const term1 = new THREE.Vector2().subVectors(B, A).multiplyScalar(2 * (1 - t));
      const term2 = new THREE.Vector2().subVectors(C, B).multiplyScalar(2 * t);
      return term1.add(term2);
    };

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const P = pointAt(t);
      const T = tangentAt(t);
      if (T.lengthSq() === 0) T.set(1, 0);
      T.normalize();
      const N = new THREE.Vector2(-T.y, T.x); // left normal

      const left = new THREE.Vector2().copy(P).addScaledVector(N, -halfWidth);
      const right = new THREE.Vector2().copy(P).addScaledVector(N, +halfWidth);

      // two vertices per segment point
      positions.push(left.x, left.y, 0);
      positions.push(right.x, right.y, 0);
      halfCoords.push(-1, +1);

      if (i < segments) {
        const base = i * 2;
        // two triangles (base, base+1, base+2) and (base+1, base+3, base+2)
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("halfCoord", new THREE.Float32BufferAttribute(halfCoords, 1));
    geo.setIndex(indices);

    const u = {
      uColor: { value: color },
      uIntensity: { value: intensity },
      uFalloff: { value: falloff },
    };
    return { geometry: geo, uniforms: u };
  }, [p0, p1, p2, width, color, intensity, falloff, segments]);

  useEffect(() => {
    uniforms.uColor.value.copy(color);
  }, [color, uniforms]);
  useEffect(() => {
    uniforms.uIntensity.value = intensity;
  }, [intensity, uniforms]);
  useEffect(() => {
    uniforms.uFalloff.value = falloff;
  }, [falloff, uniforms]);

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={ribbonVertexShader}
        fragmentShader={ribbonFragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function GradientBackground({ colorA = "#0b1020", colorB = "#1b2a6b", speed = 0.5 }) {
  const materialRef = useRef();
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColorA: { value: new THREE.Color(colorA) },
    uColorB: { value: new THREE.Color(colorB) },
    uSpeed: { value: speed },
  }), []);

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
  });

  useEffect(() => { uniforms.uColorA.value.set(colorA); }, [colorA, uniforms]);
  useEffect(() => { uniforms.uColorB.value.set(colorB); }, [colorB, uniforms]);
  useEffect(() => { uniforms.uSpeed.value = speed; }, [speed, uniforms]);

  // large plane behind everything
  return (
    <mesh position={[0, 0, -1]} frustumCulled={false}>
      <planeGeometry args={[10, 10, 1, 1]} />
      <shaderMaterial ref={materialRef} vertexShader={gradVert} fragmentShader={gradFrag} uniforms={uniforms} depthWrite={false} />
    </mesh>
  );
}

function LaserRibbonCubic({ p0, p1, p2, p3, width = 0.05, color = new THREE.Color(1,1,1), segments = 64, intensity = 1.6, falloff = 6.0, mode = "laser", speed = 0.6, core = 0.06, tail = 18.0, headBoost = 3.0, wireframe = false }) {
  const materialRef = useRef();

  // Geometry builds can re-run on shape changes
  const geometry = useMemo(() => {
    const positions = [];
    const halfCoords = [];
    const uCoords = [];
    const indices = [];

    const halfWidth = width * 0.5;

    const A = new THREE.Vector2(p0[0], p0[1]);
    const B = new THREE.Vector2(p1[0], p1[1]);
    const C = new THREE.Vector2(p2[0], p2[1]);
    const D = new THREE.Vector2(p3[0], p3[1]);

    const pointAt = (t) => {
      const s = 1 - t;
      const s2 = s * s;
      const s3 = s2 * s;
      const t2 = t * t;
      const t3 = t2 * t;
      
      const x = s3 * A.x + 3 * s2 * t * B.x + 3 * s * t2 * C.x + t3 * D.x;
      const y = s3 * A.y + 3 * s2 * t * B.y + 3 * s * t2 * C.y + t3 * D.y;
      return new THREE.Vector2(x, y);
    };

    const tangentAt = (t) => {
      // derivative of cubic Bezier: 3*(1-t)²*(B-A) + 6*(1-t)*t*(C-B) + 3*t²*(D-C)
      const s = 1 - t;
      const term1 = new THREE.Vector2().subVectors(B, A).multiplyScalar(3 * s * s);
      const term2 = new THREE.Vector2().subVectors(C, B).multiplyScalar(6 * s * t);
      const term3 = new THREE.Vector2().subVectors(D, C).multiplyScalar(3 * t * t);
      return term1.add(term2).add(term3);
    };

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const P = pointAt(t);
      const T = tangentAt(t);
      if (T.lengthSq() === 0) T.set(1, 0);
      T.normalize();
      const N = new THREE.Vector2(-T.y, T.x); // left normal

      const left = new THREE.Vector2().copy(P).addScaledVector(N, -halfWidth);
      const right = new THREE.Vector2().copy(P).addScaledVector(N, +halfWidth);

      // two vertices per segment point
      positions.push(left.x, left.y, 0);
      positions.push(right.x, right.y, 0);
      halfCoords.push(-1, +1);
      uCoords.push(t, t);

      if (i < segments) {
        const base = i * 2;
        // two triangles (base, base+1, base+2) and (base+1, base+3, base+2)
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("halfCoord", new THREE.Float32BufferAttribute(halfCoords, 1));
    geo.setAttribute("uCoord", new THREE.Float32BufferAttribute(uCoords, 1));
    geo.setIndex(indices);
    return geo;
  }, [p0, p1, p2, p3, width, segments]);

  // Uniforms persist across prop changes
  const uniformsRef = useRef({
    uColor: { value: color.clone ? color.clone() : new THREE.Color(color) },
    uIntensity: { value: intensity },
    uFalloff: { value: falloff },
    uTime: { value: 0 },
    uSpeed: { value: speed },
    uCore: { value: core },
    uTail: { value: tail },
    uHeadBoost: { value: headBoost },
  });

  useEffect(() => { uniformsRef.current.uColor.value.copy(color); }, [color]);
  useEffect(() => { uniformsRef.current.uIntensity.value = intensity; }, [intensity]);
  useEffect(() => { uniformsRef.current.uFalloff.value = falloff; }, [falloff]);
  useEffect(() => { uniformsRef.current.uSpeed.value = speed; }, [speed]);
  useEffect(() => { uniformsRef.current.uCore.value = core; }, [core]);
  useEffect(() => { uniformsRef.current.uTail.value = tail; }, [tail]);
  useEffect(() => { uniformsRef.current.uHeadBoost.value = headBoost; }, [headBoost]);

  useFrame((_, delta) => {
    uniformsRef.current.uTime.value += delta;
  });

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <shaderMaterial key={mode}
        ref={materialRef}
        vertexShader={ribbonVertexShader}
        fragmentShader={mode === "comet" ? ribbonCometFragmentShader : ribbonFragmentShader}
        uniforms={uniformsRef.current}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
        wireframe={wireframe}
      />
    </mesh>
  );
}


