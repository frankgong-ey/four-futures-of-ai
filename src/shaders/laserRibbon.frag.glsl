// Fragment shader for ribbon with laser-like exponential core
precision mediump float;

uniform vec3 uColor;
uniform float uIntensity;   // overall brightness
uniform float uFalloff;     // exponential falloff across width (higher -> thinner)

varying float vHalfCoord; // -1..+1 across ribbon

void main() {
  float d = abs(vHalfCoord);            // distance from center line
  
  // 简化的衰减算法，提高性能
  float falloffCurve = exp(-d * uFalloff);
  
  // 简单的边缘平滑
  float edgeSmooth = smoothstep(0.9, 1.0, d);
  falloffCurve *= (1.0 - edgeSmooth);
  
  // 确保在边界处alpha为0
  if (falloffCurve < 0.01) {
    discard;
  }
  
  float intensity = falloffCurve * uIntensity;
  
  // 保持颜色不变，只调整透明度
  vec3 color = uColor;
  gl_FragColor = vec4(color, intensity);
}


