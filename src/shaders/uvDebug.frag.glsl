// UV调试用的Fragment Shader - 使用标准UV坐标
precision mediump float;

varying vec2 vUv; // 标准UV坐标 0..1

void main() {
  // 显示标准UV坐标
  // vUv.x = U坐标 (0..1) -> 红色通道
  // vUv.y = V坐标 (0..1) -> 绿色通道
  
  float red = vUv.x;   // U坐标映射到红色
  float green = vUv.y; // V坐标映射到绿色
  float blue = 0.0;    // 蓝色通道固定为0
  
  // 添加网格线来更好地可视化UV分布
  float gridU = abs(fract(vUv.x * 10.0) - 0.5) * 2.0;
  float gridV = abs(fract(vUv.y * 10.0) - 0.5) * 2.0;
  
  // 如果接近网格线，显示白色
  if (gridU < 0.05 || gridV < 0.05) {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  } else {
    gl_FragColor = vec4(red, green, blue, 1.0);
  }
}
