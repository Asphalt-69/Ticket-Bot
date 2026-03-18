FROM node:20-slim
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
WORKDIR /app/client
RUN npm install
RUN npm run build

WORKDIR /app
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "index.js"]
