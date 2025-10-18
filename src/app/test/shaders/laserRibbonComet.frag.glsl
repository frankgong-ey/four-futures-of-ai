precision mediump float;

varying float vHalfCoord; // -1..+1 across width
varying float vU;         // 0..1 along the curve

uniform float uTime;
uniform vec3 uColor;
uniform float uIntensity;
uniform float uFalloff;   // width falloff across vHalfCoord
uniform float uSpeed;
uniform float uCore;      // head sigma along vU
uniform float uTail;      // tail length along vU
uniform float uHeadBoost; // head brightness multiplier

// Shake effect uniforms
uniform float uShakeIntensity; // intensity of shake effect

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

void main(){
  // Enhanced falloff for more diffusion
  float d = abs(vHalfCoord);
  
  // 结合exponential衰减和平滑边缘的优化算法
  float normalizedDistance = d / 1.0; // 归一化距离 [0, 1]
  
  // 保持exponential衰减的自然感觉
  float expFalloff = exp(-normalizedDistance * uFalloff);
  
  // 创建强烈的中心增强
  float centerBoost = 1.0 - smoothstep(0.0, 0.2, normalizedDistance); // 中心0.2范围内保持高亮度
  expFalloff = max(expFalloff, centerBoost * 0.9);
  
  // 边缘平滑处理 - 在接近1.0时平滑过渡到0
  float edgeSmooth = smoothstep(0.8, 1.0, normalizedDistance);
  float lineMask = expFalloff * (1.0 - edgeSmooth);
  
  // 确保在边界处alpha为0，但保持平滑过渡
  if (lineMask < 0.001) {
    discard; // 只在极低值时截断，避免渲染不必要的像素
  }

  // comet head position along the curve [0,1)
  float head = fract(uTime * uSpeed);
  
  // Calculate distance with wrapping support for seamless loop
  float du = vU - head;
  if (du > 0.5) du -= 1.0;
  if (du < -0.5) du += 1.0;

  // Only render behind the head (du <= 0), completely transparent ahead
  if (du > 0.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }

  // Permanent shake effect
  float shakeOffset = 0.0;
  
  // Multi-layered noise for complex shake pattern
  float shake1 = noise(vec2(vU * 8.0 + uTime * 2.0, uTime * 1.5)) - 0.5;
  float shake2 = noise(vec2(vU * 16.0 - uTime * 1.2, uTime * 0.8)) - 0.5;
  float shake3 = noise(vec2(vU * 32.0 + uTime * 0.5, uTime * 2.2)) - 0.5;
  
  // Combine shake layers with different frequencies
  shakeOffset = (shake1 * 0.5 + shake2 * 0.3 + shake3 * 0.2) * uShakeIntensity;
  
  // Add some vertical shake as well
  float verticalShake = noise(vec2(vU * 12.0 + uTime * 1.8, uTime * 1.1)) - 0.5;
  shakeOffset += verticalShake * uShakeIntensity * 0.3;

  // Apply shake to the comet position
  float shakenDu = du + shakeOffset;
  
  // head only contributes behind head (du <= 0)
  float sigma = max(uCore, 1e-4);
  float headMask = exp(-(shakenDu * shakenDu) / (2.0 * sigma * sigma));
  float tailMask = exp(-max(-shakenDu, 0.0) * uTail);
  float comet = (headMask * uHeadBoost + tailMask) * lineMask;

  float intensity = comet * uIntensity;
  
  // 保持颜色不变，只调整透明度
  vec3 col = uColor;
  gl_FragColor = vec4(col, intensity);
}

