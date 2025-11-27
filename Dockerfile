FROM node:20-alpine

WORKDIR /app

# Copy package files from the MCP package
COPY packages/mcp-server/package*.json ./

# Install production dependencies
RUN npm ci --production

# Copy source code
COPY packages/mcp-server/ ./

# Create uploads directory and set permissions
RUN mkdir -p uploads && chown -R node:node /app

USER node

# Expose the port the app listens on (uses PORT env or 4000)
EXPOSE 4000

# Start server
CMD ["npm", "start"]
