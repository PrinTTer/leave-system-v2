# Stage 1: install dependencies (cacheable)
FROM node:22-alpine AS deps
WORKDIR /app

# copy only package files first for better caching
COPY package*.json ./
# ถ้ามี lock file ให้แน่ใจว่าคัดมาด้วย (package-lock.json)
RUN npm ci

# Stage 2: build the app (needs dev deps)
FROM node:22-alpine AS builder
WORKDIR /app
# reuse installed node_modules to speed up
COPY --from=deps /app/node_modules ./node_modules
# copy rest of source
COPY . .
# build production assets
RUN npm run build

# Stage 3: runtime - keep image small (only prod deps + build output)
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# copy built app and public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# copy package files to install prod deps
COPY --from=builder /app/package*.json ./
# install only production deps (package-lock.json ถ้ามี จะใช้ด้วย)
RUN npm ci --omit=dev

# next.js default port
EXPOSE 3000
# start in production mode
CMD ["npm", "run", "start"]