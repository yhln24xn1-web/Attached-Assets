FROM node:20-alpine AS base
RUN npm install -g pnpm@9
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY tsconfig.base.json tsconfig.json ./
COPY lib/ ./lib/
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/bmt-decor/package.json ./artifacts/bmt-decor/
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .

RUN BASE_PATH=/ pnpm --filter @workspace/bmt-decor run build

RUN mkdir -p artifacts/api-server/public && \
    cp -r artifacts/bmt-decor/dist/public/. artifacts/api-server/public/

RUN pnpm --filter @workspace/api-server run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/artifacts/api-server/dist ./dist
COPY --from=builder /app/artifacts/api-server/public ./public

EXPOSE 3000

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
