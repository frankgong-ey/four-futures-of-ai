uniform vec3 color;
varying vec2 vUv;

void main() {
  // 计算距离中心(0.5)的距离
  float distFromCenter = abs(vUv.y - 0.5);
  
  // 归一化距离到0-1范围
  float normalizedDist = distFromCenter / 0.5;
  
  // 反转效果：中心透明，两端不透明
  float alpha = pow(normalizedDist, 3.0);
  
  // 使点变圆
  vec2 pointCoord = gl_PointCoord - vec2(0.5);
  float dist = length(pointCoord);
  if (dist > 0.5) discard;
  
  gl_FragColor = vec4(color, alpha);
}

