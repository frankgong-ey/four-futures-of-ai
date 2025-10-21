attribute float fadeOffset;  // 每个顶点/线段的随机偏移（由几何提供）
varying float vAlpha;
varying float vLinePosition; // 0.0 = 起点, 1.0 = 终点
varying float vFadeOffset;   // 传递到片元着色器
uniform float time;

void main() {
  vAlpha = 1.0;
  
  // 使用position来判断是起点还是终点
  // 在LineSegments中，每两个顶点形成一条线
  // gl_VertexID % 2 == 0 是起点，== 1 是终点
  // 但在GLSL中没有gl_VertexID，我们用一个技巧：
  // 通过position.w或其他方式传递，这里简化为用uv.x
  vLinePosition = uv.x; // 假设uv.x在0-1之间表示线段位置
  
  // 从自定义 attribute 读取每段的随机偏移
  // Three.js 会把名为 'fadeOffset' 的 BufferAttribute 传入这里
  vFadeOffset = fadeOffset;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

