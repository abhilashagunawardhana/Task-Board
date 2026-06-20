# ==========================================
# Stage 1: Compilation Environment (Node.js)
# ==========================================
FROM node:24-alpine AS builder

# Set directory inside building space
WORKDIR /app

# Copy dependency mappings
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci

# Copy full React source files
COPY . .

# Setup backend API url build-time argument.
# React processes environment variables during building to bake them into the compiled static JS.
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Compile optimization production assets
RUN npm run build

# ==========================================
# Stage 2: Production Hosting Server (Nginx)
# ==========================================
FROM nginx:alpine

# Copy compiled index.html & static files from Stage 1 into Nginx host directory
COPY --from=builder /app/build /usr/share/nginx/html

# Expose standard web traffic port
EXPOSE 80

# Execute Nginx in the foreground to keep the container running active
CMD ["nginx", "-g", "daemon off;"]
