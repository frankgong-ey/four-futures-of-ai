uniform vec3 color;
uniform float time;
varying vec2 vUv;

void main() {
  // 计算距离中心(0.5)的距离
  float distFromCenter = abs(vUv.y - 0.5);
  
  // 归一化距离到0-1范围（0.5的距离映射到1）
  float normalizedDist = distFromCenter / 0.5;
  
  // 反转效果：中心透明，两端不透明
  // 使用平滑的指数增长
  float alpha = pow(normalizedDist, 3.0);
  
  gl_FragColor = vec4(color, alpha);
}

