#!/usr/bin/env bash
set -euo pipefail

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 奶酪大盗 — Cloudflare Tunnel 启动脚本
# 一条命令获取 HTTPS 访问地址
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GAME_PORT="${WEB_PORT:-9527}"

# 查找 cloudflared
CLOUDFLARED=""
if command -v cloudflared &>/dev/null; then
  CLOUDFLARED="$(which cloudflared)"
elif [ -f /usr/local/bin/cloudflared ]; then
  CLOUDFLARED="/usr/local/bin/cloudflared"
fi

if [ -n "$CLOUDFLARED" ]; then
  chmod +x "$CLOUDFLARED"
  echo "✅ cloudflared 已存在: $CLOUDFLARED"
else
  CLOUDFLARED="/usr/local/bin/cloudflared"
  echo "📦 安装 cloudflared..."
  curl -sL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o "$CLOUDFLARED"
  chmod +x "$CLOUDFLARED"
  echo "✅ 安装完成"
fi

echo ""
echo "🚀 启动 HTTPS 隧道..."
echo "   本地端口: $GAME_PORT"
echo ""
echo "   等待分配 HTTPS 地址..."
echo "   (地址会在下面显示，把它发到群里让大家访问)"
echo ""

"$CLOUDFLARED" tunnel --url "http://localhost:$GAME_PORT" 2>&1 | while IFS= read -r line; do
  # 提取并高亮显示隧道 URL
  if echo "$line" | grep -qoP 'https://[a-z0-9-]+\.trycloudflare\.com'; then
    URL=$(echo "$line" | grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com')
    echo ""
    echo "=========================================="
    echo " 🎮 游戏地址（HTTPS）:"
    echo ""
    echo "    $URL"
    echo ""
    echo " 手机浏览器打开即可玩"
    echo " 语音聊天正常可用"
    echo " Ctrl+C 停止隧道"
    echo "=========================================="
    echo ""
  fi
  echo "$line"
done
