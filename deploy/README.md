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

## HTTPS 部署（语音聊天必须）

> **重要**：手机浏览器要求 HTTPS 才能使用麦克风。如果需要语音聊天功能，必须使用 HTTPS 部署。

### 前置要求

- 一个域名（或子域名），已解析到你的服务器 IP
- 服务器开放 80 和 443 端口（Caddy 自动获取 SSL 证书需要）

### 部署步骤

```bash
cd /opt/deskgame/deploy

# 1. 在 .env.production 底部添加域名
echo "DOMAIN=cheese.yourdomain.com" >> .env.production

# 2. 使用 HTTPS 配置启动（Caddy 自动获取 SSL 证书）
docker compose -f docker-compose.https.yml build
docker compose -f docker-compose.https.yml up -d
```

访问：`https://cheese.yourdomain.com`

Caddy 自动获取并续签 Let's Encrypt 证书，无需手动管理。

### 自定义 HTTPS 端口

如果 80/443 已被其他服务占用，有两种方案：

**方案 A**：用已有的反向代理（推荐）

保持 HTTP 模式（`docker-compose.yml`，端口 9527），在你的主 Nginx/Caddy 中添加：

```nginx
# Nginx 配置示例
server {
    listen 443 ssl;
    server_name cheese.yourdomain.com;

    ssl_certificate     /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:9527;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
    }
}
```

**方案 B**：HTTPS 用其他端口

```bash
HTTP_PORT=9080 HTTPS_PORT=9443 docker compose -f docker-compose.https.yml up -d
```

然后访问：`https://cheese.yourdomain.com:9443`

（注：Caddy 自动获取证书的 HTTP-01 挑战需要 80 端口，此时需要用 DNS 挑战或手动证书）

## 两种部署模式对比

| | HTTP 模式 | HTTPS 模式 |
|---|-----------|------------|
| 配置文件 | `docker-compose.yml` | `docker-compose.https.yml` |
| 默认端口 | 9527 | 80 + 443 |
| 前端服务 | nginx | Caddy（自动 SSL） |
| 语音聊天 | ❌ 手机不支持 | ✅ 正常使用 |
| 需要域名 | 否 | 是 |
| 适用场景 | 开发测试 / 已有反代 | 独立生产部署 |

## 架构说明

### HTTP 模式
```
┌─────────── 手机浏览器 ─────────────────┐
│  http://server-ip:9527                   │
└────────────┬────────────────────────────┘
             ▼
┌─────────── nginx (web) ─────────────────┐
│  :9527 → :80                             │
│  /             → 静态文件 (React SPA)    │
│  /socket.io/  → proxy → server:3001     │
└────────────┬────────────────────────────┘
             ▼
┌─────────── Node.js (server) ────────────┐
│  :3001  Express + Socket.IO              │
└─────────────────────────────────────────┘
```

### HTTPS 模式
```
┌─────────── 手机浏览器 ─────────────────┐
│  https://cheese.yourdomain.com           │
└────────────┬────────────────────────────┘
             ▼
┌─────────── Caddy (web) ────────────────┐
│  :443 (auto SSL) + :80 (redirect)       │
│  /             → 静态文件 (React SPA)   │
│  /socket.io/  → proxy → server:3001    │
└────────────┬────────────────────────────┘
             ▼
┌─────────── Node.js (server) ────────────┐
│  :3001  Express + Socket.IO              │
└─────────────────────────────────────────┘
```

## 故障排查

| 问题 | 排查方法 |
|------|---------|
| 页面打不开 | `docker compose ps` 确认容器运行中，`curl localhost/health` 检查 |
| WebSocket 连接失败 | `docker compose logs server` 查看报错 |
| 语音不工作（手机） | 必须使用 HTTPS 部署，手机浏览器要求 HTTPS 才能使用麦克风 |
| 语音不工作（HTTPS 已配置） | 检查 `.env.production` 中 LiveKit 配置是否正确 |
| SSL 证书获取失败 | 确认域名已解析到服务器、80 端口可访问 |
| 端口被占用 | HTTP: `WEB_PORT=8080`；HTTPS: `HTTP_PORT=9080 HTTPS_PORT=9443` |
