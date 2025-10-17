precision mediump float;

varying float vHalfCoord; // -1..+1 across width
varying float vU;         // 0..1 along the curve

uniform float uTime;
uniform vec3 uColor;
uniform float uIntensity;
uniform float uFalloff;   // width falloff across vHalfCoord
uniform float uSpeed;
uniform float uCore;      // head sigma along vU
uniform float uTail;      // tail length along vU
uniform float uHeadBoost; // head brightness multiplier

void main(){
  // softer falloff across width with additional smoothing
  float d = abs(vHalfCoord);
  float lineMask = exp(-d * uFalloff * 0.3); // reduced falloff strength
  // additional soft edge smoothing
  float softEdge = smoothstep(0.8, 1.0, d);
  lineMask *= (1.0 - softEdge * 0.7);

  // comet head position along the curve [0,1)
  float head = fract(uTime * uSpeed);
  
  // Calculate distance with wrapping support for seamless loop
  float du = vU - head;
  // Handle wrapping: if du > 0.5, consider it as negative (tail from previous cycle)
  if (du > 0.5) du -= 1.0;
  // Handle wrapping: if du < -0.5, consider it as positive (head from next cycle)
  if (du < -0.5) du += 1.0;

  // Only render behind the head (du <= 0), completely transparent ahead
  if (du > 0.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }

  // head only contributes behind head (du <= 0)
  float sigma = max(uCore, 1e-4);
  float headMask = exp(-(du*du) / (2.0 * sigma * sigma));
  float tailMask = exp(-max(-du, 0.0) * uTail);
  float comet = (headMask * uHeadBoost + tailMask) * lineMask;

  float intensity = comet * uIntensity;
  vec3 col = uColor * intensity;
  gl_FragColor = vec4(col, intensity);
}

