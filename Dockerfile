# Build the Vite client, then run the Hono server that serves both the API and
# the compiled SPA. Cloud Run supplies PORT at runtime.
FROM node:22-alpine AS build

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . ./
RUN pnpm build

FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

# `tsx` is intentionally retained: the server TypeScript runs directly and
# the production image has no package manager or build toolchain.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/server ./server
COPY --from=build /app/src ./src
COPY --from=build /app/dist ./dist

EXPOSE 8080
CMD ["node_modules/.bin/tsx", "server/index.ts"]
