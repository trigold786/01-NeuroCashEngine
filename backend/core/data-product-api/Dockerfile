FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps --only=production
COPY . .
RUN npm run build
EXPOSE 3007
CMD ["npm", "start"]
