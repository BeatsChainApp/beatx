FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Use production environment
ENV NODE_ENV=production

# Install dependencies (use package-lock if present)
COPY package*.json ./
RUN npm ci --production --legacy-peer-deps

# Copy source
COPY . .

# Expose port
EXPOSE 4000

# Start the server
CMD ["node", "src/index.js"]
