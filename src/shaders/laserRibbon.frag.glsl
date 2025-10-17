// Fragment shader for ribbon with laser-like exponential core
precision mediump float;

uniform vec3 uColor;
uniform float uIntensity;   // overall brightness
uniform float uFalloff;     // exponential falloff across width (higher -> thinner)

varying float vHalfCoord; // -1..+1 across ribbon

void main() {
  float d = abs(vHalfCoord);            // distance from center line
  float intensity = exp(-d * uFalloff) * uIntensity;
  vec3 color = uColor * intensity;
  gl_FragColor = vec4(color, intensity);
}


