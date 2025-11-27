FROM node:20-alpine

WORKDIR /app

# Copy package files from mcp-server directory
COPY packages/mcp-server/package*.json ./
RUN npm install --production --legacy-peer-deps

# Copy mcp-server source
COPY packages/mcp-server/ ./

RUN mkdir -p uploads && chown -R node:node /app

USER node

EXPOSE 4000

CMD ["npm", "start"]
