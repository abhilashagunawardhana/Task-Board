# Stage 1: Build & test preparation
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Stage 2: Production runtime
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Copy server code
COPY server.js ./

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "server.js"]
