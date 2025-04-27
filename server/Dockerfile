# ┌───────────────────────────────────────────────┐
# │  Stage 1: build (com devDependencies)        │
# └───────────────────────────────────────────────┘
FROM node:18-alpine AS builder
WORKDIR /app

# 1) Copia só package.json e lockfile
COPY package*.json ./

# 2) Instala tudo (prod + dev) para o TS poder compilar
RUN npm ci

# 3) Copia o restante do código
COPY tsconfig.json ./
COPY src ./src
COPY utils ./utils

# 4) Roda a compilação
RUN npx tsc

# ┌───────────────────────────────────────────────┐
# │  Stage 2: runtime (apenas produção)          │
# └───────────────────────────────────────────────┘
FROM node:18-alpine AS runner
WORKDIR /app

# 5) Copia package.json para instalar só prod-deps
COPY package*.json ./

# 6) Instala apenas production dependencies
RUN npm ci --omit=dev

# 7) Traz o dist compilado pelo builder
COPY --from=builder /app/dist ./dist

# 8) Variáveis de ambiente e porta
ENV NODE_ENV=production
EXPOSE 4000

# 9) Inicia o servidor
CMD ["node", "dist/index.js"]
