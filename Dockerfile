FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY packages/mcp-server/package*.json ./

# Install dependencies
RUN npm install --production --legacy-peer-deps

# Copy source
COPY packages/mcp-server/ ./

# Setup
RUN mkdir -p uploads && chown -R node:node /app

USER node

EXPOSE 4000

CMD ["npm", "start"]