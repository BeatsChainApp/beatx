FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --production --legacy-peer-deps

# Copy source code
COPY . ./

# Ensure uploads dir permissions (created at runtime if missing)
RUN mkdir -p uploads && chown -R node:node /app

USER node

# Expose the port the app listens on (uses PORT env or 4000)
EXPOSE 4000

# Start server
CMD ["npm", "start"]
