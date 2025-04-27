# ┌───────────────────────────────────────────────┐
# │  Stage 1: build (compilar TypeScript)          │
# └───────────────────────────────────────────────┘
FROM node:18-alpine AS builder
WORKDIR /app

# 1) Copia package.json e lockfile
COPY package.json package-lock.json ./

# 2) Instala dependências completas (prod + dev)
RUN npm ci

# 3) Copia o restante do código
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
COPY utils ./utils

# 4) Compila TypeScript
RUN npx tsc

# ┌───────────────────────────────────────────────┐
# │  Stage 2: runtime (somente produção)           │
# └───────────────────────────────────────────────┘
FROM node:18-alpine AS runner
WORKDIR /app

# 5) Copia só o necessário
COPY package.json package-lock.json ./

# 6) Instala apenas production dependencies
ENV NODE_ENV=production
RUN npm ci --omit=dev --ignore-scripts

# 7) Copia o que foi gerado
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# 8) Gera Prisma Client para produção
RUN npx prisma generate

# 9) Expõe porta e inicia app
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/index.js"]
