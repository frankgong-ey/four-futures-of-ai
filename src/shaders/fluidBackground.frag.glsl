uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform float uSpeed;
uniform float uNoiseScale;
uniform float uIntensity;
uniform float uOpacity;

varying vec2 vUv;
varying vec3 vPosition;

// 噪声函数
float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// 平滑噪声
float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// 分形噪声
float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 4; i++) {
        value += amplitude * smoothNoise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }
    
    return value;
}

void main() {
    vec2 uv = vUv;
    
    // 创建流动的噪声
    float time = uTime * uSpeed;
    vec2 flow = vec2(
        fbm(uv * uNoiseScale + time * 0.1),
        fbm(uv * uNoiseScale + time * 0.15 + 100.0)
    );
    
    // 创建多层噪声
    float noise1 = fbm(uv * uNoiseScale + flow + time * 0.05);
    float noise2 = fbm(uv * uNoiseScale * 2.0 + flow * 2.0 + time * 0.08);
    float noise3 = fbm(uv * uNoiseScale * 4.0 + flow * 4.0 + time * 0.12);
    
    // 混合噪声
    float combinedNoise = mix(noise1, noise2, 0.5) * 0.7 + noise3 * 0.3;
    
    // 创建径向渐变
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(uv, center);
    float radial = 1.0 - smoothstep(0.0, 0.7, dist);
    
    // 组合噪声和径向渐变
    float finalNoise = mix(combinedNoise, radial, 0.3);
    
    // 创建颜色混合
    vec3 color = mix(uColor1, uColor2, finalNoise);
    color = mix(color, uColor3, finalNoise * 0.7);
    color = mix(color, uColor4, finalNoise * 0.5);
    
    // 应用强度
    color *= uIntensity;
    
    // 边缘衰减
    float edgeFade = 1.0 - smoothstep(0.8, 1.0, dist);
    color *= edgeFade;
    
    gl_FragColor = vec4(color, uOpacity);
}
