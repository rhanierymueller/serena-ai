# Stage 1: build
FROM node:18-alpine AS builder
WORKDIR /app

# Instala dependências e copia TypeScript config
COPY package*.json tsconfig.json ./
RUN npm ci

# Copia o código-fonte e gera o dist
COPY src ./src
COPY utils ./utils
RUN npm run build

# Stage 2: runtime
FROM node:18-alpine
WORKDIR /app

# Instala só as deps de produção
COPY package*.json ./
RUN npm ci --omit=dev

# Traz só o dist gerado no builder
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
EXPOSE 4000

# Comando de inicialização
CMD ["node", "dist/index.js"]
