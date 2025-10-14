varying float vAlpha;
varying float vLinePosition; // 0.0 = 起点, 1.0 = 终点
uniform float time;
uniform float lineIndex; // 每条线的索引

void main() {
  vAlpha = 1.0;
  
  // 使用position来判断是起点还是终点
  // 在LineSegments中，每两个顶点形成一条线
  // gl_VertexID % 2 == 0 是起点，== 1 是终点
  // 但在GLSL中没有gl_VertexID，我们用一个技巧：
  // 通过position.w或其他方式传递，这里简化为用uv.x
  vLinePosition = uv.x; // 假设uv.x在0-1之间表示线段位置
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

