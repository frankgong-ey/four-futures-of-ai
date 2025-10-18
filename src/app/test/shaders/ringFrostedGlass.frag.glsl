precision mediump float;

uniform vec3 uColor;
uniform float uOpacity;
uniform float uGradientStrength;
uniform float uTime;
uniform float uNoiseScale;
uniform float uFrostIntensity;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;

// 简单的噪声函数
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// 2D噪声函数
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// 分形噪声
float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;
    
    for (int i = 0; i < 4; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    // 磨砂玻璃效果
    vec2 noiseUV = vUv * uNoiseScale + uTime * 0.2;
    float noiseValue = fbm(noiseUV);
    
    // 添加额外的噪声层来增强效果
    float noiseValue2 = fbm(noiseUV * 2.0 + uTime * 0.15);
    noiseValue = mix(noiseValue, noiseValue2, 0.5);
    
    // 创建磨砂效果 - 在透明度上添加轻微的噪声变化
    float frostedAlpha = uOpacity * (1.0 - noiseValue * uFrostIntensity * 0.3);
    
    // 添加更明显的颜色变化来模拟玻璃的折射
    vec3 frostedColor = uColor;
    frostedColor += noiseValue * 0.3 * vec3(0.7, 0.8, 1.0); // 更明显的蓝色调
    frostedColor += sin(noiseValue * 10.0) * 0.1 * vec3(1.0, 1.0, 1.0); // 添加闪烁效果
    
    // 输出颜色
    gl_FragColor = vec4(frostedColor, frostedAlpha);
}
