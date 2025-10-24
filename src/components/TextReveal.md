# TextReveal 文字升起效果模块

一个可复用的文字升起动画效果模块，可以轻松应用到任何文字内容上。

## 功能特点

- 🎬 **自动文字分割** - 使用SplitText自动按行分割文字
- 🎭 **遮罩升起效果** - 文字从下方升起，带有边界线效果
- ⚡ **高性能** - 优化的动画性能，自动清理资源
- 🎛️ **高度可配置** - 支持多种动画参数自定义
- 🔄 **可复用** - 支持Hook和组件两种使用方式

## 使用方法

### 1. 组件方式（推荐）

```jsx
import TextReveal from '../components/TextReveal';

// 基础使用
<TextReveal>
  Your text content here
</TextReveal>

// 自定义配置
<TextReveal
  delay={0.5}        // 动画开始延迟（秒）
  duration={0.8}     // 每行动画持续时间（秒）
  stagger={0.3}      // 每行间隔时间（秒）
  ease="power3.out"  // 缓动函数
  className="text-4xl font-bold"
  as="h1"            // 渲染为h1标签
>
  Will you shape the future of AI,
</TextReveal>
```

### 2. Hook方式

```jsx
import { useTextReveal } from '../hooks/useTextReveal';

function MyComponent() {
  const { textRef, startAnimation, stopAnimation, resetAnimation } = useTextReveal({
    delay: 0.5,
    duration: 0.8,
    stagger: 0.3,
    ease: "power3.out",
    enabled: true
  });

  return (
    <div ref={textRef}>
      Your text content here
    </div>
  );
}
```

## 配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `delay` | number | 0.5 | 动画开始延迟时间（秒） |
| `duration` | number | 0.8 | 每行动画持续时间（秒） |
| `stagger` | number | 0.3 | 每行间隔时间（秒） |
| `ease` | string | "power3.out" | GSAP缓动函数 |
| `enabled` | boolean | true | 是否启用动画 |
| `className` | string | "" | CSS类名 |
| `style` | object | {} | 内联样式 |
| `as` | string | "div" | 渲染的HTML标签 |

## 使用场景

### 1. 标题动画
```jsx
<TextReveal as="h1" className="text-6xl font-bold" delay={0.5}>
  Welcome to Our Website
</TextReveal>
```

### 2. 段落文字
```jsx
<TextReveal as="p" className="text-lg" stagger={0.2}>
  This is a longer paragraph that will be split into multiple lines
  and each line will animate with a stagger effect.
</TextReveal>
```

### 3. 按钮文字
```jsx
<TextReveal as="button" className="btn-primary" duration={0.5}>
  Click Me
</TextReveal>
```

### 4. 多段文字协调
```jsx
<TextReveal delay={0.5}>
  First paragraph
</TextReveal>

<TextReveal delay={1.5}>
  Second paragraph
</TextReveal>

<TextReveal delay={2.5}>
  Third paragraph
</TextReveal>
```

## 高级用法

### 手动控制动画
```jsx
function AdvancedExample() {
  const { textRef, startAnimation, stopAnimation, resetAnimation } = useTextReveal({
    enabled: false // 禁用自动启动
  });

  const handleClick = () => {
    startAnimation();
  };

  return (
    <div>
      <div ref={textRef}>Controlled text animation</div>
      <button onClick={handleClick}>Start Animation</button>
    </div>
  );
}
```

### 响应式动画
```jsx
function ResponsiveExample() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextReveal enabled={isVisible} delay={0}>
      Text that animates when visible
    </TextReveal>
  );
}
```

## 性能优化

- ✅ 自动清理SplitText实例，防止内存泄漏
- ✅ 使用useCallback优化函数创建
- ✅ 支持动画的启动、停止和重置
- ✅ 错误处理和边界情况处理

## 注意事项

1. 确保文字内容在DOM中完全渲染后再启动动画
2. 避免在短时间内重复创建动画实例
3. 在组件卸载时会自动清理所有资源
4. 支持响应式设计，会自动适应不同屏幕尺寸的文字换行
