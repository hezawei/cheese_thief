#!/usr/bin/env bash
set -euo pipefail

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 奶酪大盗 — 统一部署管理脚本
#
# 用法:
#   ./deploy.sh          首次部署 / 重新构建
#   ./deploy.sh start    启动（不重新构建）
#   ./deploy.sh stop     停止所有服务 + 隧道
#   ./deploy.sh restart  重启（重新构建 + 隧道）
#   ./deploy.sh status   查看运行状态
#   ./deploy.sh logs     查看日志
#   ./deploy.sh url      显示当前隧道地址
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

GAME_PORT="${WEB_PORT:-9527}"
TUNNEL_PID_FILE="$SCRIPT_DIR/.tunnel.pid"
TUNNEL_LOG_FILE="$SCRIPT_DIR/.tunnel.log"
TUNNEL_URL_FILE="$SCRIPT_DIR/.tunnel.url"

# ── Docker Compose ──
COMPOSE="docker compose"
if ! docker compose version &>/dev/null 2>&1; then
  if docker-compose version &>/dev/null 2>&1; then
    COMPOSE="docker-compose"
  else
    echo "❌ Docker Compose 未安装"; exit 1
  fi
fi

# ── cloudflared 查找/安装 ──
find_cloudflared() {
  if command -v cloudflared &>/dev/null; then
    echo "$(which cloudflared)"
  elif [ -f /usr/local/bin/cloudflared ]; then
    echo "/usr/local/bin/cloudflared"
  else
    echo ""
  fi
}

install_cloudflared() {
  local cf
  cf=$(find_cloudflared)
  if [ -n "$cf" ]; then
    chmod +x "$cf"
    echo "$cf"
    return
  fi
  echo "📦 安装 cloudflared..." >&2
  curl -sL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
  chmod +x /usr/local/bin/cloudflared
  echo "/usr/local/bin/cloudflared"
}

# ── 隧道管理 ──
tunnel_running() {
  [ -f "$TUNNEL_PID_FILE" ] && kill -0 "$(cat "$TUNNEL_PID_FILE")" 2>/dev/null
}

start_tunnel() {
  if tunnel_running; then
    echo "   隧道已在运行 (PID $(cat "$TUNNEL_PID_FILE"))"
    show_tunnel_url
    return
  fi

  local cf
  cf=$(install_cloudflared)

  echo "🌐 启动 HTTPS 隧道（后台运行）..."
  nohup "$cf" tunnel --url "http://localhost:$GAME_PORT" > "$TUNNEL_LOG_FILE" 2>&1 &
  echo $! > "$TUNNEL_PID_FILE"

  # 等待隧道分配 URL（最多 30 秒）
  local i=0
  while [ $i -lt 30 ]; do
    if grep -qoP 'https://[a-z0-9-]+\.trycloudflare\.com' "$TUNNEL_LOG_FILE" 2>/dev/null; then
      local url
      url=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' "$TUNNEL_LOG_FILE" | head -1)
      echo "$url" > "$TUNNEL_URL_FILE"
      echo ""
      echo "=========================================="
      echo " 🎮 游戏地址（HTTPS）:"
      echo ""
      echo "    $url"
      echo ""
      echo " 手机浏览器打开即可玩"
      echo "=========================================="
      return
    fi
    sleep 1
    i=$((i + 1))
  done

  echo "⚠️  隧道启动中，稍后运行 ./deploy.sh url 查看地址"
}

stop_tunnel() {
  if tunnel_running; then
    kill "$(cat "$TUNNEL_PID_FILE")" 2>/dev/null || true
    rm -f "$TUNNEL_PID_FILE" "$TUNNEL_URL_FILE"
    echo "   隧道已停止"
  fi
}

show_tunnel_url() {
  if [ -f "$TUNNEL_URL_FILE" ]; then
    echo ""
    echo " 🎮 游戏地址: $(cat "$TUNNEL_URL_FILE")"
    echo ""
  elif [ -f "$TUNNEL_LOG_FILE" ]; then
    local url
    url=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' "$TUNNEL_LOG_FILE" 2>/dev/null | head -1 || true)
    if [ -n "$url" ]; then
      echo "$url" > "$TUNNEL_URL_FILE"
      echo ""
      echo " 🎮 游戏地址: $url"
      echo ""
    else
      echo " ⚠️  隧道地址尚未分配，请稍后重试"
    fi
  else
    echo " ❌ 隧道未运行"
  fi
}

# ── 命令 ──
cmd_deploy() {
  echo "🔨 构建镜像..."
  $COMPOSE build

  echo "🚀 启动容器..."
  $COMPOSE up -d

  start_tunnel

  echo ""
  echo "✅ 部署完成！"
  echo "   隧道日志: tail -f $TUNNEL_LOG_FILE"
  echo "   服务日志: cd deploy && $COMPOSE logs -f"
}

cmd_start() {
  echo "🚀 启动容器..."
  $COMPOSE up -d
  start_tunnel
  echo "✅ 已启动"
}

cmd_stop() {
  echo "🛑 停止所有服务..."
  stop_tunnel
  $COMPOSE down
  echo "✅ 已停止"
}

cmd_restart() {
  echo "🔄 重启..."
  stop_tunnel
  $COMPOSE up -d --build
  start_tunnel
  echo "✅ 重启完成"
}

cmd_status() {
  echo "── 容器状态 ──"
  $COMPOSE ps
  echo ""
  echo "── 隧道状态 ──"
  if tunnel_running; then
    echo "   运行中 (PID $(cat "$TUNNEL_PID_FILE"))"
    show_tunnel_url
  else
    echo "   未运行"
  fi
}

cmd_logs() {
  $COMPOSE logs -f
}

cmd_url() {
  show_tunnel_url
}

# ── 入口 ──
ACTION="${1:-deploy}"

case "$ACTION" in
  deploy|"")  cmd_deploy ;;
  start)      cmd_start ;;
  stop)       cmd_stop ;;
  restart)    cmd_restart ;;
  status)     cmd_status ;;
  logs)       cmd_logs ;;
  url)        cmd_url ;;
  *)
    echo "用法: ./deploy.sh [deploy|start|stop|restart|status|logs|url]"
    exit 1
    ;;
esac
