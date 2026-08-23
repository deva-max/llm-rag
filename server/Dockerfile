FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace metadata
COPY pnpm-workspace.yaml package.json ./
COPY server/package.json ./server/

# Install dependencies
RUN pnpm install --filter memory-context-rag-server...

# Copy server code
COPY server ./server

# Build TypeScript
RUN pnpm --filter memory-context-rag-server build

FROM node:20-alpine AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=builder /app/package.json ./
COPY --from=builder /app/server/package.json ./server/
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/node_modules ./server/node_modules

EXPOSE 5000

CMD ["node", "server/dist/index.js"]
