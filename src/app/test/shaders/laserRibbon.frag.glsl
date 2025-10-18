// Fragment shader for ribbon with laser-like exponential core and shake effect
precision mediump float;

uniform vec3 uColor;
uniform float uIntensity;   // overall brightness
uniform float uFalloff;     // exponential falloff across width (higher -> thinner)
uniform float uTime;        // time for animation
uniform float uShakeIntensity; // intensity of shake effect
uniform vec2 uHoverPoint;   // hover point coordinates
uniform float uHoverActive; // whether hover is active
uniform float uHoverRadius; // radius of hover effect

varying float vHalfCoord; // -1..+1 across ribbon
varying float vU;         // 0..1 along the curve
varying vec3 vWorldPosition; // world position for hover effect

// Noise function for shake
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  // Simplified shake effect for better performance
  float shakeOffset = 0.0;
  if (uShakeIntensity > 0.0) {
    // Single noise layer instead of multiple layers
    float shake = noise(vec2(vU * 8.0 + uTime * 2.0, uTime * 1.5)) - 0.5;
    shakeOffset = shake * uShakeIntensity;
  }
  
  // Apply shake to the half coordinate
  float shakenHalfCoord = vHalfCoord + shakeOffset;
  
  float d = abs(shakenHalfCoord);            // distance from center line with shake
  
  // 结合exponential衰减和平滑边缘的优化算法
  float normalizedDistance = d / 1.0; // 归一化距离 [0, 1]
  
  // 保持exponential衰减的自然感觉
  float expFalloff = exp(-normalizedDistance * uFalloff);
  
  // 创建强烈的中心增强
  float centerBoost = 1.0 - smoothstep(0.0, 0.2, normalizedDistance); // 中心0.2范围内保持高亮度
  expFalloff = max(expFalloff, centerBoost * 0.9);
  
  // 边缘平滑处理 - 在接近1.0时平滑过渡到0
  float edgeSmooth = smoothstep(0.8, 1.0, normalizedDistance);
  float falloffCurve = expFalloff * (1.0 - edgeSmooth);
  
  // 确保在边界处alpha为0，但保持平滑过渡
  if (falloffCurve < 0.001) {
    discard; // 只在极低值时截断，避免渲染不必要的像素
  }
  
  float intensity = falloffCurve * uIntensity;
  
  // 计算hover效果
  vec3 color = uColor;
  if (uHoverActive > 0.5) {
    // 计算当前像素与hover点的距离
    float distanceToHover = distance(vWorldPosition.xy, uHoverPoint);
    
    // 如果距离在hover半径内，混合白色
    if (distanceToHover < uHoverRadius) {
      float hoverStrength = 1.0 - smoothstep(0.0, uHoverRadius, distanceToHover);
      color = mix(uColor, vec3(1.0, 1.0, 1.0), hoverStrength * 0.8);
    }
  }
  
  gl_FragColor = vec4(color, intensity);
}


