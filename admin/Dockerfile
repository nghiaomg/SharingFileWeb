# Stage 1: Build the Vite app
FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_URL

COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install

COPY . .
RUN corepack enable pnpm && pnpm --filter admin exec vite build --mode production

# Stage 2: Serve static files using Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
