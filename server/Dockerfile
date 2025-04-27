# ┌───────────────────────────────────────────────┐
# │  Stage 1: build (com devDependencies)          │
# └───────────────────────────────────────────────┘
FROM node:18-alpine AS builder
WORKDIR /app

# 1) Copia package.json E package-lock.json
COPY package.json package-lock.json ./

# 2) Instala todas dependências (dev + prod) para compilar o TS
RUN npm ci

# 3) Copia o restante do projeto
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
COPY utils ./utils

# 4) Compila o TypeScript
RUN npx tsc

# ┌───────────────────────────────────────────────┐
# │  Stage 2: runtime (somente produção)           │
# └───────────────────────────────────────────────┘
FROM node:18-alpine AS runner
WORKDIR /app

# 5) Copia package.json E package-lock.json
COPY package.json package-lock.json ./

# 6) Instala só produção
ENV NODE_ENV=production
RUN npm ci --omit=dev --ignore-scripts

# 7) Copia o dist compilado
COPY --from=builder /app/dist ./dist

# 8) Variáveis de ambiente
ENV NODE_ENV=production
EXPOSE 4000

# 9) Inicia o app
CMD ["node", "dist/index.js"]
