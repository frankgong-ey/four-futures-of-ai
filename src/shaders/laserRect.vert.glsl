// Vertex shader for a simple 2D rectangle in an orthographic scene
// Pass through the UVs to the fragment shader

// three.js injects precision, attributes (position, uv) and uniforms (modelViewMatrix, projectionMatrix)
// so we only declare our own varyings

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}


