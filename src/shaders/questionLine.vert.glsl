varying vec2 vUv;
varying vec3 vNormal;
varying float vDistance;
uniform float time;

void main() {
  vUv = uv;
  vUv.x = (vUv.x - 0.5) * 0.5 + 0.5; // 压缩X轴UV，让管子变成一半粗
  vNormal = normalize(normalMatrix * normal); 
  
  // 移除所有形变效果，保持简单的顶点处理
  vec3 pos = position;
  
  // 计算世界坐标系中的位置
  vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
  
  // 计算到摄像机的距离
  vDistance = length(cameraPosition - worldPosition.xyz);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
