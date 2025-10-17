precision mediump float;

varying vec2 vUv;

uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;

// simple noise-ish function using sin/cos mixes
float hash(vec2 p){
  return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
}

float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f*f*(3.0-2.0*f);
  return mix(a, b, u.x) + (c - a)*u.y*(1.0 - u.x) + (d - b)*u.x*u.y;
}

void main(){
  vec2 uv = vUv;
  // center and scale
  vec2 p = (uv - 0.5) * 2.0;
  float t = uTime * uSpeed;

  // layered noise to drive a smooth gradient mix
  float n = 0.0;
  n += 0.6 * noise(p * 1.2 + vec2(t * 0.15, -t * 0.12));
  n += 0.3 * noise(p * 2.2 + vec2(-t * 0.1, t * 0.2));
  n += 0.1 * noise(p * 4.5 + vec2(t * 0.05, t * 0.07));
  n = smoothstep(0.2, 0.8, n);

  vec3 col = mix(uColorA, uColorB, n);
  gl_FragColor = vec4(col, 1.0);
}

