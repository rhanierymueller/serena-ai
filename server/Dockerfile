# ┌───────────────────────────────────────────────┐
# │  Stage 1: build (com devDependencies)          │
# └───────────────────────────────────────────────┘
FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
COPY utils ./utils

RUN npx tsc

# ┌───────────────────────────────────────────────┐
# │  Stage 2: runtime (somente produção)           │
# └───────────────────────────────────────────────┘
FROM node:18-alpine AS runner
WORKDIR /app

COPY package.json package-lock.json ./
ENV NODE_ENV=production
RUN npm ci --omit=dev --ignore-scripts

# Copia o dist compilado E o schema do Prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000
CMD ["node", "dist/index.js"]
