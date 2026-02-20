# 奶酪大盗 — 部署指南

## 前置要求

- Linux 服务器（推荐 Ubuntu 22.04+）
- [Docker](https://docs.docker.com/engine/install/) + [Docker Compose](https://docs.docker.com/compose/install/)
- 开放端口：9527（默认，可自定义）

## 快速部署

### 1. 上传代码到服务器

```bash
# 方式一：git clone
git clone <your-repo-url> /opt/deskgame
cd /opt/deskgame

# 方式二：scp 上传
scp -r ./deskgame user@server:/opt/deskgame
```

### 2. 配置环境变量

```bash
cd /opt/deskgame/deploy
cp .env.production .env.production.local   # 可选：自定义配置
vim .env.production
```

**必须配置项：**
- 如果需要语音聊天，填写 `LIVEKIT_URL`、`LIVEKIT_API_KEY`、`LIVEKIT_API_SECRET`
- 不需要语音则留空即可

**可选配置项：**
- `WEB_PORT` — 外部访问端口，默认 `80`
- `NIGHT_ACTION_SECONDS` 等 — 游戏计时参数

### 3. 一键启动

```bash
cd /opt/deskgame/deploy
chmod +x deploy.sh
./deploy.sh
```

或手动执行：

```bash
cd /opt/deskgame/deploy
docker compose build
docker compose up -d
```

### 4. 访问游戏

用手机浏览器打开：

```
http://<你的服务器IP>:9527
```

如果改了端口：`http://<你的服务器IP>:<WEB_PORT>`

## 常用命令

```bash
cd /opt/deskgame/deploy

# 查看日志
docker compose logs -f

# 仅查看服务端日志
docker compose logs -f server

# 停止服务
docker compose down

# 重新构建并启动
docker compose up -d --build

# 查看运行状态
docker compose ps
```

## 更换端口

默认端口 `9527`，可自定义：

```bash
WEB_PORT=8888 docker compose up -d
```

或在 `deploy/` 目录创建 `.env` 文件写入：

```
WEB_PORT=8888
```

## 与其他项目共存

本项目完全隔离运行：
- **项目名称**：`cheese-thief`（所有容器和网络都有此前缀）
- **独立网络**：`cheese-net`，不影响其他 Docker 项目
- **容器名称**：`cheese-thief-server`、`cheese-thief-web`
- **端口**：默认 9527，不占用常用端口

## HTTPS（可选）

生产环境建议配置 HTTPS。推荐使用 Caddy 或 Certbot：

### 方案一：Caddy 反向代理（最简单）

在服务器安装 Caddy，将 `docker-compose.yml` 的 web 端口改为非 80（如 `8080:80`），然后配置 Caddyfile：

```
your-domain.com {
    reverse_proxy localhost:8080
}
```

Caddy 自动获取 SSL 证书。

### 方案二：Nginx + Let's Encrypt

将 `nginx.conf` 中添加 SSL 配置，挂载证书目录到容器内。

## 架构说明

```
┌─────────────────────────────────────────┐
│  手机浏览器                              │
│  http://your-server                      │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────── nginx (web) ─────────────────┐
│  :9527 → :80                             │
│  /             → 静态文件 (React SPA)    │
│  /socket.io/  → proxy → server:3001     │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────── Node.js (server) ────────────┐
│  :3001                                   │
│  Express + Socket.IO                     │
│  游戏逻辑 + WebSocket                   │
└─────────────────────────────────────────┘
```

## 故障排查

| 问题 | 排查方法 |
|------|---------|
| 页面打不开 | `docker compose ps` 确认容器运行中，`curl localhost/health` 检查 |
| WebSocket 连接失败 | `docker compose logs server` 查看报错 |
| 语音不工作 | 检查 `.env.production` 中 LiveKit 配置是否正确 |
| 端口被占用 | `WEB_PORT=8080 docker compose up -d` 换端口 |
