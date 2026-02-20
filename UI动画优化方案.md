# UI 动画与沉浸式体验优化方案

## 一、现状分析

### 已有资源
- **动画库**：`motion`（Framer Motion v12）已安装
- **样式**：TailwindCSS 4 + shadcn/ui + 自定义主题色（cheese/wood/night）
- **CSS 动画**：fadeIn、slideUp、pulse-soft、shake 已定义
- **图标**：lucide-react

### 缺少的
- 角色形象（贪睡鼠、奶酪大盗、背锅鼠）
- 阶段过渡动画
- 骰子动画
- 主题背景（夜晚/白天/投票等）
- 音效

## 二、角色形象方案

### 2.1 SVG 内联插画（推荐）

为三个角色设计风格统一的 SVG 插画，直接作为 React 组件使用：

| 角色 | 风格 | 配色 |
|------|------|------|
| 贪睡鼠 SLEEPY | 圆润可爱的老鼠，戴睡帽，半闭眼 | 绿色系 (#22C55E) |
| 奶酪大盗 THIEF | 戴面具/斗篷的老鼠，狡黠表情 | 红色系 (#EF4444) |
| 背锅鼠 SCAPEGOAT | 无辜表情的老鼠，头顶问号 | 紫色系 (#A855F7) |
| 奶酪 | 三角形奶酪块，带孔洞 | 黄色系 (#FBBF24) |
| 骰子 | 圆角立方体，点数面 | 白色/木色 |

### 2.2 文件结构

```
client/src/
  assets/
    characters/
      SleepyMouse.tsx      -- 贪睡鼠 SVG 组件
      ThiefMouse.tsx        -- 奶酪大盗 SVG 组件
      ScapegoatMouse.tsx    -- 背锅鼠 SVG 组件
      Cheese.tsx            -- 奶酪 SVG
      DiceFace.tsx          -- 骰子面 SVG
    backgrounds/
      StarField.tsx         -- 夜晚星空背景
      SunBurst.tsx          -- 白天阳光背景
  components/
    animations/
      PhaseTransition.tsx   -- 阶段切换过渡动画
      DiceRoller.tsx        -- 骰子滚动动画
      CardReveal.tsx        -- 身份翻牌动画
      CountdownRing.tsx     -- 环形倒计时
      SpeakerBubble.tsx     -- 说话气泡动画
    game/
      (现有 6 个 View 增强)
```

## 三、各阶段视觉设计

### 3.1 首页 HomePage
- 大标题 "奶酪大盗" 带奶酪 SVG 装饰
- 背景：深木色渐变 + 微弱粒子漂浮（奶酪碎屑）
- 按钮入场动画：stagger 延迟滑入

### 3.2 大厅 LobbyPage
- 玩家列表：每个玩家卡片带头像圈和在线脉冲指示
- 设置区域带图标装饰
- "开始游戏" 按钮带脉冲光晕

### 3.3 发牌 DealingView
- **身份翻牌动画**：卡片从背面翻转到正面，显示角色插画
- 骰子从天而降的弹跳动画
- 角色专属的背景色微调（大盗红光、贪睡鼠绿光）
- 选择骰子时的高亮脉冲

### 3.4 夜晚 NightView（核心场景）
- **背景**：深蓝/紫色渐变 + 星空动画（闪烁的星星）
- **月亮**：顶部悬挂的月亮 SVG
- **骰子叫号**：大号骰子从中间弹出，带旋转动画
- **醒来提示**：眼睛睁开的动画
- 偷奶酪动画：奶酪从画面滑出
- 查看骰子：翻转显示点数
- 倒计时环形进度条（替代纯数字）
- 继续按钮带柔和脉冲

### 3.5 帮凶选择 AccompliceView
- 暗色主题 + 红色边框的候选人卡片
- 选中时的聚光灯效果

### 3.6 白天 DayView
- **背景**：暖色调 + 阳光放射效果
- 聊天气泡带入场动画（从底部滑入）
- 倒计时条在顶部，渐变从绿到红
- 语音说话时头像边框发光

### 3.7 投票 VoteView
- 玩家卡片排列，点击选择带缩放效果
- 投票后显示票数动画（数字弹跳递增）
- "已投票" 的灰度 + 勾选标记

### 3.8 结果 ResultView（高潮场景）
- **揭示动画**：被投出的玩家卡片翻转显示真实身份
- 胜利方的大字标题 + 五彩纸屑/撒花效果
- 贪睡鼠胜利：绿色主题 + 奶酪归还动画
- 大盗胜利：红色主题 + 奶酪逃走动画
- 背锅鼠胜利：紫色惊叹号效果
- 全员身份揭露列表动画

## 四、动画组件设计

### 4.1 PhaseTransition（阶段过渡）

每次阶段切换时播放全屏过渡动画：

```
夜晚 → 白天：黑幕渐亮为白色，太阳升起
白天 → 投票：画面暗角收缩
投票 → 结果：聚光灯效果
结果 → 大厅：淡出回到大厅
```

实现方式：
- 包裹在 `AnimatePresence` 中
- 每个阶段组件用 `motion.div` 包裹
- 定义 `initial` / `animate` / `exit` 变体

### 4.2 DiceRoller（骰子动画）

夜晚叫号时的骰子动画：
- 骰子从小到大弹出（scale 0 → 1 + bounce）
- 旋转显示点数（rotate 360）
- 停留展示后缩小到角落

### 4.3 CountdownRing（环形倒计时）

替代纯数字倒计时：
- SVG 圆环，stroke-dashoffset 动画
- 剩余时间 > 10s：绿色
- 剩余时间 5-10s：黄色
- 剩余时间 < 5s：红色 + 脉冲

### 4.4 CardReveal（翻牌）

发牌阶段的身份揭示：
- CSS 3D transform: rotateY 翻转
- 背面：统一的卡背图案（木纹/老鼠剪影）
- 正面：角色插画 + 名称 + 描述

## 五、技术方案

### 5.1 动画引擎选择

| 场景 | 工具 |
|------|------|
| 组件入场/退场 | Framer Motion `AnimatePresence` |
| 列表 stagger | Framer Motion `staggerChildren` |
| 环形进度条 | SVG + CSS animation |
| 3D 翻牌 | CSS `perspective` + `rotateY` |
| 粒子/撒花 | CSS keyframes（轻量） |
| 背景星空 | CSS `@keyframes` + 多层 `box-shadow` |

### 5.2 性能注意

- 所有动画只用 `transform` 和 `opacity`（GPU 加速）
- 避免 `layout` 类动画（width/height/margin 变化）
- SVG 角色用 `will-change: transform` 预提示
- 星空背景用 `position: fixed` 避免重绘
- 低端设备提供 `prefers-reduced-motion` 降级

## 六、实现优先级

### P0 - 核心体验（先做）
1. PhaseTransition 阶段过渡动画
2. DealingView 翻牌动画 + 角色插画
3. NightView 星空背景 + 骰子弹出动画
4. ResultView 揭示动画 + 胜利效果
5. CountdownRing 环形倒计时

### P1 - 增强体验
6. DayView 阳光背景 + 聊天气泡动画
7. VoteView 选择效果 + 票数动画
8. 首页/大厅美化
9. AccompliceView 聚光灯效果

### P2 - 锦上添花
10. 音效（点击、翻牌、胜利等）
11. 粒子/撒花特效
12. 触觉反馈（Vibration API）

## 七、文件变更预览

```
新增：
  client/src/assets/characters/SleepyMouse.tsx
  client/src/assets/characters/ThiefMouse.tsx
  client/src/assets/characters/ScapegoatMouse.tsx
  client/src/assets/characters/Cheese.tsx
  client/src/assets/characters/DiceFace.tsx
  client/src/assets/backgrounds/StarField.tsx
  client/src/components/animations/PhaseTransition.tsx
  client/src/components/animations/DiceRoller.tsx
  client/src/components/animations/CardReveal.tsx
  client/src/components/animations/CountdownRing.tsx

修改：
  client/src/pages/GamePage.tsx          -- 包裹 PhaseTransition
  client/src/components/game/DealingView.tsx   -- 翻牌 + 角色插画
  client/src/components/game/NightView.tsx     -- 星空 + 骰子动画
  client/src/components/game/DayView.tsx       -- 阳光 + 气泡
  client/src/components/game/VoteView.tsx      -- 选择效果
  client/src/components/game/ResultView.tsx    -- 揭示 + 胜利
  client/src/styles/globals.css               -- 新增动画 keyframes
```

## 八、你需要做的

1. 确认方案和优先级
2. 如果有美术素材（角色图片），提供给我，我来集成
3. 如果没有美术素材，我用 SVG 代码绘制简洁风格的角色（代码内联，无需外部文件）
