uniform sampler2D uTexture;
uniform float uOpacity;
uniform vec3 uWorldPosition;
uniform float uTime;
uniform float uResolution;

varying vec2 vUv;
varying vec3 vPosition;

float getLuminance(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
}

void main() {
    // 获取纹理颜色
    vec4 textureColor = texture2D(uTexture, vUv);
    
    // 计算当前像素在图片中的世界位置
    // vUv.x = 0 表示图片最左边，vUv.x = 1 表示图片最右边
    // 图片宽度假设为3单位，所以像素的世界x坐标 = 图片中心x + (vUv.x - 0.5) * 3
    float imageWidth = 4.0; // 图片宽度
    float pixelWorldX = uWorldPosition.x + (vUv.x - 0.5) * imageWidth;
    
    // 计算图片中心是否已经超过y轴
    float imageCenterX = uWorldPosition.x;
    
    // 计算图片经过y轴的进度 (0.0 = 刚开始经过, 1.0 = 完全经过)
    float transitionProgress = clamp((imageCenterX + 1.5) / 3.0, 0.0, 1.0);
    
    // 根据进度调整马赛克分辨率
    // 开始时分辨率很低(马赛克很大)，结束时分辨率很高(接近原图)
    float baseResolution = uResolution > 0.0 ? uResolution : 20.0;
    float minResolution = 1.0;  // 最粗糙的马赛克（分辨率1）
    float maxResolution = 100.0; // 最精细的马赛克
    
    // 使用平滑插值
    float currentResolution = mix(minResolution, maxResolution, smoothstep(0.0, 1.0, transitionProgress));
    
    // 每个"马赛克块"的大小
    vec2 cellSize = vec2(1.0 / currentResolution);
    
    // 计算当前像素属于哪个马赛克块
    vec2 cellCoord = floor(vUv / cellSize);
    vec2 cellCenter = cellCoord * cellSize + cellSize * 0.5;
    
    // 采样该马赛克块中心的纹理颜色
    vec3 cellColor = texture2D(uTexture, cellCenter).rgb;
    
    // 当分辨率为1时，显示深灰色马赛克
    if (currentResolution <= 1.1) {
        cellColor = vec3(0.1, 0.1, 0.1); // 深灰色
    }
    
    // 根据进度混合马赛克效果和原图
    vec3 originalColor = texture2D(uTexture, vUv).rgb;
    vec3 finalColor = mix(cellColor, originalColor, transitionProgress);
    
    // 添加白色边框效果（只保留上下边框）
    float borderWidth = 0.01; // 边框宽度
    float border = smoothstep(0.0, borderWidth, vUv.y) * 
                  smoothstep(0.0, borderWidth, 1.0 - vUv.y);
    
    // 混合边框颜色和最终颜色
    vec3 borderColor = vec3(0.15, 0.15, 0.15); // 白色边框
    finalColor = mix(borderColor, finalColor, border);
    
    gl_FragColor = vec4(finalColor, uOpacity);
}
