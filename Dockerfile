# Build stage
FROM node:20.10.0 as builder

WORKDIR /app

# Copy package files for better layer caching
COPY package*.json ./

# Install all dependencies including dev dependencies
RUN npm ci

# Copy only the necessary files for building
COPY tsconfig.json ./
COPY src/ ./src/

# Build the TypeScript application
RUN npm run build

# Production stage
FROM node:20.10.0-slim

# Set NODE_ENV to production
ENV NODE_ENV=production

WORKDIR /app

# Copy package files for production
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    # Add a non-root user for security
    apt-get update -qq && \
    apt-get install -y --no-install-recommends dumb-init && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    adduser --disabled-password --gecos "" nodeuser && \
    chown -R nodeuser:nodeuser /app

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist

# Switch to non-root user for security
USER nodeuser

EXPOSE 5000

# Add a health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Use dumb-init as PID 1 to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
