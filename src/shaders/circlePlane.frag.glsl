uniform vec3 color;
uniform float time;
varying vec2 vUv;

void main() {
  // 计算到中心的距离
  vec2 center = vec2(0.5, 0.5);
  float dist = length(vUv - center);
  
  // 圆形遮罩（柔和边缘）：使用smoothstep代替step
  // 在0.45-0.5之间柔和过渡到透明
  float circleMask = 1.0 - smoothstep(0.45, 0.5, dist);
  
  // 透明度分两段：
  // 0.0-0.4: 从10%到50%
  // 0.4-0.5: 从50%到0%
  float alpha;
  
  if (dist < 0.4) {
    // 中心到0.4：从10%增长到50%
    alpha = mix(0.1, 0.5, smoothstep(0.0, 0.4, dist));
  } else {
    // 0.4到0.5：从50%衰减到0%
    alpha = mix(0.5, 0.0, smoothstep(0.4, 0.5, dist));
  }
  
  // 应用柔和的圆形遮罩（外边缘虚化）
  alpha *= circleMask;
  
  gl_FragColor = vec4(color, alpha);
}

