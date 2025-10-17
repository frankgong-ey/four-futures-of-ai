// 全局动画管理器
class AnimationManager {
  constructor() {
    this.activeAnimations = new Set();
    this.animationQueue = [];
    this.isProcessing = false;
  }

  // 请求开始动画
  requestAnimation(id, animationFunction) {
    // 如果已经有相同的动画在进行，先停止它
    if (this.activeAnimations.has(id)) {
      this.stopAnimation(id);
    }

    // 添加到队列
    this.animationQueue.push({ id, animationFunction });
    
    // 处理队列
    this.processQueue();
  }

  // 停止指定动画
  stopAnimation(id) {
    if (this.activeAnimations.has(id)) {
      this.activeAnimations.delete(id);
      // 这里可以添加具体的停止逻辑
    }
  }

  // 处理动画队列
  processQueue() {
    if (this.isProcessing || this.animationQueue.length === 0) return;

    this.isProcessing = true;
    const { id, animationFunction } = this.animationQueue.shift();

    // 标记动画为活跃
    this.activeAnimations.add(id);

    // 执行动画
    const cleanup = animationFunction(() => {
      // 动画完成回调
      this.activeAnimations.delete(id);
      this.isProcessing = false;
      
      // 继续处理队列
      setTimeout(() => this.processQueue(), 50);
    });

    // 存储清理函数
    if (cleanup) {
      this.activeAnimations.set(id, cleanup);
    }
  }

  // 清理所有动画
  clearAll() {
    this.activeAnimations.forEach((cleanup, id) => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    });
    this.activeAnimations.clear();
    this.animationQueue = [];
    this.isProcessing = false;
  }
}

// 创建全局实例
const animationManager = new AnimationManager();

export default animationManager;
