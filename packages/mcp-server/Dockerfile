FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production --legacy-peer-deps

COPY . ./

RUN mkdir -p uploads && chown -R node:node /app

USER node

EXPOSE 4000

CMD ["npm", "start"]
