uniform vec3 color;
uniform float progress;
uniform float time;
uniform float fogNear;
uniform float fogFar;
varying vec2 vUv;
varying vec3 vNormal;
varying float vDistance;

void main() {
  // 彗星移动速度
  float speed = 0.3;
  
  // 计算彗星位置（沿着 x 轴循环移动）
  float cometPos = mod(time * speed, 1.0);
  
  // 计算当前点到彗星位置的距离（处理循环）
  float dist = vUv.x - cometPos;
  if (dist > 0.5) dist -= 1.0;
  if (dist < -0.5) dist += 1.0;
  
  // 彗星头部：小而亮的点
  float headSize = 0.02;
  float headIntensity = 1.0 - smoothstep(0.0, headSize, abs(dist));
  
  // 彗星尾巴：从头部向后延伸的渐变
  float tailLength = 0.3;
  float tailIntensity = 0.0;
  if (dist < 0.0 && dist > -tailLength) {
    // 在尾巴范围内，靠近头部（dist接近0）亮，远离头部（dist接近-tailLength）暗
    tailIntensity = smoothstep(-tailLength, 0.0, dist);
    tailIntensity = pow(tailIntensity, 0.8); // 让尾巴更平滑
  }
  
  // 合并头部和尾巴
  float cometIntensity = max(headIntensity, tailIntensity);
  
  // 最终颜色：使用基础颜色，亮度由彗星强度控制
  vec3 finalColor = color * cometIntensity;
  
  // 透明度：彗星部分可见，其他部分透明
  float alpha = cometIntensity;
  
  // 应用雾效果
  float fogFactor = 1.0 - smoothstep(fogNear, fogFar, vDistance);
  alpha *= fogFactor;
  
  gl_FragColor = vec4(finalColor, alpha);
}
