// Vertex shader for ribbon (strip) along a curve
// Expects attribute 'halfCoord' in [-1, +1] across the ribbon width

attribute float halfCoord;
attribute float uCoord; // 0..1 along the curve

varying float vHalfCoord;
varying float vU;
varying vec3 vWorldPosition;

void main() {
  vHalfCoord = halfCoord;
  vU = uCoord;
  // Calculate world position
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  // ensure ribbon faces the camera with slight forward offset
  vec3 pos = position;
  pos.z += 0.001;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}


