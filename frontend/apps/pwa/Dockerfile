FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY shared/package.json ./shared/
COPY apps/pwa/package.json ./apps/pwa/
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build -w @nce/shared
WORKDIR /app/apps/pwa
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/apps/pwa/dist /usr/share/nginx/html
COPY apps/pwa/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
