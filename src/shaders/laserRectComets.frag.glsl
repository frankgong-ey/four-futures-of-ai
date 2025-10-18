// Single-lane comet moving left->right ALONG the base laser line at y=0.5
precision mediump float;

varying vec2 vUv;

uniform float uTime;         // seconds
uniform vec3 uColor;         // color
uniform float uIntensity;    // brightness multiplier
uniform float uSpeed;        // horizontal speed
uniform float uCore;         // comet head size (sigma in UV.x)
uniform float uTail;         // tail length (falloff)
uniform float uHeadBoost;    // extra brightness for head vs tail

// base laser uniforms for straight line at y=0.5
uniform float uWidth;        // half-width of bright core in UV.y
uniform float uFalloff;      // exponential falloff from core (UV.y)

float hash(float n){ return fract(sin(n)*43758.5453123); }

void main(){
  // Base straight laser intensity (same as static laser)
  float dy = abs(vUv.y - 0.5);
  float d = max(dy - uWidth, 0.0);
  float baseIntensity = exp(-d * uFalloff) * uIntensity;

  // Vertical mask to constrain the comet strictly to the laser line
  float lineMask = 1.0 - smoothstep(uWidth, uWidth + 0.02, dy);

  // Time
  float t = uTime;

  // comet head x position wraps [0,1)
  float head = fract(t * uSpeed);

  // distance to head along x
  float dx = vUv.x - head;

  // Gaussian head (bigger bright spot), only behind the head (dx <= 0)
  float sigma = max(uCore, 1e-4);
  float headMask = exp(-(dx*dx) / (2.0 * sigma * sigma)) * step(dx, 0.0);
  float tailMask = exp(-max(-dx, 0.0) * uTail);
  float comet = (headMask * uHeadBoost + tailMask) * lineMask;

  // total intensity = base straight laser + comet overlay
  float intensity = baseIntensity + comet * uIntensity;
  vec3 col = uColor * intensity;
  gl_FragColor = vec4(col, intensity);
}

