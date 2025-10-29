# 投票功能设置指南

## 概述

已创建两个新组件：
1. **VotingSection** - 投票页面（替换 NextChapterSection）
2. **ResultsSummarySection** - 投票结果展示页面

## 文件结构

```
src/app/
├── futures/
│   ├── page.jsx              # 主探索页面
│   └── components/
│       ├── DetailView.jsx          # 详情弹窗
│       ├── FutureSection.jsx      # 未来展示卡片
│       ├── FuturesOverview.jsx    # 未来列表
│       ├── HeroSection.jsx        # 英雄区域
│       └── NextChapterSection.jsx # CTA 按钮，引导到投票页面
├── vote/
│   ├── page.jsx               # 投票页面（独立页面，URL: /vote）
│   └── VotingSection.jsx      # 投票页面组件
└── results/
    ├── page.jsx                # 结果页面（独立页面，URL: /results）
    └── ResultsSummarySection.jsx # 结果展示组件

src/lib/
└── supabase.js                # Supabase 配置（预留）
```

## 下一步：连接 Supabase

### 1. 安装 Supabase 客户端
```bash
npm install @supabase/supabase-js
```

### 2. 更新 src/lib/supabase.js
```javascript
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'your-supabase-url'
const SUPABASE_ANON_KEY = 'your-supabase-anon-key'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

### 3. 创建数据库表
在 Supabase 中创建 `votes` 表：

```sql
CREATE TABLE votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  future_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. 更新 VotingSection.jsx

在 `handleVote` 函数中取消注释并更新：

```javascript
import { supabase } from '@/lib/supabase';

const handleVote = async () => {
  if (!selectedFuture) return;
  setIsVoting(true);
  
  try {
    const { data, error } = await supabase
      .from('votes')
      .insert([{ 
        future_id: selectedFuture,
        created_at: new Date() 
      }]);
    
    if (error) throw error;
    
    // 跳转到结果页面
    router.push(`/futures/results?vote=${selectedFuture}`);
  } catch (error) {
    console.error('Error submitting vote:', error);
  } finally {
    setIsVoting(false);
  }
};
```

### 5. 获取投票结果

在 `ResultsSummarySection.jsx` 中：

```javascript
import { supabase } from '@/lib/supabase';

// 获取总票数
const { data: totalVotes } = await supabase
  .from('votes')
  .select('future_id', { count: 'exact' });

// 计算百分比
const results = await supabase
  .from('votes')
  .select('future_id')
  .then(data => {
    // 计算每个 future 的百分比
    // ...计算逻辑
  });
```

## 创建结果页面

创建 `src/app/futures/results/page.jsx`:

```javascript
"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ResultsSummarySection from '../components/ResultsSummarySection';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const userVote = searchParams.get('vote');
  
  // 从 Supabase 获取实际结果
  const [results, setResults] = useState(null);
  
  useEffect(() => {
    // TODO: 从 Supabase 获取结果
    fetchResults();
  }, []);
  
  return results ? <ResultsSummarySection results={results} userVote={userVote} /> : <div>Loading...</div>;
}
```

## 当前状态

✅ 投票页面 UI 完成
✅ 结果页面 UI 完成  
✅ 组件架构就绪
✅ 独立页面创建完成
✅ 路由跳转实现完成
✅ 导航按钮添加完成
⏳ Supabase 集成（预留）
⏳ 数据获取逻辑

## 页面结构

### 1. `/futures` - 主探索页面
- 版本选择
- 四个未来展示
- 底部 CTA 引导到投票页面

### 2. `/vote` - 投票页面（独立）
- 四个未来卡片选择
- 底部返回按钮
- 投票后跳转到结果页面
- **URL 更简洁，便于推广**

### 3. `/results` - 结果页面（独立）
- 显示投票统计
- 圆形图表可视化
- "You" 指示器
- 返回和再投票按钮
- **URL 更简洁，便于分享**

## 设计参考

- 投票页面：深色背景，四个卡片横向排列，点击选择，底部有 Vote Now 按钮
- 结果页面：左侧显示百分比，右侧显示圆形图表，"You" 指示器显示用户选择

