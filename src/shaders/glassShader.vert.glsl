varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {
  vPosition = position;
  vNormal = normalMatrix * normal;
  vUv = uv;
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
