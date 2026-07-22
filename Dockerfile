# syntax=docker.io/docker/dockerfile:1

FROM node:24-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN corepack enable

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# Install curl because it's required for coolify healthchecks
ENV PYTHONUNBUFFERED=1
RUN apk --no-cache add libc6-compat build-base curl
RUN ln -sf python3 /usr/bin/python

# Install dependencies only when needed
FROM base AS deps

WORKDIR /app

# Install dependencies
COPY package.json pnpm-*.yaml* ./
COPY patches/ ./patches/
COPY drizzle.config.ts ./drizzle.config.ts
COPY src/db/schema.ts ./src/db/schema.ts
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder

WORKDIR /app
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV CI=true
ENV NODE_ENV=production

RUN mkdir /app/data

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm exec drizzle-kit push
RUN pnpm run build

RUN rm /app/package.json

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/data ./data
COPY --from=builder /app/src/db/schema.ts ./src/db/schema.ts

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER root

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
