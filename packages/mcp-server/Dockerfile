FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production --legacy-peer-deps

COPY . .

RUN mkdir -p uploads

EXPOSE $PORT

CMD ["npm", "start"]