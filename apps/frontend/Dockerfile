# OMNIX AI - Multi-stage Production Dockerfile
# Optimized for security, performance, and minimal attack surface

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./
COPY .npmrc* ./

# Install dependencies
RUN npm ci --only=production --ignore-scripts

# Copy source code
COPY . .

# Build arguments
ARG NODE_ENV=production
ARG VITE_API_BASE_URL
ARG VITE_API_KEY
ARG VITE_WEBSOCKET_URL
ARG VITE_ENVIRONMENT=production

# Set environment variables
ENV NODE_ENV=${NODE_ENV}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_API_KEY=${VITE_API_KEY}
ENV VITE_WEBSOCKET_URL=${VITE_WEBSOCKET_URL}
ENV VITE_ENVIRONMENT=${VITE_ENVIRONMENT}

# Build the application
RUN npm run build

# Validate build
RUN node scripts/validate-build.js

# Production stage
FROM nginx:1.25-alpine AS production

# Install security updates
RUN apk upgrade --no-cache && \
    apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S omnix -u 1001 -G nodejs

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/security-headers.conf /etc/nginx/conf.d/security-headers.conf

# Copy built application from builder stage
COPY --from=builder --chown=omnix:nodejs /app/dist /usr/share/nginx/html

# Copy health check script
COPY docker/health-check.sh /usr/local/bin/health-check.sh
RUN chmod +x /usr/local/bin/health-check.sh

# Set proper permissions
RUN chown -R omnix:nodejs /usr/share/nginx/html && \
    chown -R omnix:nodejs /var/cache/nginx && \
    chown -R omnix:nodejs /var/log/nginx && \
    chown -R omnix:nodejs /etc/nginx/conf.d

# Create nginx directories with proper permissions
RUN mkdir -p /var/cache/nginx/client_temp \
             /var/cache/nginx/proxy_temp \
             /var/cache/nginx/fastcgi_temp \
             /var/cache/nginx/uwsgi_temp \
             /var/cache/nginx/scgi_temp && \
    chown -R omnix:nodejs /var/cache/nginx

# Switch to non-root user
USER omnix

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD /usr/local/bin/health-check.sh

# Labels for metadata
LABEL org.opencontainers.image.title="OMNIX AI Frontend"
LABEL org.opencontainers.image.description="Production-ready React frontend for OMNIX AI"
LABEL org.opencontainers.image.vendor="OMNIX AI"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.source="https://github.com/omnix-ai/frontend"

# Start nginx
CMD ["nginx", "-g", "daemon off;"]