varying vec2 vUv;
varying vec3 vNormal;
varying float vDistance;
uniform float time;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal); 
  
  // 波动/呼吸/流动效果
  vec3 pos = position;
  
  // 计算世界坐标系中的位置
  vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
  
  // 计算到摄像机的距离
  vDistance = length(cameraPosition - worldPosition.xyz);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
