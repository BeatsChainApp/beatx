FROM node:20-alpine

WORKDIR /app

# Copy MCP server package files
COPY packages/mcp-server/package*.json ./packages/mcp-server/
WORKDIR /app/packages/mcp-server

# Install dependencies
RUN npm install

# Copy MCP server source
COPY packages/mcp-server/src ./src
COPY packages/mcp-server/migrations ./migrations

# Expose port
EXPOSE 4000

# Start the server
CMD ["npm", "start"]