# ── Stage 1: Build client ─────────────────────────────────
FROM node:20-alpine AS build-client
WORKDIR /app

COPY shared/ ./shared/
COPY client/package.json client/package-lock.json ./client/
WORKDIR /app/client
RUN npm ci

COPY client/ ./
# In production, socket.io connects to same origin (nginx proxies to server)
ARG VITE_SERVER_URL=/
ENV VITE_SERVER_URL=$VITE_SERVER_URL
RUN npm run build


# ── Stage 2: Build server (esbuild bundle) ────────────────
FROM node:20-alpine AS build-server
WORKDIR /app

# Root deps (dotenv etc.)
COPY package.json package-lock.json ./
RUN npm ci

# Server deps
COPY shared/ ./shared/
COPY server/package.json server/package-lock.json ./server/
WORKDIR /app/server
RUN npm ci && npm install --no-save esbuild
COPY server/ ./

# Bundle: inline dotenv + shared code, keep npm packages external
RUN npx esbuild src/index.ts --bundle --platform=node --target=node20 \
    --format=cjs --outfile=dist/index.cjs \
    --external:express --external:cors --external:socket.io \
    --external:livekit-server-sdk --external:uuid


# ── Target: web (nginx serves client + proxies API) ──────
FROM nginx:alpine AS web
COPY --from=build-client /app/client/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80


# ── Target: web-caddy (Caddy with auto HTTPS) ────────────
FROM caddy:alpine AS web-caddy
COPY --from=build-client /app/client/dist /srv/www
COPY deploy/Caddyfile /etc/caddy/Caddyfile
EXPOSE 80 443


# ── Target: server (Node.js game server) ─────────────────
FROM node:20-alpine AS server
WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build-server /app/server/dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.cjs"]
