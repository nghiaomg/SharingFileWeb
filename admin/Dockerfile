# Stage 1: Build the Vite app
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install

COPY . .
RUN corepack enable pnpm && pnpm run build

# Stage 2: Serve static files using Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
