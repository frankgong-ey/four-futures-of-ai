precision mediump float;

uniform vec3 uColor;
uniform float uOpacity;
uniform float uGradientStrength;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

void main() {
  // 使用UV.x坐标来创建渐变效果
  float uvX = vUv.x;
  
  // 处理浮点数精度问题，确保UV.x在0-1范围内
  uvX = fract(uvX);
  
  // 根据UV.x创建新的分段渐变效果
  float alpha = 1.0;
  
  if (uvX >= 0.0 && uvX < 0.5) {
    // 0.0-0.5: 完全不透明
    alpha = 1.0;
  } else if (uvX >= 0.5 && uvX < 0.8) {
    // 0.5-0.8: 渐变透明，0.8时alpha为0
    alpha = 1.0 - smoothstep(0.5, 0.8, uvX);
  } else {
    // 0.8-1.0: 保持透明
    alpha = 0.0;
  }
  
  // 应用渐变强度控制
  alpha = mix(1.0, alpha, uGradientStrength);
  
  // 计算最终透明度
  float finalAlpha = uOpacity * alpha;
  
  // 输出颜色
  vec3 color = uColor;
  gl_FragColor = vec4(color, finalAlpha);
}
