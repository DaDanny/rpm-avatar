# Use Node.js official image
FROM node:18-slim

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Create non-root user for security
RUN groupadd -r nodeuser && useradd -r -g nodeuser nodeuser

# Create temp directory for audio files
RUN mkdir -p /app/temp-audio && chown -R nodeuser:nodeuser /app

# Switch to non-root user
USER nodeuser

# Expose port (Cloud Run will set this via PORT env var)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start application
CMD ["node", "src/server.js"] 