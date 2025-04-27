# Stage 1: build
FROM node:18-alpine AS builder
WORKDIR /app

# Copia pacotes
COPY package*.json ./

# Instala tudo (prod + dev)
RUN npm ci

# Copia o restante
COPY tsconfig.json ./
COPY src ./src
COPY utils ./utils
COPY prisma ./prisma

# Compila TypeScript para /dist
RUN npx tsc

# Stage 2: runtime
FROM node:18-alpine AS runner
WORKDIR /app

# Copia apenas pacotes
COPY package*.json ./

# Instala apenas deps de produção
RUN npm ci --omit=dev

# Copia apenas a build
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma

# Define variáveis
ENV NODE_ENV=production
EXPOSE 4000

# Inicia o app
CMD ["node", "dist/index.js"]
