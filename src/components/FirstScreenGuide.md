# FirstScreen 组件使用指南

## 概述
`FirstScreen` 组件是一个完整的第一屏HTML内容组件，使用Tailwind的12列grid系统进行布局。

## 组件结构

### 1. 导航栏 (col-span-12)
- 左侧：项目标题
- 右侧：导航链接（桌面端）和汉堡菜单（移动端）
- 响应式设计

### 2. 主标题区域 (col-span-8, col-start-3)
- 居中8列布局
- 主标题、描述文字和行动按钮
- 响应式字体大小

### 3. 特性介绍 (3列布局)
- 三个特性卡片，每列4列宽度
- 响应式：桌面3列，平板2列，手机1列
- 悬停效果

### 4. 底部信息 (col-span-12)
- 全宽布局
- 版权信息和链接

## 使用方法

```jsx
import FirstScreen from './components/FirstScreen';

function HomePage() {
  return (
    <div className="relative">
      {/* Canvas背景 */}
      <Canvas className="absolute inset-0">
        {/* 你的3D内容 */}
      </Canvas>
      
      {/* HTML内容 */}
      <FirstScreen />
    </div>
  );
}
```

## 布局特点

### Grid布局
```jsx
// 基础容器
<div className="grid grid-cols-12 gap-6 px-16 md:px-8 sm:px-4">

// 居中8列
<div className="col-span-8 col-start-3">

// 3列布局
<div className="col-span-4 col-start-1">
<div className="col-span-4 col-start-5">
<div className="col-span-4 col-start-9">

// 全宽
<div className="col-span-12">
```

### 响应式设计
- **Desktop**: 12列，64px padding
- **Tablet**: 12列，32px padding，部分布局调整
- **Mobile**: 12列，16px padding，单列布局

## 自定义修改

### 修改内容
```jsx
// 修改标题
<h1 className="text-6xl md:text-5xl sm:text-4xl font-light mb-6 leading-tight">
  你的标题
</h1>

// 修改描述
<p className="text-xl md:text-lg sm:text-base opacity-80 mb-8 max-w-2xl mx-auto">
  你的描述文字
</p>
```

### 修改按钮
```jsx
// 主要按钮
<a 
  href="/chapter-1" 
  className="bg-white text-black px-8 py-3 rounded-full hover:bg-gray-200 transition-colors font-medium"
>
  进入第一章
</a>

// 次要按钮
<a 
  href="#explore" 
  className="border border-white px-8 py-3 rounded-full hover:bg-white hover:text-black transition-colors font-medium"
>
  探索更多
</a>
```

### 修改特性卡片
```jsx
<div className="col-span-4 col-start-1">
  <div className="p-6 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors">
    <div className="w-12 h-12 bg-blue-500 rounded-lg mb-4"></div>
    <h3 className="text-xl font-semibold mb-3">你的标题</h3>
    <p className="text-gray-400">
      你的描述内容
    </p>
  </div>
</div>
```

## 样式特点

- **深色主题**: 黑色背景，白色文字
- **现代设计**: 圆角、悬停效果、过渡动画
- **响应式**: 完整的移动端适配
- **可访问性**: 良好的对比度和交互反馈

## 与Canvas集成

组件设计为与Canvas背景配合使用：

```jsx
<div className="relative">
  {/* Canvas在底层 */}
  <Canvas className="absolute inset-0 z-0">
    {/* 3D内容 */}
  </Canvas>
  
  {/* HTML内容在顶层 */}
  <FirstScreen />
</div>
```

HTML内容会自动叠加在Canvas之上，形成完整的用户体验。
