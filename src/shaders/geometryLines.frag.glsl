uniform vec3 color;
uniform float time;
// fadeOffset 现在来自顶点 attribute，在顶点着色器传递为 varying
varying float vAlpha;
varying float vLinePosition; // 0.0 = 起点, 1.0 = 终点
varying float vFadeOffset;

void main() {
  // 使用sin波控制生长进度（0到1循环）
  // 每条线有不同的fadeOffset，造成随机的生长时机
  float growthCycle = sin(time * 0.5 + vFadeOffset) * 0.5 + 0.5;
  
  // 生长效果：只显示从起点到当前生长位置的部分
  // vLinePosition是沿线段的位置（需要在geometry中设置）
  // 这里我们用一个简化方案：基于片段位置的渐变
  
  // 计算生长边界（0到1）
  float growthProgress = smoothstep(0.1, 0.9, growthCycle);
  
  // 只显示生长到的部分
  // 假设线段从0增长到1
  float lineAlpha = smoothstep(growthProgress - 0.1, growthProgress, vLinePosition);
  
  // 反转：让线条从起点增长
  lineAlpha = 1.0 - lineAlpha;
  
  // 添加淡出效果，让线条在增长后逐渐消失
  float fadeOut = smoothstep(0.9, 1.0, growthCycle);
  lineAlpha *= (1.0 - fadeOut);
  
  float alpha = lineAlpha * vAlpha;
  
  gl_FragColor = vec4(color, alpha);
}

