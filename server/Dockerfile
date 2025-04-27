# ┌───────────────────────────────────────────────┐
# │   Stage 1: build (apenas instalando TS)      │
# └───────────────────────────────────────────────┘
FROM node:18-alpine AS builder
WORKDIR /app

# 1) Instala apenas o TypeScript e o gerador de tipos
#    Isso é super leve e evita OOM no npm ci
RUN npm install typescript --no-package-lock --no-audit --no-fund

# 2) Copia tsconfig e só o código fonte
COPY tsconfig.json ./
COPY src ./src
COPY utils ./utils

# 3) Compila o TypeScript para dist/
RUN npx tsc

# ┌───────────────────────────────────────────────┐
# │   Stage 2: runtime (apenas produção)         │
# └───────────────────────────────────────────────┘
FROM node:18-alpine AS runner
WORKDIR /app

# 4) Copia package.json para instalar só prod-deps
COPY package*.json ./

# 5) Instala apenas dependências de produção
RUN npm ci --omit=dev

# 6) Traz o dist compilado do builder
COPY --from=builder /app/dist ./dist

# 7) Variáveis de ambiente etc
ENV NODE_ENV=production
EXPOSE 4000

# 8) Inicializa seu servidor
CMD ["node", "dist/index.js"]
