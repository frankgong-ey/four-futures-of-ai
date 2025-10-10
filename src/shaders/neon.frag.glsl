uniform vec3 color;
uniform float progress;
uniform float time;
uniform float fogNear;
uniform float fogFar;
varying vec2 vUv;
varying vec3 vNormal;
varying float vDistance;

void main() {
  // 反转 V 坐标以匹配 Blender 的 UV 方向
  float reversedV = 1.0 - vUv.y;
  
  // 根据反转后的 V 坐标和进度控制显示
  float visibility = step(reversedV, progress);
  
  // 在进度边缘添加渐变效果
  float edgeFade = 1.0 - smoothstep(progress - 0.05, progress, reversedV);
  visibility *= edgeFade;
  
  // 多高光流动动画
  float highlightSpeed = 0.1; // 流动速度（更慢了）
  float highlightWidth = 0.015; // 单个高光宽度（更小了）
  float highlightStrength = 0.3; // 高光强度（更暗了）
  
  // 计算多个高光的位置和强度
  float totalHighlightIntensity = 0.0;
  



  
  // 高光1：不对称高斯分布，前缘锐利，后缘柔和
  float highlight1Pos = mod(time * highlightSpeed * 0.5, 1.0);
  float dist1 = reversedV - highlight1Pos;
  
  // 处理环绕，确保高光连续流动
  if (dist1 > 0.5) dist1 -= 1.0;
  if (dist1 < -0.5) dist1 += 1.0;
  
  float highlight1Intensity = 0.0;
  if (dist1 >= 0.0) {
    // 前方：更锐利的高斯分布
    highlight1Intensity = exp(-pow(dist1 / 0.001, 3.0)) * 0.8; // 缩小范围从0.008到0.005
  } else {
    // 后方：更陡峭的衰减
    highlight1Intensity = exp(dist1 * 30.0) * 0.8; // 增加衰减系数从20.0到30.0
  }
  



  // 高光2：第二个高光，延迟0.33秒，前缘锐利，后缘柔和
  float highlight2Pos = mod(time * highlightSpeed * 0.5 + 0.33, 1.0);
  float dist2 = reversedV - highlight2Pos;
  
  // 处理环绕
  if (dist2 > 0.5) dist2 -= 1.0;
  if (dist2 < -0.5) dist2 += 1.0;
  
  float highlight2Intensity = 0.0;
  if (dist2 >= 0.0) {
    highlight2Intensity = exp(-pow(dist2 / 0.001, 3.0)) * 0.8; // 缩小范围
  } else {
    highlight2Intensity = exp(dist2 * 30.0) * 0.8; // 更陡峭的衰减
  }
  





  // 高光3：第三个高光，延迟0.67秒，前缘锐利，后缘柔和
  float highlight3Pos = mod(time * highlightSpeed * 0.5 + 0.67, 1.0);
  float dist3 = reversedV - highlight3Pos;
  
  // 处理环绕
  if (dist3 > 0.5) dist3 -= 1.0;
  if (dist3 < -0.5) dist3 += 1.0;
  
  float highlight3Intensity = 0.0;
  if (dist3 >= 0.0) {
    highlight3Intensity = exp(-pow(dist3 / 0.001, 3.0)) * 0.8; // 缩小范围
  } else {
    highlight3Intensity = exp(dist3 * 30.0) * 0.8; // 更陡峭的衰减
  }
  
  // 合并所有高光强度
  totalHighlightIntensity = highlight1Intensity + highlight2Intensity + highlight3Intensity;
  totalHighlightIntensity = min(totalHighlightIntensity, 1.0); // 限制最大强度为1.0
  
  // 新的融合方式：暗部完全透明，只显示高光
  float baseVisibility = visibility; // 保存原始可见性
  
  // 使用高光强度来控制整体可见性，但让过渡更平滑
  // 使用平滑过渡而不是硬切换
  float brightnessMultiplier = smoothstep(0.0, 0.05, totalHighlightIntensity) * 1.5; // 平滑过渡到高光
  visibility = baseVisibility * brightnessMultiplier;
  
  // 高光颜色（更亮的白色 + 当前颜色的混合）
  vec3 whiteHighlight = vec3(1.2, 1.2, 1.2); // 更亮的白色
  vec3 colorHighlight = color * 1.8; // 大幅增强当前颜色
  vec3 highlightColor = mix(colorHighlight, whiteHighlight, 0.7); // 70%白色，30%当前颜色
  
  // Tube激光中心亮、边缘暗的发光效果
  // 使用UV坐标创建径向发光效果
  vec2 center = vec2(0.5, 0.5);
  float distance = length(vUv - center);
  float glow = 1.0 - smoothstep(0.0, 0.5, distance);
  glow = pow(glow, 2.0); // 调整亮度分布
  
  // 结合法线创建更立体的发光效果
  float normalGlow = abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
  glow = mix(glow, glow * normalGlow, 0.3);
  
  // 为深色（特别是紫色）增加额外的亮度提升
  float brightnessBoost = 1.0;
  // 更精确的紫色检测：紫色#750D5D的RGB值约为(0.46, 0.05, 0.36)
  if (color.r > 0.4 && color.g < 0.1 && color.b > 0.3 && color.b < 0.5) {
    // 检测紫色并大幅增加亮度
    brightnessBoost = 5.0;
  } else if (color.r < 0.5 && color.g < 0.5 && color.b < 0.5) {
    // 为其他深色也提供适度的亮度提升
    brightnessBoost = 2.0;
  }
  
  // 基础颜色（使用调整后的 visibility）
  vec3 baseColor = color * visibility * (1.0 + glow * 2.0) * brightnessBoost;
  
  // 混合高光效果
  vec3 finalColor = mix(baseColor, highlightColor, totalHighlightIntensity * highlightStrength * visibility);
  
  // 透明度使用平滑过渡，让衔接处更自然
  float alpha = visibility * smoothstep(0.0, 0.03, totalHighlightIntensity); // 平滑过渡透明度
  
  // 计算迷雾效果：根据距离调整透明度
  // fogNear到fogFar之间的距离会从完全可见渐变到完全透明
  float fogFactor = 1.0 - smoothstep(fogNear, fogFar, vDistance);
  alpha *= fogFactor;
  
  gl_FragColor = vec4(finalColor, alpha);
}

