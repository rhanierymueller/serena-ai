# ┌───────────────────────────────────────────────┐
# │ Stage 1: Build (compilar TypeScript)           │
# └───────────────────────────────────────────────┘
FROM node:18-alpine AS builder
WORKDIR /app

# Copia package.json e package-lock.json
COPY package.json package-lock.json ./

# Instala dependências completas (prod + dev)
RUN npm ci

# Copia o restante do projeto
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
COPY utils ./utils

# Compila o TypeScript
RUN npm run build

# ┌───────────────────────────────────────────────┐
# │ Stage 2: Runtime (produção)                    │
# └───────────────────────────────────────────────┘
FROM node:18-alpine AS runner
WORKDIR /app

# Copia apenas o necessário
COPY package.json package-lock.json ./

# Instala apenas dependências de produção
ENV NODE_ENV=production
RUN npm ci --omit=dev --ignore-scripts

# Copia o que foi gerado na fase de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Prisma generate no runtime (se usar Prisma Client)
RUN npx prisma generate

# Porta e startup
EXPOSE 4000
CMD ["node", "dist/index.js"]
