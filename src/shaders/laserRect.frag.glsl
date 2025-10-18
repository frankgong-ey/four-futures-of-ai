// Fragment shader: straight laser line brightest at y=0.5 with exponential decay along Y

precision mediump float;

uniform vec3 uColor;        // laser color
uniform float uIntensity;   // overall intensity multiplier
uniform float uFalloff;     // exponential falloff factor (larger -> sharper)
uniform float uWidth;       // half-width of bright core in UV space

varying vec2 vUv;

void main() {
  // distance from the laser center line at y = 0.5
  float dy = abs(vUv.y - 0.5);

  // flat bright core up to uWidth, then exponential decay beyond
  float d = max(dy - uWidth, 0.0);
  float intensity = exp(-d * uFalloff) * uIntensity;

  vec3 color = uColor * intensity;
  gl_FragColor = vec4(color, intensity);
}


