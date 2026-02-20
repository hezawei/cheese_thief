#!/usr/bin/env bash
set -euo pipefail

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 奶酪大盗 HTTPS 设置脚本
# 在 rebirth-nginx 中为 cheese.rebirthjourney.me
# 添加独立 SSL 证书和反向代理
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHEESE_DOMAIN="cheese.rebirthjourney.me"
NGINX_CONF="/root/rebirth_game/deployment/configs/nginx.conf"
SSL_DIR="/root/rebirth_game/ssl-certs"
WEBROOT="/root/rebirth_game/frontend/build"

echo "=========================================="
echo " 奶酪大盗 HTTPS 设置"
echo "=========================================="
echo ""

# ── Step 1: 检查 DNS ──
echo "[1/5] 检查 DNS 解析..."
RESOLVED_IP=$(dig +short "$CHEESE_DOMAIN" 2>/dev/null | head -1 || true)
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || true)

if [ -z "$RESOLVED_IP" ]; then
  echo ""
  echo "❌ $CHEESE_DOMAIN 尚未解析到任何 IP"
  echo ""
  echo "请先去你的域名 DNS 管理面板添加一条 A 记录："
  echo "   主机记录: cheese"
  echo "   记录类型: A"
  echo "   记录值:   $SERVER_IP"
  echo ""
  echo "添加后等待 DNS 生效（通常 1-5 分钟），然后重新运行本脚本。"
  exit 1
fi

if [ "$RESOLVED_IP" != "$SERVER_IP" ]; then
  echo "⚠️  $CHEESE_DOMAIN → $RESOLVED_IP，本机 IP 是 $SERVER_IP"
  read -p "   是否继续？(y/N) " -n 1 -r
  echo
  [[ $REPLY =~ ^[Yy]$ ]] || exit 1
fi
echo "✅ $CHEESE_DOMAIN → $RESOLVED_IP"

# ── Step 2: 安装 certbot ──
echo ""
echo "[2/5] 检查 certbot..."
if ! command -v certbot &>/dev/null; then
  echo "   安装 certbot..."
  apt update -qq && apt install -y -qq certbot
fi
echo "✅ certbot 已就绪"

# ── Step 3: 申请 SSL 证书 ──
echo ""
echo "[3/5] 申请 SSL 证书..."

# 备份 nginx.conf
BACKUP_CONF="${NGINX_CONF}.bak.$(date +%s)"
cp "$NGINX_CONF" "$BACKUP_CONF"
echo "   备份: $BACKUP_CONF"

# 在 HTTP block 的 server_name 加入 cheese 域名（用于 ACME challenge）
if ! grep -q "$CHEESE_DOMAIN" "$NGINX_CONF"; then
  sed -i "0,/server_name rebirthjourney.me www.rebirthjourney.me;/s//server_name rebirthjourney.me www.rebirthjourney.me $CHEESE_DOMAIN;/" "$NGINX_CONF"
  docker exec rebirth-nginx nginx -s reload
  echo "   HTTP block 已添加 $CHEESE_DOMAIN"
  sleep 2
fi

# 申请证书
if [ -f "/etc/letsencrypt/live/$CHEESE_DOMAIN/fullchain.pem" ]; then
  echo "   证书已存在，跳过"
else
  certbot certonly --webroot \
    -w "$WEBROOT" \
    -d "$CHEESE_DOMAIN" \
    --non-interactive \
    --agree-tos \
    --email "admin@rebirthjourney.me" \
    --no-eff-email
fi
echo "✅ SSL 证书就绪"

# ── Step 4: 复制证书 ──
echo ""
echo "[4/5] 复制证书..."
cp "/etc/letsencrypt/live/$CHEESE_DOMAIN/fullchain.pem" "$SSL_DIR/cheese-fullchain.pem"
cp "/etc/letsencrypt/live/$CHEESE_DOMAIN/privkey.pem" "$SSL_DIR/cheese-privkey.pem"
echo "✅ 证书已复制到 $SSL_DIR/"

# ── Step 5: 添加 HTTPS server block ──
echo ""
echo "[5/5] 添加 HTTPS 反向代理..."

if grep -q "cheese-fullchain.pem" "$NGINX_CONF"; then
  echo "   server block 已存在，跳过"
else
  # 使用 Python3 在 http{} 块最后的 } 之前插入新 server block
  python3 << 'PYEOF'
import sys

BLOCK = '''
    # ━━━ 奶酪大盗 (cheese.rebirthjourney.me) ━━━
    server {
        listen 443 ssl;
        http2 on;
        server_name cheese.rebirthjourney.me;

        ssl_certificate /etc/nginx/ssl/cheese-fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/cheese-privkey.pem;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:CheeseSSL:5m;
        server_tokens off;

        location / {
            proxy_pass http://172.17.0.1:9527;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 86400s;
            proxy_send_timeout 86400s;
        }
    }
'''

conf_path = "/root/rebirth_game/deployment/configs/nginx.conf"
with open(conf_path, 'r') as f:
    content = f.read()

# Insert before the last } (which closes the http block)
last_brace = content.rfind('}')
if last_brace == -1:
    print("ERROR: no closing brace found")
    sys.exit(1)

new_content = content[:last_brace] + BLOCK + '\n' + content[last_brace:]

with open(conf_path, 'w') as f:
    f.write(new_content)

print("   server block 已插入")
PYEOF
fi

# 验证并重载
docker exec rebirth-nginx nginx -t
docker exec rebirth-nginx nginx -s reload
echo "✅ nginx 已生效"

echo ""
echo "=========================================="
echo " ✅ 全部完成！"
echo "=========================================="
echo ""
echo " 🎮 游戏地址: https://$CHEESE_DOMAIN"
echo ""
echo " 手机浏览器打开即可玩，语音聊天正常。"
echo ""
echo " 回滚命令（如果出问题）："
echo "   cp $BACKUP_CONF $NGINX_CONF"
echo "   docker exec rebirth-nginx nginx -s reload"
echo ""
