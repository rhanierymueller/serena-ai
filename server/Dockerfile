FROM node:18-alpine AS builder
WORKDIR /app

# 1) Copia apenas package.json e package-lock.json primeiro
COPY package.json package-lock.json ./

# 2) Instala dependências (postinstall vai rodar depois)
RUN npm ci --ignore-scripts

# 3) Agora sim copia o resto
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
COPY utils ./utils

# 4) Roda build manualmente
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine AS runner
WORKDIR /app

COPY package.json package-lock.json ./
ENV NODE_ENV=production
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

RUN npx prisma generate

EXPOSE 4000
CMD ["node", "dist/index.js"]
