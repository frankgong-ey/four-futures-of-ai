uniform vec3 color;
uniform float progress;
uniform float time;
uniform float timeOffset;  // 随机时间偏移
uniform float fogNear;
uniform float fogFar;
varying vec2 vUv;
varying vec3 vNormal;
varying float vDistance;

void main() {
  // 使用带偏移的时间，让每个物体的高光初始位置不同
  float offsetTime = time + timeOffset;
  
  // 反转 V 坐标以匹配 Blender 的 UV 方向
  float reversedV = 1.0 - vUv.y;
  
  // 根据反转后的 V 坐标和进度控制显示
  float visibility = step(reversedV, progress);
  
  // 在进度边缘添加渐变效果
  float edgeFade = 1.0 - smoothstep(progress - 0.05, progress, reversedV);
  visibility *= edgeFade;
  
  // 多高光流动动画
  float highlightSpeed = 0.1; // 流动速度
  float highlightWidth = 0.015; // 单个高光宽度
  float highlightStrength = 0.2; // 高光强度
  
  // 计算多个高光的位置和强度
  float totalHighlightIntensity = 0.0;
  
  // 高光1：不对称高斯分布，前缘锐利，后缘柔和
  // 使用offsetTime让每个物体的初始位置不同
  float highlight1Pos = mod(offsetTime * highlightSpeed * 0.5, 1.0);
  float dist1 = reversedV - highlight1Pos;
  
  // 处理环绕，确保高光连续流动
  if (dist1 > 0.5) dist1 -= 1.0;
  if (dist1 < -0.5) dist1 += 1.0;
  
  float highlight1Intensity = 0.0;
  if (dist1 >= 0.0) {
    // 前方：更锐利的高斯分布
    highlight1Intensity = exp(-pow(dist1 / 0.001, 3.0)) * 0.8;
  } else {
    // 后方：更陡峭的衰减
    highlight1Intensity = exp(dist1 * 30.0) * 0.8;
  }
  
  // 高光2：第二个高光，延迟0.33秒，前缘锐利，后缘柔和
  float highlight2Pos = mod(offsetTime * highlightSpeed * 0.5 + 0.33, 1.0);
  float dist2 = reversedV - highlight2Pos;
  
  // 处理环绕
  if (dist2 > 0.5) dist2 -= 1.0;
  if (dist2 < -0.5) dist2 += 1.0;
  
  float highlight2Intensity = 0.0;
  if (dist2 >= 0.0) {
    highlight2Intensity = exp(-pow(dist2 / 0.001, 3.0)) * 0.8;
  } else {
    highlight2Intensity = exp(dist2 * 30.0) * 0.8;
  }
  
  // 高光3：第三个高光，延迟0.67秒，前缘锐利，后缘柔和
  float highlight3Pos = mod(offsetTime * highlightSpeed * 0.5 + 0.67, 1.0);
  float dist3 = reversedV - highlight3Pos;
  
  // 处理环绕
  if (dist3 > 0.5) dist3 -= 1.0;
  if (dist3 < -0.5) dist3 += 1.0;
  
  float highlight3Intensity = 0.0;
  if (dist3 >= 0.0) {
    highlight3Intensity = exp(-pow(dist3 / 0.001, 3.0)) * 0.8;
  } else {
    highlight3Intensity = exp(dist3 * 30.0) * 0.8;
  }
  
  // 合并所有高光强度
  totalHighlightIntensity = highlight1Intensity + highlight2Intensity + highlight3Intensity;
  totalHighlightIntensity = min(totalHighlightIntensity, 1.0); // 限制最大强度为1.0
  
  // 新的融合方式：暗部完全透明，只显示高光
  float baseVisibility = visibility; // 保存原始可见性
  
  // 使用高光强度来控制整体可见性，但让过渡更平滑
  float brightnessMultiplier = smoothstep(0.0, 0.05, totalHighlightIntensity) * 1.5;
  visibility = baseVisibility * brightnessMultiplier;
  
  // 高光颜色（更亮的白色 + 当前颜色的混合）
  vec3 whiteHighlight = vec3(1.2, 1.2, 1.2);
  vec3 colorHighlight = color * 1.8;
  vec3 highlightColor = mix(colorHighlight, whiteHighlight, 0.7);
  
  // Tube激光中心亮、边缘暗的发光效果
  vec2 center = vec2(0.5, 0.5);
  float distance = length(vUv - center);
  float glow = 1.0 - smoothstep(0.0, 0.5, distance);
  glow = pow(glow, 2.0);
  
  // 结合法线创建更立体的发光效果
  float normalGlow = abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
  glow = mix(glow, glow * normalGlow, 0.3);
  
  // 为深色（特别是紫色）增加额外的亮度提升
  float brightnessBoost = 1.0;
  if (color.r > 0.4 && color.g < 0.1 && color.b > 0.3 && color.b < 0.5) {
    brightnessBoost = 5.0;
  } else if (color.r < 0.5 && color.g < 0.5 && color.b < 0.5) {
    brightnessBoost = 2.0;
  }
  
  // 基础颜色
  vec3 baseColor = color * visibility * (1.0 + glow * 2.0) * brightnessBoost;
  
  // 混合高光效果
  vec3 finalColor = mix(baseColor, highlightColor, totalHighlightIntensity * highlightStrength * visibility);
  
  // 透明度使用平滑过渡
  float alpha = visibility * smoothstep(0.0, 0.03, totalHighlightIntensity);
  
  // Y轴裁剪：reversedV在0-0.4时不显示
  // 在0.4-0.45处淡入
  float yClip = smoothstep(0.3, 0.4, reversedV);
  alpha *= yClip;
  
  // 计算迷雾效果
  float fogFactor = 1.0 - smoothstep(fogNear, fogFar, vDistance);
  alpha *= fogFactor;
  
  gl_FragColor = vec4(finalColor, alpha);
}

