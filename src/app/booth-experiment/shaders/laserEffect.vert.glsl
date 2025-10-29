// 激光效果的Vertex Shader - 使用标准UV坐标
varying vec2 vUv;

void main() {
  vUv = uv; // 使用标准的UV坐标
  
  vec3 pos = position;
  pos.z += 0.001;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
