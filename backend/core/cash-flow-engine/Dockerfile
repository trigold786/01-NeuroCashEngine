FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps --only=production
COPY . .
RUN npm run build
EXPOSE 3005
CMD ["npm", "start"]
