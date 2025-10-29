uniform vec3 uColor;
uniform float uOutlineWidth;
uniform float uEdgeThreshold;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  // 计算法线与视线夹角的余弦值
  vec3 viewDirection = normalize(cameraPosition - vPosition);
  float NdotV = dot(vNormal, viewDirection);
  
  // 当法线与视线接近垂直时（边缘），NdotV接近0
  // 当法线与视线平行时（正面），NdotV接近1
  float edge = 1.0 - abs(NdotV);
  
  // 使用阈值来控制轮廓宽度
  float outline = smoothstep(uEdgeThreshold - uOutlineWidth, uEdgeThreshold + uOutlineWidth, edge);
  
  // 只有边缘部分有颜色，内部透明
  gl_FragColor = vec4(uColor, outline);
}
