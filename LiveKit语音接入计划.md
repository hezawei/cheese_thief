# LiveKit 语音接入计划

## 一、架构总览

```
浏览器 (React)                    游戏服务器 (Node.js)              LiveKit Server (SFU)
+-----------------+               +------------------+              +----------------+
| Socket.IO       |<-- 游戏逻辑 ->| Socket.IO        |              |                |
| LiveKit Client  |<-- 音频流 --->|                  |-- REST API ->| 房间管理       |
| SDK             |               | livekit-server   |              | 音频路由       |
|                 |               | -sdk (生成Token) |              | 权限控制       |
+-----------------+               +------------------+              +----------------+
```

**核心原则：**
- Socket.IO 只负责游戏逻辑，不传输音频
- LiveKit 只负责实时音频传输和路由
- 游戏服务器通过 LiveKit Server SDK 控制房间权限（谁能说话、谁被静音）
- 客户端通过 LiveKit Client SDK 连接音频房间

## 二、LiveKit 选型理由

| 特性 | 说明 |
|------|------|
| 开源免费 | 可自托管，无费用限制 |
| SFU 架构 | 服务端转发，多人同时说话无冲突 |
| 服务端权限控制 | 可通过 API 强制静音/解除静音 |
| 房间模型 | 与游戏房间概念天然对应 |
| JS SDK | 前后端都有成熟 SDK |
| 低延迟 | WebRTC 底层，延迟 < 200ms |

## 三、游戏阶段语音规则

### 3.1 各阶段语音权限矩阵

| 阶段 | 所有人可说话 | 静音策略 | 说明 |
|------|-------------|----------|------|
| LOBBY | 是 | 无限制 | 等待阶段自由聊天 |
| DEALING | 否 | 全员静音 | 看牌阶段保持安静 |
| NIGHT | 否 | 全员静音 | 夜晚不能说话（防止暴露身份） |
| ACCOMPLICE | 否 | 全员静音 | 帮凶选择阶段 |
| DAY | 是 | 无限制 | 讨论阶段，核心语音场景 |
| VOTING | 否 | 全员静音 | 投票阶段保持安静 |
| RESULT | 是 | 无限制 | 结果揭晓后自由讨论 |

### 3.2 关键规则约束

1. **夜晚绝对静音** — 防止玩家通过声音暴露身份（如被叫到号时发出声音）
2. **白天完全开放** — 讨论是游戏核心，不做任何发言限制
3. **投票时静音** — 防止投票时的言语影响
4. **服务端强制执行** — 客户端 UI 静音只是辅助，服务端通过 LiveKit API 强制控制

### 3.3 语音 vs 文字共存策略

- 白天阶段：语音为主要交流方式，文字聊天保留作为辅助（网络差时降级）
- 其他阶段：文字聊天不受语音静音影响，保持可用
- 客户端 UI 显示当前是否可以说话的状态指示

## 四、技术实现方案

### 4.1 依赖包

**服务端 (server/):**
```
livekit-server-sdk    -- 生成 Token + 服务端房间管理 API
```

**客户端 (client/):**
```
livekit-client        -- 浏览器端连接 LiveKit 房间
@livekit/components-react  -- React 组件（可选，用于快速搭建 UI）
```

### 4.2 环境变量

```env
# .env (server/)
LIVEKIT_URL=ws://localhost:7880        # LiveKit 服务器 WebSocket 地址
LIVEKIT_API_KEY=your_api_key           # LiveKit API Key
LIVEKIT_API_SECRET=your_api_secret     # LiveKit API Secret
```

### 4.3 服务端新增模块

#### 4.3.1 `server/src/voice/tokenService.ts`

职责：为玩家生成带权限的 LiveKit Token

```typescript
// 伪代码示意
import { AccessToken } from 'livekit-server-sdk';

export function createVoiceToken(
  roomCode: string,
  playerId: string,
  playerName: string,
  canPublish: boolean,     // 是否允许发布音频（说话）
): string {
  const token = new AccessToken(API_KEY, API_SECRET, {
    identity: playerId,
    name: playerName,
  });
  token.addGrant({
    room: `game-${roomCode}`,
    roomJoin: true,
    canPublish: canPublish,  // 控制是否能说话
    canSubscribe: true,      // 始终能听到别人
  });
  return token.toJwt();
}
```

#### 4.3.2 `server/src/voice/roomController.ts`

职责：通过 LiveKit Server API 控制房间权限

```typescript
// 伪代码示意
import { RoomServiceClient } from 'livekit-server-sdk';

const roomService = new RoomServiceClient(LIVEKIT_URL, API_KEY, API_SECRET);

// 全员静音
export async function muteAllParticipants(roomCode: string): Promise<void> {
  const participants = await roomService.listParticipants(`game-${roomCode}`);
  for (const p of participants) {
    await roomService.updateParticipant(`game-${roomCode}`, p.identity, undefined, {
      canPublish: false,
    });
  }
}

// 全员解除静音
export async function unmuteAllParticipants(roomCode: string): Promise<void> {
  const participants = await roomService.listParticipants(`game-${roomCode}`);
  for (const p of participants) {
    await roomService.updateParticipant(`game-${roomCode}`, p.identity, undefined, {
      canPublish: true,
    });
  }
}
```

#### 4.3.3 GameRoom 集成点

在阶段切换时调用语音控制：

```typescript
// GameRoom.ts 阶段切换时
private async startDayPhase(): void {
  this.phase = GamePhase.DAY;
  // ... 现有逻辑 ...
  await unmuteAllParticipants(this.roomCode);  // 白天解除静音
}

private async startVotePhase(): void {
  // ... 现有逻辑 ...
  await muteAllParticipants(this.roomCode);    // 投票全员静音
}

private async startNightPhase(): void {
  // ... 现有逻辑 ...
  await muteAllParticipants(this.roomCode);    // 夜晚全员静音
}
```

### 4.4 客户端新增模块

#### 4.4.1 `client/src/hooks/useVoice.ts`

职责：管理 LiveKit 连接生命周期

```typescript
// 伪代码示意
import { Room, RoomEvent, Track } from 'livekit-client';

export function useVoice() {
  const [room] = useState(() => new Room());
  const [connected, setConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [speaking, setSpeaking] = useState<Map<string, boolean>>(new Map());

  async function connect(token: string, serverUrl: string) {
    await room.connect(serverUrl, token);
    setConnected(true);
  }

  function disconnect() {
    room.disconnect();
    setConnected(false);
  }

  // 本地静音/解除静音（UI 层面，辅助服务端控制）
  async function toggleMute() {
    const localTrack = room.localParticipant.getTrackPublication(Track.Source.Microphone);
    if (localTrack) {
      await localTrack.mute(!localTrack.isMuted);
      setIsMuted(localTrack.isMuted);
    }
  }

  // 监听谁在说话（用于 UI 显示说话指示器）
  useEffect(() => {
    room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      const map = new Map<string, boolean>();
      for (const s of speakers) {
        map.set(s.identity, true);
      }
      setSpeaking(map);
    });
  }, [room]);

  return { room, connected, isMuted, speaking, connect, disconnect, toggleMute };
}
```

#### 4.4.2 `client/src/components/VoiceOverlay.tsx`

职责：语音状态悬浮组件，显示在游戏界面上

功能：
- 麦克风开关按钮
- 当前说话人指示（头像高亮）
- 连接状态指示
- 阶段性提示（"当前阶段已静音"）

### 4.5 Socket 事件新增

```typescript
// shared/events.ts 新增
C2S.REQUEST_VOICE_TOKEN: 'c2s:requestVoiceToken'   // 客户端请求语音 Token
S2C.VOICE_TOKEN: 's2c:voiceToken'                   // 服务端下发 Token
S2C.VOICE_STATE: 's2c:voiceState'                   // 语音状态同步（可选）
```

### 4.6 连接流程时序图

```
客户端                     游戏服务器                  LiveKit Server
  |                           |                           |
  |-- c2s:requestVoiceToken ->|                           |
  |                           |-- 生成 JWT Token          |
  |<- s2c:voiceToken ---------|                           |
  |                           |                           |
  |-- WebRTC 连接 ---------------------------------------->|
  |<- 音频流 ----------------------------------------------|
  |                           |                           |
  |     [阶段切换: DAY]       |                           |
  |                           |-- unmuteAll API --------->|
  |                           |                           |-- 允许发布音频
  |     [阶段切换: NIGHT]     |                           |
  |                           |-- muteAll API ----------->|
  |                           |                           |-- 禁止发布音频
```

## 五、竞态与并发问题处理

### 5.1 多人同时说话

**不是问题。** LiveKit 使用 SFU 架构，天然支持多人同时发送音频流，服务端独立转发给每个订阅者。不存在"抢麦"冲突。每个客户端独立接收所有其他人的音频流并混音播放。

### 5.2 阶段切换时的竞态

**问题：** 服务端调用 `muteAll` 是异步的，多个 participant 的更新是串行 REST 调用，期间可能有短暂的"部分静音"状态。

**解决方案：**
1. `Promise.allSettled` 并行发送所有静音请求，减少时间窗口
2. 客户端在收到阶段变更时立即本地静音（不等服务端 LiveKit 控制生效）
3. 服务端控制作为"兜底"保障，确保即使客户端没处理也会被强制静音

```typescript
// 改进后的 muteAll
async function muteAllParticipants(roomCode: string): Promise<void> {
  const participants = await roomService.listParticipants(`game-${roomCode}`);
  await Promise.allSettled(
    participants.map((p) =>
      roomService.updateParticipant(`game-${roomCode}`, p.identity, undefined, {
        canPublish: false,
      })
    )
  );
}
```

### 5.3 玩家中途加入/断线重连

**场景：** 玩家在某个阶段断线后重连，需要获得正确的语音权限。

**解决方案：**
1. 重连时重新请求 Voice Token
2. Token 中的 `canPublish` 根据当前游戏阶段动态设置
3. GameRoom 维护当前语音状态，用于生成正确的 Token

```typescript
function getCanPublishForPhase(phase: GamePhase): boolean {
  return phase === GamePhase.LOBBY
      || phase === GamePhase.DAY
      || phase === GamePhase.RESULT;
}
```

### 5.4 LiveKit 服务器不可用时的降级

**策略：** 语音是增强功能，不是核心依赖。

1. 连接 LiveKit 失败时，客户端显示"语音不可用"提示
2. 游戏流程完全不受影响，文字聊天始终可用
3. 服务端调用 LiveKit API 失败时 catch 错误并 log，不阻塞游戏逻辑

```typescript
// GameRoom 中的安全调用
private async safeVoiceControl(fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (err) {
    warn('voice', `LiveKit API error: ${err}`);
  }
}
```

## 六、需要你手动完成的步骤

### 6.1 安装 LiveKit Server

**方案 A：本地 Docker 安装（推荐开发环境）**

```bash
# 1. 确保已安装 Docker Desktop (Windows)
# 2. 拉取并运行 LiveKit Server
docker run --rm -p 7880:7880 -p 7881:7881 -p 7882:7882/udp \
  livekit/livekit-server \
  --dev \
  --bind 0.0.0.0

# --dev 模式会自动生成测试用的 API Key 和 Secret:
#   API Key:    devkey
#   API Secret: secret
```

**方案 B：LiveKit Cloud（无需自托管）**

1. 访问 https://cloud.livekit.io
2. 注册账号（有免费额度）
3. 创建项目，获取：
   - Server URL (wss://xxx.livekit.cloud)
   - API Key
   - API Secret

### 6.2 配置环境变量

在 `server/` 目录下创建 `.env` 文件：

```env
# 本地 Docker 方案
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret

# 或 LiveKit Cloud 方案
# LIVEKIT_URL=wss://your-project.livekit.cloud
# LIVEKIT_API_KEY=your_key
# LIVEKIT_API_SECRET=your_secret
```

### 6.3 安装依赖

```bash
# 服务端
cd server
npm install livekit-server-sdk dotenv

# 客户端
cd client
npm install livekit-client @livekit/components-react
```

### 6.4 测试麦克风权限

浏览器访问 `https://localhost:5173`（注意：**WebRTC 要求 HTTPS 或 localhost**）。
如果用手机局域网测试，需要：
1. Vite 开启 HTTPS（需要自签证书）
2. 或使用 ngrok/localtunnel 等隧道工具

## 七、实现步骤（代码编写顺序）

### Step 1: 基础设施
- [ ] 服务端安装 `livekit-server-sdk` 和 `dotenv`
- [ ] 客户端安装 `livekit-client`
- [ ] 创建 `server/.env` 配置文件
- [ ] 服务端加载 `.env`

### Step 2: Token 服务
- [ ] 创建 `server/src/voice/tokenService.ts`
- [ ] 实现 `createVoiceToken(roomCode, playerId, playerName, canPublish)`
- [ ] 新增 Socket 事件 `C2S.REQUEST_VOICE_TOKEN` / `S2C.VOICE_TOKEN`
- [ ] 在 `gameHandler.ts` 中注册 Token 请求处理

### Step 3: 服务端房间控制
- [ ] 创建 `server/src/voice/roomController.ts`
- [ ] 实现 `muteAllParticipants` / `unmuteAllParticipants`
- [ ] 在 `GameRoom.ts` 阶段切换处集成语音控制
- [ ] 添加错误降级处理 `safeVoiceControl`

### Step 4: 客户端连接
- [ ] 创建 `client/src/hooks/useVoice.ts`
- [ ] 实现 LiveKit Room 连接/断开/静音切换
- [ ] 在加入游戏房间后自动请求 Voice Token 并连接

### Step 5: UI 组件
- [ ] 创建 `client/src/components/VoiceOverlay.tsx`（悬浮语音控件）
- [ ] 麦克风按钮（静音/取消静音）
- [ ] 说话指示器（谁在说话时头像高亮）
- [ ] 连接状态 + 阶段静音提示
- [ ] 集成到 `GamePage.tsx`

### Step 6: 阶段联动
- [ ] 客户端收到阶段变更时自动控制本地静音状态
- [ ] 服务端在阶段切换时通过 LiveKit API 强制控制权限
- [ ] 双重保障机制验证

### Step 7: 断线重连
- [ ] 重连时重新请求 Voice Token（带正确的当前阶段权限）
- [ ] LiveKit 自动重连机制验证
- [ ] 降级提示（LiveKit 不可用时）

### Step 8: 测试验证
- [ ] 本地多标签页测试语音通话
- [ ] 阶段切换静音/解静音验证
- [ ] 断线重连语音恢复验证
- [ ] 手机浏览器测试（需 HTTPS）

## 八、已知风险与对策

| 风险 | 影响 | 对策 |
|------|------|------|
| 移动端浏览器麦克风权限 | 用户可能拒绝授权 | 提示引导 + 降级到文字 |
| 局域网测试需 HTTPS | WebRTC 限制 | 使用 localhost 或 ngrok |
| LiveKit Server 宕机 | 无语音 | 降级到纯文字，不阻塞游戏 |
| 低带宽环境 | 语音卡顿 | LiveKit 自适应码率 + 降级提示 |
| iOS Safari 自动播放限制 | 听不到声音 | 需用户交互触发音频上下文 |

## 九、文件变更清单预览

```
新增文件:
  server/.env                              -- LiveKit 配置
  server/src/voice/tokenService.ts         -- Token 生成
  server/src/voice/roomController.ts       -- 房间权限控制
  client/src/hooks/useVoice.ts             -- LiveKit 客户端 Hook
  client/src/components/VoiceOverlay.tsx   -- 语音 UI 组件

修改文件:
  shared/events.ts                         -- 新增语音相关事件
  shared/types.ts                          -- 新增语音状态类型（可选）
  server/src/game/GameRoom.ts              -- 阶段切换集成语音控制
  server/src/socket/gameHandler.ts         -- Token 请求处理
  client/src/pages/GamePage.tsx            -- 集成 VoiceOverlay
  client/src/hooks/useSocket.ts            -- 语音 Token 请求触发
  server/package.json                      -- 新依赖
  client/package.json                      -- 新依赖
```
