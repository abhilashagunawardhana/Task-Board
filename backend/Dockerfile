# ==========================================
# Stage 1: Build & Test Environment preparation
# ==========================================
FROM node:24-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy dependency definition files
COPY package*.json ./

# Install all packages (including development packages for tests) using clean-install
RUN npm ci

# Copy the rest of the application files
COPY . .

# ==========================================
# Stage 2: Production Runtime Environment
# ==========================================
FROM node:24-alpine

# Set working directory inside production image
WORKDIR /app

# Copy package descriptors again to install production modules
COPY package*.json ./

# Install only production dependencies (excludes jest, eslint, etc.) to keep image lightweight
RUN npm ci --only=production

# Copy server source code from host machine
COPY server.js ./

# Document that the backend listener runs on port 5000 inside the container
EXPOSE 5000

# Set Node environment flag to production
ENV NODE_ENV=production

# Define start execution process command
CMD ["node", "server.js"]
