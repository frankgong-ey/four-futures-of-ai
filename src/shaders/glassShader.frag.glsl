precision mediump float;

uniform vec3 uColor;
uniform float uOpacity;
uniform float uTime;
uniform float uRefractionStrength;
uniform float uFresnelPower;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {
  // 法向量归一化
  vec3 normal = normalize(vNormal);
  
  // 计算菲涅尔效果 (Fresnel)
  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
  float fresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), uFresnelPower);
  
  // 折射效果模拟
  vec3 refractedNormal = refract(viewDirection, normal, 0.75);
  vec2 refractionUV = vUv + refractedNormal.xy * uRefractionStrength;
  
  // 基于UV的折射扭曲
  float refractionX = sin(refractionUV.x * 10.0 + uTime) * 0.02;
  float refractionY = cos(refractionUV.y * 8.0 + uTime * 0.5) * 0.02;
  vec2 distortedUV = vUv + vec2(refractionX, refractionY);
  
  // 模拟玻璃的颜色变化 - 使用更明显的颜色
  vec3 glassColor = vec3(0.8, 0.9, 1.0); // 基础玻璃蓝色
  glassColor += vec3(0.2, 0.3, 0.4) * fresnel; // 菲涅尔蓝色调
  glassColor += vec3(0.1, 0.2, 0.3) * sin(distortedUV.x * 20.0 + uTime); // 闪烁效果
  
  // 边缘高亮效果
  float edgeHighlight = smoothstep(0.7, 1.0, fresnel);
  glassColor += vec3(0.4, 0.5, 0.6) * edgeHighlight;
  
  // 透明度计算 - 让玻璃更透明
  float alpha = 0.3 + 0.4 * fresnel; // 中心更透明，边缘更不透明
  
  gl_FragColor = vec4(glassColor, alpha);
}
