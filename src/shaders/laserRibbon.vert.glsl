// Vertex shader for ribbon (strip) along a curve
// Expects attribute 'halfCoord' in [-1, +1] across the ribbon width

attribute float halfCoord;
attribute float uCoord; // 0..1 along the curve

varying float vHalfCoord;
varying float vU;

void main() {
  vHalfCoord = halfCoord;
  vU = uCoord;
  // ensure ribbon faces the camera with slight forward offset
  vec3 pos = position;
  pos.z += 0.001;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}


