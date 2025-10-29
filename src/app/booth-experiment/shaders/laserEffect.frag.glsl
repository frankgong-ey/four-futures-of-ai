// 激光效果的Fragment Shader - y=0.5时最亮，向两边衰减
precision mediump float;

uniform vec3 uColor;
uniform float uIntensity;
uniform float uFalloff;
uniform float uTime; // 时间uniform

varying vec2 vUv; // 标准UV坐标 0..1

void main() {
  // 计算到中心线(y=0.5)的距离
  float distanceFromCenter = abs(vUv.y - 0.5); // 0..0.5
  
  // 归一化距离到0..1范围
  float normalizedDistance = distanceFromCenter * 2.0; // 0..1
  
  // 更柔和的呼吸动画：减小变化幅度，速度减半
  float breathing = sin(uTime * 0.75) * 0.15 + 0.85; // 0.7 到 1.0 之间变化
  
  // x轴高光前进效果，速度减半
  float highlightSpeed = 1.0; // 高光移动速度（从2.0减半到1.0）
  float highlightWidth = 0.3; // 高光宽度
  float highlightPos = mod(uTime * highlightSpeed, 1.0); // 高光位置 0..1
  
  // 计算x轴高光强度
  float xDistance = abs(vUv.x - highlightPos);
  // 处理跨越边界的情况（从1.0到0.0）
  float xDistanceWrapped = min(xDistance, 1.0 - xDistance);
  float xHighlight = 1.0 - smoothstep(0.0, highlightWidth, xDistanceWrapped);
  
  // 指数衰减：距离中心越远，亮度越低
  float falloff = exp(-normalizedDistance * uFalloff);
  
  // 中心增强：在y=0.5附近保持高亮度，并应用呼吸效果
  float centerBoost = 1.0 - smoothstep(0.0, 0.2, normalizedDistance);
  falloff = max(falloff, centerBoost * 0.9 * breathing);
  
  // 边缘平滑处理
  float edgeSmooth = smoothstep(0.8, 1.0, normalizedDistance);
  
  // 组合所有效果：基础强度 + 呼吸效果 + x轴高光
  float finalIntensity = falloff * (1.0 - edgeSmooth) * uIntensity * breathing * (0.7 + 0.3 * xHighlight);
  
  // 如果强度太低，丢弃像素
  if (finalIntensity < 0.001) {
    discard;
  }
  
  gl_FragColor = vec4(uColor, finalIntensity);
}
