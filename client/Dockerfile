FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace metadata
COPY pnpm-workspace.yaml package.json ./
COPY client/package.json ./client/

# Install dependencies
RUN pnpm install --filter memory-context-rag-client...

# Copy client source
COPY client ./client

# Build Vite static assets
RUN pnpm --filter memory-context-rag-client build

FROM nginx:alpine AS runner

COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
