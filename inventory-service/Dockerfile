# syntax=docker/dockerfile:1.7

FROM node:22-alpine3.21 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine3.21 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine3.21 AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:22-alpine3.21 AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 CMD wget -qO- "http://127.0.0.1:${PORT:-3001}/health" || exit 1
CMD ["node", "dist/main"]
